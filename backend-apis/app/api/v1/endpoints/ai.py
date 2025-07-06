import os
import json
import re
import asyncio
from typing import Any, Dict, List, Optional, AsyncIterator
from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app import models, schemas
from app.api.v1 import deps
from app.core.config import settings

# Import Azure OpenAI SDK for Python
import openai
from openai import AzureOpenAI

router = APIRouter()

# Define Pydantic models for request/response schemas
class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    tenant_name: Optional[str] = None

class ChatResponse(BaseModel):
    message: ChatMessage
    suggestions: List[str] = []

class StreamingChatRequest(ChatRequest):
    stream: bool = True

class OfferFillRequest(BaseModel):
    tenant_name: str
    offer_type: str
    offer_attributes: Dict[str, Any]

class OfferFillResponse(BaseModel):
    description: str
    comments: str = ""
    attribute_values: Dict[str, Any]
    custom_attributes: Dict[str, Any] = Field(default_factory=dict)

class CampaignFillRequest(BaseModel):
    tenant_name: str
    offer_details: Dict[str, Any]

class SelectionCriterion(BaseModel):
    criterion: str
    operator: str
    value: str

class CampaignFillResponse(BaseModel):
    name: str
    description: str
    selection_criteria: List[SelectionCriterion]

# Initialize Azure OpenAI client
def get_azure_openai_client():
    azure_endpoint = settings.AZURE_ENDPOINT
    azure_api_key = settings.AZURE_API_KEY
    api_version = settings.AZURE_API_VERSION
    
    if not azure_endpoint or not azure_api_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Azure OpenAI configuration is missing"
        )
    
    try:
        client = AzureOpenAI(
            azure_endpoint=azure_endpoint,
            api_key=azure_api_key,
            api_version=api_version
        )
        return client
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Failed to initialize Azure OpenAI client: {str(e)}"
        )

# Helper to format response text (remove markdown)
def format_response_text(text: str) -> str:
    # Replace markdown headings with plain text
    formatted = re.sub(r"^#{1,6}\s+(.+)$", r"\1", text, flags=re.MULTILINE)
    
    # Replace bullet points with plain dash bullets
    formatted = re.sub(r"^\*\s+(.+)$", r"• \1", formatted, flags=re.MULTILINE)
    formatted = re.sub(r"^-\s+(.+)$", r"• \1", formatted, flags=re.MULTILINE)

    # Replace numbered lists with plain text
    formatted = re.sub(r"^\d+\.\s+(.+)$", r"\1", formatted, flags=re.MULTILINE)
    
    # Replace bold text
    formatted = re.sub(r"\*\*(.+?)\*\*", r"\1", formatted)
    
    # Replace italic text
    formatted = re.sub(r"\*(.+?)\*", r"\1", formatted)
    
    # Replace code blocks with plain text
    def replace_code_block(match):
        return re.sub(r"```(?:.*\n)?|```", "", match.group(0))
    
    formatted = re.sub(r"```[\s\S]*?```", replace_code_block, formatted)
    
    # Replace inline code with plain text
    formatted = re.sub(r"`(.+?)`", r"\1", formatted)
    
    return formatted

# Function to prepare conversation for chat endpoints
def prepare_conversation(
    request,
    db: Session,
    current_user: models.User
):
    # Get tenant information if provided
    tenant = None
    if request.tenant_name:
        tenant = deps.get_tenant_by_name_direct(db, request.tenant_name)

    # Get additional context (offers data)
    offers_data = []
    campaigns_data = []
    tenant_name = "unknown"
    if tenant:
        tenant_name = tenant.name
        # Fetch offers for this tenant (limit to 10 for context)
        offers = db.query(models.Offer).filter(
            models.Offer.tenant_name == tenant.name
        ).limit(10).all()
        
        offers_data = [
            {
                "id": offer.id,
                "description": offer.data.get("offer_description", ""),
                "type": offer.data.get("offer_type", ""),
                "status": offer.status,
                "attributes": offer.data or {}
            }
            for offer in offers
        ]
        
        # Fetch campaigns for this tenant (limit to 10 for context)
        campaigns = db.query(models.Campaign).filter(
            models.Campaign.tenant_name == tenant.name
        ).limit(10).all()
        
        campaigns_data = [
            {
                "id": campaign.id,
                "name": campaign.name,
                "description": campaign.description,
                "offer_id": campaign.offer_id,
                "status": campaign.status,
                "selection_criteria": campaign.selection_criteria,
                "start_date": str(campaign.start_date),
                "end_date": str(campaign.end_date)
            }
            for campaign in campaigns
        ]
    
    # Prepare the system prompt with context
    formatted_tenant_name = tenant_name.split('_')
    formatted_tenant_name = ' '.join([part.capitalize() for part in formatted_tenant_name])
    
    # Get the current user's full name and role information
    user_full_name = current_user.full_name or current_user.username
    user_roles = []
    
    if tenant:
        # Get user roles for the current tenant
        user_tenant_roles = db.query(models.UserTenantRole).filter(
            models.UserTenantRole.username == current_user.username,
            models.UserTenantRole.tenant_name == tenant.name
        ).all()
        
        user_roles = [utr.role for utr in user_tenant_roles]
    
    # Add super admin info if applicable
    is_super_admin = current_user.is_super_admin
    if is_super_admin:
        user_roles.append("super_admin")
    
    user_role_text = ", ".join(user_roles) if user_roles else "no specific role"
    
    # Define system prompt with context about offers and campaigns
    system_prompt = f"""You are OffersHub AI, a specialized assistant for the OffersHub platform.
Your primary role is to help users navigate and utilize the OffersHub platform efficiently.

CURRENT CONTEXT:
- Current tenant: {formatted_tenant_name}
- Current user: {user_full_name} (username: {current_user.username})
- User roles: {user_role_text}
- Available offers: {len(offers_data)}
- Available campaigns: {len(campaigns_data)}

You can access the following data to provide specific information:
- Offers data with details on descriptions, types, status, and attributes
- Campaign data including name, description, status, selection criteria, and date ranges

CAMPAIGNS DATA MODEL:
- Campaigns are created based on offers and target specific customers
- Campaign statuses: draft, approved, active, paused, completed
- Each campaign has selection criteria for targeting customers, such as:
  - credit_score (number values, operators: >, <, =)
  - gender (values: male, female, other, operators: =, !)
  - is_active (values: true, false, operators: =)
  - occupation (values: salaried, self-employed, student, retired, operators: =)
  - marital_status (values: single, married, divorced, widowed, operators: =)
  - segment (values: premium, regular, corporate, operators: =, !)
  - deliquency (values: true, false, operators: =)
  - kyc_status (values: verified, pending, rejected, operators: =)
- Campaigns have start and end dates
- Campaign delivery statuses: pending, sent, declined, accepted

When asked about offers or campaigns, provide specific information from the context data.
For requests about listing campaigns, show a concise summary of available campaigns.
When asked about a specific campaign, provide its details including name, description, status, and selection criteria.

PERSONAL INTERACTION:
- Always address the user by their name ({user_full_name}) in your responses
- Tailor your responses based on the user's role: {user_role_text}
- Be friendly but professional, use the user's name occasionally to personalize the conversation

FORMATTING INSTRUCTIONS:
- DO NOT use markdown formatting in your responses.
- Use plain text instead of markdown headings.
- Use plain bullet points (•) instead of markdown bullets (* or -).
- Don't use markdown bold or italic formatting.
- Present information in a clean, readable format with proper spacing.
- For lists, simply use numbers or bullet points without markdown.

ABOUT OFFERSHUB:
OffersHub is a purpose-built platform for financial services companies to create, manage, and optimize personalized offers. It enables banks and financial institutions to deliver targeted promotions that enhance customer engagement, drive retention, and fuel growth.

Each tenant represents a financial product like "Credit Card", "Loan", etc. In each tenant, there will be offers created, and campaigns are created from these offers.

USER ACCESS MODEL:
- Users can belong to multiple user groups per tenant.
- Default user groups: admin, read_only, create, approver.
- A Super Admin can create tenants and manage users and their roles.

PLATFORM FLOW:
1. Super Admin creates a tenant → this auto-creates default user groups and prepares offer configuration.
2. Tenants have offer data stored in a common offers table with a flexible data JSONB field for custom attributes.
3. Offers are used to create campaigns with selection criteria to target specific customer segments.
4. Campaigns deliver offers to customers who match the selection criteria.
5. Customers can accept, decline, or ignore offers, and their responses are tracked.

Be brief, professional, and helpful. Format responses in a clear, readable manner.
Always respect user roles and permissions. Do not expose sensitive information."""

    # Process conversation with system prompt and context
    conversation = [{"role": "system", "content": system_prompt}]
    
    # Add context if we have offers or campaigns data
    if offers_data:
        context_message = "Here is the current offers data:\n" + json.dumps(offers_data, indent=2)
        conversation.append({"role": "system", "content": f"Context information (offers): {context_message}"})
    
    if campaigns_data:
        context_message = "Here is the current campaigns data:\n" + json.dumps(campaigns_data, indent=2)
        conversation.append({"role": "system", "content": f"Context information (campaigns): {context_message}"})
    
    # Add user conversation history
    for msg in request.messages:
        conversation.append({"role": msg.role, "content": msg.content})
        
    return conversation, tenant_name

# AI Chat Endpoint
@router.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
):
    """
    Process chat messages and generate AI responses
    """
    # Get Azure OpenAI client
    client = get_azure_openai_client()
    deployment = settings.AZURE_DEPLOYMENT
    
    if not deployment:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Azure OpenAI deployment name is missing"
        )
    
    # Prepare the conversation
    conversation, tenant_name = prepare_conversation(request, db, current_user)
    
    try:
        # Call Azure OpenAI
        response = client.chat.completions.create(
            model=deployment,
            messages=conversation,
            max_tokens=1000,
            temperature=0.7,
            top_p=0.95,
            frequency_penalty=0,
            presence_penalty=0
        )
        
        # Get the response content
        bot_response = response.choices[0].message.content
        
        # Format the response to remove markdown
        bot_response = format_response_text(bot_response)
        
        # Generate suggestions for follow-up questions
        suggestions_prompt = [
            {
                "role": "system", 
                "content": """
You are a suggestions generator for a chat system. Your job is to generate exactly 3 follow-up questions based on the conversation.

Based on the PREVIOUS CONVERSATION ONLY, generate exactly 3 follow-up questions that are:
1. DIRECTLY RELATED to the most recent message content and topics discussed
2. CONTEXTUALLY RELEVANT to the user's previous questions and interests
3. DIVERSE, covering different aspects of what was just discussed
4. SPECIFIC to the content of the conversation, not generic about OffersHub
5. CONCISE, under 10 words when possible

IMPORTANT: You MUST return ONLY a valid JSON object with this exact format:
{"suggestions": ["question 1", "question 2", "question 3"]}

NO explanation or other text before or after the JSON.
"""
            }
        ]
        suggestions_prompt.extend(conversation)
        suggestions_prompt.append({"role": "assistant", "content": bot_response})
        
        # Call Azure OpenAI for suggestions
        suggestions_response = client.chat.completions.create(
            model=deployment,
            messages=suggestions_prompt,
            max_tokens=250,
            temperature=0.7,
            response_format={"type": "json_object"}
        )
        
        suggestions_content = suggestions_response.choices[0].message.content
        
        # Parse suggestions
        suggestions = []
        try:
            # Log the raw response for debugging
            print(f"Raw suggestions response: {suggestions_content}")
            
            # Try multiple parsing approaches
            suggestions_data = json.loads(suggestions_content)
            
            # Handle various formats that might be returned
            if isinstance(suggestions_data, dict):
                if "suggestions" in suggestions_data:
                    suggestions = suggestions_data["suggestions"]
                elif "questions" in suggestions_data:
                    suggestions = suggestions_data["questions"]
                elif "followUpQuestions" in suggestions_data:
                    suggestions = suggestions_data["followUpQuestions"]
                else:
                    # Try to find any key that might contain an array of strings
                    for key, value in suggestions_data.items():
                        if isinstance(value, list) and all(isinstance(item, str) for item in value):
                            suggestions = value
                            break
            elif isinstance(suggestions_data, list):
                # If it's already a list, use it directly
                suggestions = suggestions_data
            
            # Ensure we have exactly 3 suggestions
            if len(suggestions) > 3:
                suggestions = suggestions[:3]
            while len(suggestions) < 3:
                # Add diverse fallback questions if we don't have enough
                fallback_questions = [
                    "Show me my active campaigns",
                    "How do I create a new targeted offer?",
                    "Explain campaign performance metrics",
                    "What targeting options are available?",
                    "How can I improve offer acceptance rates?",
                    "Show me campaign delivery statistics",
                    "How to analyze customer segments?",
                    "What are the best campaign settings?",
                    "Compare my top-performing campaigns",
                    "How to set up automated follow-ups?"
                ]
                # Pick a random question that's not already in suggestions
                import random
                for _ in range(10):  # Try up to 10 times to find unique questions
                    q = random.choice(fallback_questions)
                    if q not in suggestions:
                        suggestions.append(q)
                        break
                
                # If we still don't have enough, add a generic one
                if len(suggestions) < 3:
                    suggestions.append("How can I optimize my campaign strategy?")
        except Exception:
            # If parsing fails, provide default suggestions
            suggestions = [
                "Show me my active campaigns",
                "How do I create a new targeted offer?",
                "Explain campaign performance metrics"
            ]
        
        return {
            "message": {"role": "assistant", "content": bot_response},
            "suggestions": suggestions
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating AI response: {str(e)}"
        )

# Streaming Chat Endpoint
@router.post("/chat/stream")
async def stream_chat(
    request: StreamingChatRequest,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
):
    """
    Process chat messages and stream AI responses
    """
    # Get Azure OpenAI client
    client = get_azure_openai_client()
    deployment = settings.AZURE_DEPLOYMENT
    
    if not deployment:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Azure OpenAI deployment name is missing"
        )
    
    # Prepare the conversation
    conversation, tenant_name = prepare_conversation(request, db, current_user)
    
    async def generate_response() -> AsyncIterator[str]:
        try:
            # Initial JSON structure
            yield '{"type":"start"}\n'
            
            # Streaming the chat completion
            full_content = ""
            
            # Stream the response
            stream = client.chat.completions.create(
                model=deployment,
                messages=conversation,
                max_tokens=1000,
                temperature=0.7,
                stream=True,
                top_p=0.95,
                frequency_penalty=0,
                presence_penalty=0
            )
            
            for chunk in stream:
                if chunk.choices and len(chunk.choices) > 0:
                    content_delta = chunk.choices[0].delta.content
                    if content_delta is not None:
                        full_content += content_delta
                        formatted_delta = format_response_text(content_delta)
                        # Sending content chunk as SSE
                        yield json.dumps({"type":"chunk", "content": formatted_delta}) + "\n"
                        # Small delay to control streaming rate
                        await asyncio.sleep(0.01)
            
            # When streaming is complete, generate follow-up suggestions
            suggestions_prompt = [
                {
                    "role": "system", 
                    "content": """
You are a suggestions generator for a chat system. Your job is to generate exactly 3 follow-up questions based on the conversation.

Based on the PREVIOUS CONVERSATION ONLY, generate exactly 3 follow-up questions that are:
1. DIRECTLY RELATED to the most recent message content and topics discussed
2. CONTEXTUALLY RELEVANT to the user's previous questions and interests
3. DIVERSE, covering different aspects of what was just discussed
4. SPECIFIC to the content of the conversation, not generic about OffersHub
5. CONCISE, under 10 words when possible

IMPORTANT: You MUST return ONLY a valid JSON object with this exact format:
{"suggestions": ["question 1", "question 2", "question 3"]}

NO explanation or other text before or after the JSON.
"""
                }
            ]
            suggestions_prompt.extend(conversation)
            suggestions_prompt.append({"role": "assistant", "content": full_content})
            
            # Call Azure OpenAI for suggestions
            suggestions_response = client.chat.completions.create(
                model=deployment,
                messages=suggestions_prompt,
                max_tokens=250,
                temperature=0.7,
                response_format={"type": "json_object"}
            )
            
            suggestions_content = suggestions_response.choices[0].message.content
            
            # Parse suggestions
            suggestions = []
            try:
                # Log the raw response for debugging
                print(f"Raw suggestions response: {suggestions_content}")
                
                # Try multiple parsing approaches
                suggestions_data = json.loads(suggestions_content)
                
                # Handle various formats that might be returned
                if isinstance(suggestions_data, dict):
                    if "suggestions" in suggestions_data:
                        suggestions = suggestions_data["suggestions"]
                    elif "questions" in suggestions_data:
                        suggestions = suggestions_data["questions"]
                    elif "followUpQuestions" in suggestions_data:
                        suggestions = suggestions_data["followUpQuestions"]
                    else:
                        # Try to find any key that might contain an array of strings
                        for key, value in suggestions_data.items():
                            if isinstance(value, list) and all(isinstance(item, str) for item in value):
                                suggestions = value
                                break
                elif isinstance(suggestions_data, list):
                    # If it's already a list, use it directly
                    suggestions = suggestions_data
                
                # Ensure we have exactly 3 suggestions
                if len(suggestions) > 3:
                    suggestions = suggestions[:3]
                while len(suggestions) < 3:
                    # Add diverse fallback questions if we don't have enough
                    fallback_questions = [
                        "Show me my active campaigns",
                        "How do I create a new targeted offer?",
                        "Explain campaign performance metrics",
                        "What targeting options are available?",
                        "How can I improve offer acceptance rates?",
                        "Show me campaign delivery statistics",
                        "How to analyze customer segments?",
                        "What are the best campaign settings?",
                        "Compare my top-performing campaigns",
                        "How to set up automated follow-ups?"
                    ]
                    # Pick a random question that's not already in suggestions
                    import random
                    for _ in range(10):  # Try up to 10 times to find unique questions
                        q = random.choice(fallback_questions)
                        if q not in suggestions:
                            suggestions.append(q)
                            break
                    
                    # If we still don't have enough, add a generic one
                    if len(suggestions) < 3:
                        suggestions.append("How can I optimize my campaign strategy?")
            except Exception:
                # If parsing fails, provide default suggestions
                suggestions = [
                    "Show me my active campaigns",
                    "How do I create a new targeted offer?",
                    "Explain campaign performance metrics"
                ]
            
            # Send the complete response and suggestions
            yield json.dumps({
                "type": "complete", 
                "message": {"role": "assistant", "content": full_content},
                "suggestions": suggestions
            }) + "\n"
            
        except Exception as e:
            error_msg = f"Error generating AI response: {str(e)}"
            yield json.dumps({"type":"error", "error": error_msg}) + "\n"
    
    return StreamingResponse(
        generate_response(),
        media_type="text/event-stream"
    )

# AI Fill for Offers
@router.post("/offers/fill", response_model=OfferFillResponse)
async def generate_offer_data(
    request: OfferFillRequest,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
):
    """
    Generate offer data using Azure OpenAI
    """
    # Get Azure OpenAI client
    client = get_azure_openai_client()
    deployment = settings.AZURE_DEPLOYMENT
    
    if not deployment:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Azure OpenAI deployment name is missing"
        )
    
    # Format tenant name and offer type for the prompt
    formatted_tenant_name = request.tenant_name.replace("_", " ")
    formatted_offer_type = request.offer_type.replace("_", " ")
    
    # Prepare the prompt for OpenAI
    messages = [
        {
            "role": "system",
            "content": "You are an AI assistant specialized in financial product offers. You will be given a tenant name, offer type, and its attributes. Your task is to generate relevant and realistic values for these attributes, along with a descriptive offer description and optional comments. Return ONLY valid JSON without any markdown formatting."
        },
        {
            "role": "user",
            "content": f"Generate offer data for a {formatted_offer_type} offer under the {formatted_tenant_name} category. \
                The offer attributes are:\n{json.dumps(request.offer_attributes, indent=2)}\n\n\
                Return a JSON object with the following structure:\n\
                {{\n\
                  \"description\": \"A compelling offer description\",\n\
                  \"comments\": \"Optional comments about the offer\",\n\
                  \"attributeValues\": {{ key-value pairs matching the structure of the offer attributes }},\n\
                  \"customAttributes\": {{ 2-3 additional custom attributes that make sense for this offer }}\n\
                }}\n\n\
                Make sure the attributeValues match the expected data types of the offer attributes (numbers, strings, arrays, booleans).\n\
                Generate realistic values that would make sense for a financial product."
        }
    ]
    
    try:
        # Call Azure OpenAI
        response = client.chat.completions.create(
            model=deployment,
            messages=messages,
            max_tokens=1000,
            temperature=0.7,
            top_p=0.95,
            frequency_penalty=0,
            presence_penalty=0,
            response_format={"type": "json_object"}
        )
        
        # Extract and parse the content from the API response
        content = response.choices[0].message.content
        
        # Parse the JSON response
        parsed_data = json.loads(content)
        
        # Return the structured response
        return {
            "description": parsed_data["description"],
            "comments": parsed_data.get("comments", ""),
            "attribute_values": parsed_data["attributeValues"],
            "custom_attributes": parsed_data.get("customAttributes", {})
        }
    
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to parse the AI response. The generated content was not valid JSON."
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating offer data: {str(e)}"
        )

# AI Fill for Campaigns
@router.post("/campaigns/fill", response_model=CampaignFillResponse)
async def generate_campaign_data(
    request: CampaignFillRequest,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
):
    """
    Generate campaign data using Azure OpenAI
    """
    # Get Azure OpenAI client
    client = get_azure_openai_client()
    deployment = settings.AZURE_DEPLOYMENT
    
    if not deployment:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Azure OpenAI deployment name is missing"
        )
    
    # Format tenant name for the prompt
    formatted_tenant_name = request.tenant_name.replace("_", " ")
    
    # Prepare the prompt for OpenAI
    messages = [
        {
            "role": "system",
            "content": "You are an AI assistant specialized in marketing campaigns for financial products. You will be given details about a financial product offer. Your task is to generate a campaign name, description, and selection criteria for targeting potential customers. Return ONLY valid JSON without any markdown formatting."
        },
        {
            "role": "user",
            "content": f"Generate campaign data for an offer in the {formatted_tenant_name} category.\n\n\
                The offer details are:\n{json.dumps(request.offer_details, indent=2)}\n\n\
                Return a JSON object with the following structure:\n\
                {{\n\
                  \"name\": \"A catchy campaign name\",\n\
                  \"description\": \"A compelling campaign description that mentions key offer benefits\",\n\
                  \"selectionCriteria\": [\n\
                    {{ \"criterion\": \"credit_score\", \"operator\": \">\", \"value\": \"700\" }},\n\
                    {{ \"criterion\": \"segment\", \"operator\": \"=\", \"value\": \"premium\" }}\n\
                  ]\n\
                }}\n\n\
                Available selection criteria types:\n\
                - credit_score (number values, operators: >, <, =)\n\
                - gender (values: male, female, other, operators: =, !)\n\
                - is_active (values: true, false, operators: =)\n\
                - occupation (values: salaried, self-employed, student, retired, operators: =)\n\
                - marital_status (values: single, married, divorced, widowed, operators: =)\n\
                - segment (values: premium, regular, corporate, operators: =, !)\n\
                - deliquency (values: true, false, operators: =)\n\
                - kyc_status (values: verified, pending, rejected, operators: =)\n\n\
                Choose 2-3 relevant selection criteria that would be appropriate for targeting customers for this specific offer."
        }
    ]
    
    try:
        # Call Azure OpenAI
        response = client.chat.completions.create(
            model=deployment,
            messages=messages,
            max_tokens=1000,
            temperature=0.7,
            top_p=0.95,
            frequency_penalty=0,
            presence_penalty=0,
            response_format={"type": "json_object"}
        )
        
        # Extract and parse the content from the API response
        content = response.choices[0].message.content
        
        # Parse the JSON response
        parsed_data = json.loads(content)
        
        # Convert selection criteria to proper format
        selection_criteria = [
            {
                "criterion": criteria["criterion"],
                "operator": criteria["operator"],
                "value": criteria["value"]
            }
            for criteria in parsed_data["selectionCriteria"]
        ]
        
        # Return the structured response
        return {
            "name": parsed_data["name"],
            "description": parsed_data["description"],
            "selection_criteria": selection_criteria
        }
    
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to parse the AI response. The generated content was not valid JSON."
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating campaign data: {str(e)}"
        ) 
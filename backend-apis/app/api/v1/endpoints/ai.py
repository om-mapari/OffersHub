import os
import json
import re
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException, status
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
    
    # Get tenant information if provided
    tenant = None
    if request.tenant_name:
        tenant = deps.get_tenant_by_name_direct(db, request.tenant_name)

    # Get additional context (offers data)
    offers_data = []
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
    
    # Prepare the system prompt with context
    formatted_tenant_name = tenant_name.split('_')
    formatted_tenant_name = ' '.join([part.capitalize() for part in formatted_tenant_name])
    
    # Define system prompt with context about offers
    system_prompt = f"""You are OffersHub AI, a specialized assistant for the OffersHub platform.
Your primary role is to help users navigate and utilize the OffersHub platform efficiently.

CURRENT CONTEXT:
- Current tenant: {formatted_tenant_name}
- User: {current_user.username}
- Available offers: {len(offers_data)}

You can access the following data to provide specific information:
- Offers data with details on descriptions, types, status, and attributes
- Basic campaign information

When asked about offers or campaigns, provide specific information from the context data.
For requests about listing offers, show a concise summary of available offers.
When asked about a specific offer, provide its details including description, type, status, and attributes.

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

Be brief, professional, and helpful. Format responses in a clear, readable manner.
Always respect user roles and permissions. Do not expose sensitive information."""

    # Process conversation with system prompt and context
    conversation = [{"role": "system", "content": system_prompt}]
    
    # Add context if we have offers data
    if offers_data:
        context_message = "Here is the current offers data:\n" + json.dumps(offers_data, indent=2)
        conversation.append({"role": "system", "content": f"Context information: {context_message}"})
    
    # Add user conversation history
    for msg in request.messages:
        conversation.append({"role": msg.role, "content": msg.content})
    
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
                "content": "Based on the previous conversation, generate 2-3 short follow-up questions the user might want to ask next. Return only the questions as a JSON array of strings. Make them concise and directly related to OffersHub functionality."
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
            suggestions_data = json.loads(suggestions_content)
            if isinstance(suggestions_data, dict) and "suggestions" in suggestions_data:
                suggestions = suggestions_data["suggestions"]
        except Exception:
            # If parsing fails, just return an empty list
            suggestions = []
        
        return {
            "message": {"role": "assistant", "content": bot_response},
            "suggestions": suggestions
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating AI response: {str(e)}"
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
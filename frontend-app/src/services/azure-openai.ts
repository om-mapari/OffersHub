/**
 * Service to interact with Azure OpenAI API
 */

import { AZURE_CONFIG, isAzureConfigValid } from "@/config/env";

/**
 * Generate offer data using Azure OpenAI
 * @param tenantName Name of the tenant (e.g., "credit_card", "loan", etc.)
 * @param offerType Type of offer (e.g., "balance_transfer", "cashback", etc.)
 * @param offerAttributes Default attributes template for the offer type
 * @returns Generated offer data
 */
export async function generateOfferData(
  tenantName: string,
  offerType: string,
  offerAttributes: Record<string, any>
): Promise<{
  description: string;
  comments: string;
  attributeValues: Record<string, any>;
  customAttributes: Record<string, any>;
}> {
  try {
    console.log('Generating offer data with Azure OpenAI', {
      tenantName,
      offerType,
      offerAttributes,
    });
    
    // Validate Azure OpenAI configuration
    if (!isAzureConfigValid()) {
      throw new Error('Azure OpenAI configuration is missing. Please check your environment variables.');
    }
    
    const { endpoint, apiKey, apiVersion, deployment } = AZURE_CONFIG;
    
    // Prepare the prompt for OpenAI
    const messages = [
      {
        role: "system",
        content: `You are an AI assistant specialized in financial product offers. You will be given a tenant name, offer type, and its attributes. Your task is to generate relevant and realistic values for these attributes, along with a descriptive offer description and optional comments. Return ONLY valid JSON without any markdown formatting like \`\`\`json. Just return the raw JSON object.`
      },
      {
        role: "user",
        content: `Generate offer data for a ${offerType.replace(/_/g, ' ')} offer under the ${tenantName.replace(/_/g, ' ')} category. 
          The offer attributes are:
          ${JSON.stringify(offerAttributes, null, 2)}
          
          Return a JSON object with the following structure:
          {
            "description": "A compelling offer description",
            "comments": "Optional comments about the offer",
            "attributeValues": { key-value pairs matching the structure of the offer attributes },
            "customAttributes": { 2-3 additional custom attributes that make sense for this offer }
          }
          
          Make sure the attributeValues match the expected data types of the offer attributes (numbers, strings, arrays, booleans).
          Generate realistic values that would make sense for a financial product.`
      }
    ];
    
    console.log('Calling Azure OpenAI API with messages:', messages);
    
    // Call Azure OpenAI API
    const response = await fetch(`${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey
      },
      body: JSON.stringify({
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7,
        top_p: 0.95,
        frequency_penalty: 0,
        presence_penalty: 0,
        stop: null
      }),
    });
    
    if (!response.ok) {
      console.error('Azure OpenAI API error', {
        status: response.status,
        statusText: response.statusText,
      });
      const errorText = await response.text();
      console.error('Azure OpenAI API error response', errorText);
      throw new Error(`Azure OpenAI API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Azure OpenAI API response', data);
    
    // Extract and parse the content from the API response
    const content = data.choices[0]?.message?.content;
    if (!content) {
      console.error('No content in Azure OpenAI API response');
      throw new Error('No content in Azure OpenAI API response');
    }
    
    console.log('Raw content from Azure OpenAI:', content);
    
    // Improved JSON parsing with multiple fallback strategies
    let parsedData;
    try {
      // First, try to parse directly
      parsedData = JSON.parse(content);
    } catch (e) {
      console.error('Failed to parse JSON directly', e);
      
      try {
        // Try to clean markdown formatting
        let cleanedContent = content.trim();
        
        // Remove markdown code blocks if present
        if (cleanedContent.startsWith('```') && cleanedContent.endsWith('```')) {
          // Extract content between opening and closing markdown tags
          cleanedContent = cleanedContent.replace(/^```(?:json)?|```$/g, '').trim();
        }
        
        // Try to parse the cleaned content
        parsedData = JSON.parse(cleanedContent);
      } catch (cleanError) {
        console.error('Failed to parse cleaned JSON', cleanError);
        
        // Last resort: try to extract JSON using regex
        try {
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            parsedData = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error('Could not find JSON in the response');
          }
        } catch (extractError) {
          console.error('Failed to extract and parse JSON', extractError);
          throw new Error('Failed to parse the AI response. Please try again.');
        }
      }
    }
    
    console.log('Parsed data from Azure OpenAI:', parsedData);
    
    // Validate the parsed data structure
    if (!parsedData.description || !parsedData.attributeValues) {
      console.error('Invalid data structure in parsed response');
      throw new Error('Invalid data structure in AI response');
    }
    
    return {
      description: parsedData.description,
      comments: parsedData.comments || '',
      attributeValues: parsedData.attributeValues,
      customAttributes: parsedData.customAttributes || {},
    };
  } catch (error) {
    console.error('Error generating offer data', error);
    throw error;
  }
}

/**
 * Generate campaign data using Azure OpenAI
 * @param offerDetails The selected offer details to base the campaign on
 * @param tenantName Name of the tenant
 * @returns Generated campaign data
 */
export async function generateCampaignData(
  offerDetails: any,
  tenantName: string
): Promise<{
  name: string;
  description: string;
  selectionCriteria: Array<{criterion: string; operator: string; value: string;}>;
}> {
  try {
    console.log('Generating campaign data with Azure OpenAI', {
      offerDetails,
      tenantName,
    });
    
    // Validate Azure OpenAI configuration
    if (!isAzureConfigValid()) {
      throw new Error('Azure OpenAI configuration is missing. Please check your environment variables.');
    }
    
    const { endpoint, apiKey, apiVersion, deployment } = AZURE_CONFIG;
    
    // Prepare the prompt for OpenAI
    const messages = [
      {
        role: "system",
        content: `You are an AI assistant specialized in marketing campaigns for financial products. You will be given details about a financial product offer. Your task is to generate a campaign name, description, and selection criteria for targeting potential customers. Return ONLY valid JSON without any markdown formatting like \`\`\`json. Just return the raw JSON object.`
      },
      {
        role: "user",
        content: `Generate campaign data for an offer in the ${tenantName.replace(/_/g, ' ')} category.
          
          The offer details are:
          ${JSON.stringify(offerDetails, null, 2)}
          
          Return a JSON object with the following structure:
          {
            "name": "A catchy campaign name",
            "description": "A compelling campaign description that mentions key offer benefits",
            "selectionCriteria": [
              { "criterion": "credit_score", "operator": ">", "value": "700" },
              { "criterion": "segment", "operator": "=", "value": "premium" }
            ]
          }
          
          Available selection criteria types:
          - credit_score (number values, operators: >, <, =)
          - gender (values: male, female, other, operators: =, !)
          - is_active (values: true, false, operators: =)
          - occupation (values: salaried, self-employed, student, retired, operators: =)
          - marital_status (values: single, married, divorced, widowed, operators: =)
          - segment (values: premium, regular, corporate, operators: =, !)
          - deliquency (values: true, false, operators: =)
          - kyc_status (values: verified, pending, rejected, operators: =)
          
          Choose 2-3 relevant selection criteria that would be appropriate for targeting customers for this specific offer.`
      }
    ];
    
    console.log('Calling Azure OpenAI API for campaign data:', messages);
    
    // Call Azure OpenAI API
    const response = await fetch(`${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey
      },
      body: JSON.stringify({
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7,
        top_p: 0.95,
        frequency_penalty: 0,
        presence_penalty: 0,
        stop: null
      }),
    });
    
    if (!response.ok) {
      console.error('Azure OpenAI API error', {
        status: response.status,
        statusText: response.statusText,
      });
      const errorText = await response.text();
      console.error('Azure OpenAI API error response', errorText);
      throw new Error(`Azure OpenAI API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Azure OpenAI API response for campaign data:', data);
    
    // Extract and parse the content from the API response
    const content = data.choices[0]?.message?.content;
    if (!content) {
      console.error('No content in Azure OpenAI API response');
      throw new Error('No content in Azure OpenAI API response');
    }
    
    console.log('Raw content from Azure OpenAI for campaign:', content);
    
    // Improved JSON parsing with multiple fallback strategies
    let parsedData;
    try {
      // First, try to parse directly
      parsedData = JSON.parse(content);
    } catch (e) {
      console.error('Failed to parse JSON directly', e);
      
      try {
        // Try to clean markdown formatting
        let cleanedContent = content.trim();
        
        // Remove markdown code blocks if present
        if (cleanedContent.startsWith('```') && cleanedContent.endsWith('```')) {
          // Extract content between opening and closing markdown tags
          cleanedContent = cleanedContent.replace(/^```(?:json)?|```$/g, '').trim();
        }
        
        // Try to parse the cleaned content
        parsedData = JSON.parse(cleanedContent);
      } catch (cleanError) {
        console.error('Failed to parse cleaned JSON', cleanError);
        
        // Last resort: try to extract JSON using regex
        try {
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            parsedData = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error('Could not find JSON in the response');
          }
        } catch (extractError) {
          console.error('Failed to extract and parse JSON', extractError);
          throw new Error('Failed to parse the AI response for campaign data. Please try again.');
        }
      }
    }
    
    console.log('Parsed campaign data from Azure OpenAI:', parsedData);
    
    // Validate the parsed data structure
    if (!parsedData.name || !parsedData.description || !Array.isArray(parsedData.selectionCriteria)) {
      console.error('Invalid campaign data structure in parsed response');
      throw new Error('Invalid campaign data structure in AI response');
    }
    
    return {
      name: parsedData.name,
      description: parsedData.description,
      selectionCriteria: parsedData.selectionCriteria,
    };
  } catch (error) {
    console.error('Error generating campaign data', error);
    throw error;
  }
} 
/**
 * Service to interact with AI features via backend API
 */

import { API_BASE_URL } from "@/config/env";
import { apiClient } from "@/config/api";

/**
 * Generate offer data using backend AI API
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
    console.log('Generating offer data with backend AI API', {
      tenantName,
      offerType,
      offerAttributes,
    });
    
    // Call backend API using apiClient
    const response = await apiClient.post(
      `/ai/offers/fill`,
      {
        tenant_name: tenantName,
        offer_type: offerType,
        offer_attributes: offerAttributes
      }
    );
    
    console.log('Backend AI API response for offer data:', response.data);
    
    // Return the structured response
    return {
      description: response.data.description,
      comments: response.data.comments || '',
      attributeValues: response.data.attribute_values,
      customAttributes: response.data.custom_attributes || {},
    };
  } catch (error) {
    console.error('Error generating offer data', error);
    throw error;
  }
}

/**
 * Generate campaign data using backend AI API
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
    console.log('Generating campaign data with backend AI API', {
      offerDetails,
      tenantName,
    });
    
    // Call backend API using apiClient
    const response = await apiClient.post(
      `/ai/campaigns/fill`,
      {
        tenant_name: tenantName,
        offer_details: offerDetails
      }
    );
    
    console.log('Backend AI API response for campaign data:', response.data);
    
    // Return the structured response
    return {
      name: response.data.name,
      description: response.data.description,
      selectionCriteria: response.data.selection_criteria,
    };
  } catch (error) {
    console.error('Error generating campaign data', error);
    throw error;
  }
} 
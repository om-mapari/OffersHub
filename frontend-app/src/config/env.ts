/**
 * Environment configuration
 * Ensures all required environment variables are available
 */

// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

// Azure OpenAI Configuration
export const AZURE_CONFIG = {
  endpoint: import.meta.env.VITE_AZURE_ENDPOINT,
  apiKey: import.meta.env.VITE_AZURE_API_KEY,
  apiVersion: import.meta.env.VITE_AZURE_API_VERSION || '2023-05-15',
  deployment: import.meta.env.VITE_AZURE_DEPLOYMENT,
};

/**
 * Validates Azure OpenAI configuration
 * @returns {boolean} Whether the Azure OpenAI configuration is valid
 */
export function isAzureConfigValid(): boolean {
  const { endpoint, apiKey, apiVersion, deployment } = AZURE_CONFIG;
  
  if (!endpoint || !apiKey || !apiVersion || !deployment) {
    console.error('Azure OpenAI configuration is missing. Check your .env file.', {
      endpoint: !!endpoint,
      apiKey: !!apiKey,
      apiVersion: !!apiVersion,
      deployment: !!deployment
    });
    return false;
  }
  
  return true;
}

/**
 * Log environment configuration status
 * Useful for debugging
 */
export function logEnvStatus(): void {
  console.log('Environment configuration:', {
    api: {
      baseUrl: API_BASE_URL,
    },
    azure: {
      endpointConfigured: !!AZURE_CONFIG.endpoint,
      apiKeyConfigured: !!AZURE_CONFIG.apiKey,
      apiVersion: AZURE_CONFIG.apiVersion,
      deploymentConfigured: !!AZURE_CONFIG.deployment,
    },
  });
}

// Log environment status during development
if (import.meta.env.DEV) {
  logEnvStatus();
} 
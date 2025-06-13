import { useState, useEffect } from 'react';
import { AZURE_CONFIG, isAzureConfigValid } from '@/config/env';

interface UseAzureConfigResult {
  isValid: boolean;
  isLoading: boolean;
  missingVars: string[];
}

/**
 * Hook to check if the Azure OpenAI configuration is valid
 */
export function useAzureConfig(): UseAzureConfigResult {
  const [isValid, setIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [missingVars, setMissingVars] = useState<string[]>([]);

  useEffect(() => {
    // Check configuration on mount
    const valid = isAzureConfigValid();
    setIsValid(valid);

    // Find missing environment variables
    const missing: string[] = [];
    if (!AZURE_CONFIG.endpoint) missing.push('VITE_AZURE_ENDPOINT');
    if (!AZURE_CONFIG.apiKey) missing.push('VITE_AZURE_API_KEY');
    if (!AZURE_CONFIG.apiVersion) missing.push('VITE_AZURE_API_VERSION');
    if (!AZURE_CONFIG.deployment) missing.push('VITE_AZURE_DEPLOYMENT');
    
    setMissingVars(missing);
    setIsLoading(false);
  }, []);

  return { isValid, isLoading, missingVars };
} 
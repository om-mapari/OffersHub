import { useState, useEffect } from 'react';

interface UseAzureConfigResult {
  isValid: boolean;
  isLoading: boolean;
  missingVars: string[];
}

/**
 * Hook to check if the Azure OpenAI configuration is valid
 * Note: Since we're now using backend APIs, frontend Azure config is no longer required
 */
export function useAzureConfig(): UseAzureConfigResult {
  const [isLoading, setIsLoading] = useState(true);
  const [missingVars, setMissingVars] = useState<string[]>([]);

  useEffect(() => {
    // We no longer need to check for Azure config since we're using backend APIs
    setIsLoading(false);
    setMissingVars([]);
  }, []);

  // Always return isValid as true since we're using backend APIs now
  return { isValid: true, isLoading, missingVars };
} 
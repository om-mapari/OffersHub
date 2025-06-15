/**
 * Environment configuration
 * Ensures all required environment variables are available
 */

// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

/**
 * Log environment configuration status
 * Useful for debugging
 */
export function logEnvStatus(): void {
  console.log('Environment configuration:', {
    api: {
      baseUrl: API_BASE_URL,
    }
  });
}

// Log environment status during development
if (import.meta.env.DEV) {
  logEnvStatus();
} 
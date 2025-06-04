/**
 * API configuration
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

/**
 * Helper function to build tenant-specific API URLs
 */
export const buildTenantApiUrl = (tenantName: string, path: string): string => {
  return `${API_BASE_URL}/tenants/${tenantName}${path}`;
};

/**
 * Helper function to build user-specific API URLs
 */
export const buildUserApiUrl = (path: string): string => {
  return `${API_BASE_URL}/users${path}`;
}; 
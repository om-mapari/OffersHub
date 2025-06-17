/**
 * API configuration
 * This module provides a consistent way to interact with APIs across environments
 */
import axios from 'axios';
import Cookies from 'js-cookie';

// Access token cookie key - must match the one used in authStore.ts
const ACCESS_TOKEN_COOKIE_KEY = 'app_access_token';

// Base URL for API requests - will be used for all API calls
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

// Create a configured axios instance for API requests
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add auth token to requests
apiClient.interceptors.request.use((config) => {
  // Try to get token from multiple sources
  let token = Cookies.get(ACCESS_TOKEN_COOKIE_KEY);
  
  // If no token in cookies, try sessionStorage as fallback
  if (!token && typeof window !== 'undefined') {
    const sessionToken = sessionStorage.getItem(ACCESS_TOKEN_COOKIE_KEY);
    if (sessionToken) {
      token = sessionToken;
    }
  }
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

// Add response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Handle specific error statuses
      switch (error.response.status) {
        case 401:
          console.error('Authentication error: Token may be invalid or expired');
          // You could trigger a logout or token refresh here
          break;
        case 403:
          console.error('Authorization error: Insufficient permissions');
          break;
        case 404:
          console.error('Resource not found');
          break;
        case 500:
          console.error('Server error');
          break;
        default:
          console.error(`API error: ${error.response.status}`);
      }
    } else if (error.request) {
      console.error('Network error: No response received');
    } else {
      console.error('Error setting up request:', error.message);
    }
    return Promise.reject(error);
  }
);

/**
 * Helper function to build tenant-specific API URLs
 * Works consistently in both development and production
 */
export const buildTenantApiUrl = (tenantName: string | undefined, path: string): string => {
  if (!tenantName) {
    console.warn('Tenant name is undefined in buildTenantApiUrl');
    return `${API_BASE_URL}/error${path}`;
  }
  
  // Use the API_BASE_URL for all tenant-specific requests
  return `${API_BASE_URL}/tenants/${tenantName}${path}`;
};

/**
 * Helper function to build user-specific API URLs
 */
export const buildUserApiUrl = (path: string): string => {
  // Use the API_BASE_URL for all user-specific requests
  return `${API_BASE_URL}/users${path}`;
};

/**
 * Make a tenant-specific API request
 * @param tenantName The tenant name
 * @param path The API path
 * @param options Request options
 */
export const tenantApiRequest = async <T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  tenantName: string | undefined, 
  path: string,
  data?: any,
  params?: any
): Promise<T> => {
  if (!tenantName) {
    throw new Error('Tenant name is required for API requests');
  }
  
  const url = buildTenantApiUrl(tenantName, path);
  const token = Cookies.get(ACCESS_TOKEN_COOKIE_KEY);
  
  try {
    const response = await apiClient.request<T>({
      method,
      url,
      data,
      params,
      headers: token ? {
        Authorization: `Bearer ${token}`
      } : undefined
    });
    
    return response.data;
  } catch (error) {
    console.error(`API request error for ${url}:`, error);
    throw error;
  }
};
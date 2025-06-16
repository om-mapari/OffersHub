// Import the API_BASE_URL from the central configuration
import { API_BASE_URL, apiClient } from '@/config/api';

// Simple cache implementation for API responses
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

interface ApiCache {
  [key: string]: CacheEntry<any>;
}

// Cache expiration time in milliseconds (5 minutes)
const CACHE_EXPIRATION = 5 * 60 * 1000;

// In-memory cache for API responses
const apiCache: ApiCache = {};

// Track ongoing fetch requests to prevent duplicate calls
const ongoingFetches: Record<string, Promise<any>> = {};

// Helper function to get or set cached data
async function getOrFetchData<T>(
  cacheKey: string,
  fetchFn: () => Promise<T>
): Promise<T> {
  const now = Date.now();
  const cachedData = apiCache[cacheKey];
  
  // Return cached data if it exists and hasn't expired
  if (cachedData && now - cachedData.timestamp < CACHE_EXPIRATION) {
    console.log(`Using cached data for ${cacheKey}`);
    return cachedData.data;
  }
  
  // If there's already an ongoing fetch for this key, return that promise
  // This prevents duplicate requests if multiple components call the same API
  // at the same time before the first one resolves
  if (ongoingFetches[cacheKey] !== undefined) {
    console.log(`Reusing in-progress fetch for ${cacheKey}`);
    return ongoingFetches[cacheKey];
  }
  
  // Fetch fresh data
  console.log(`Fetching fresh data for ${cacheKey}`);
  
  // Create a promise and store it to prevent duplicate requests
  const fetchPromise = fetchFn().then(data => {
    // Cache the successful result
    apiCache[cacheKey] = {
      data,
      timestamp: now
    };
    // Remove from ongoing fetches
    delete ongoingFetches[cacheKey];
    return data;
  }).catch(error => {
    // Remove from ongoing fetches on error
    delete ongoingFetches[cacheKey];
    throw error;
  });
  
  // Store the promise
  ongoingFetches[cacheKey] = fetchPromise;
  
  return fetchPromise;
}

// Clears all API caches - useful when logging out or changing tenants
export function clearAuthCache() {
  Object.keys(apiCache).forEach(key => {
    delete apiCache[key];
  });
  console.log('All auth cache entries cleared');
}

// Auth related types
export interface User {
  username: string;
  full_name?: string;
  is_super_admin?: boolean;
  created_at?: string;
  [key: string]: any;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export interface Msg {
  msg: string;
}

export interface LoginCredentials {
  username?: string;
  password?: string;
  grant_type?: string;
  scope?: string;
  client_id?: string;
  client_secret?: string;
}

export interface UserPasswordChange {
  current_password: string;
  new_password: string;
}

export interface UserTenantInfo {
  tenant_name: string;
  roles: string[];
}

export async function loginForAccessToken(credentials: LoginCredentials): Promise<Token> {
  const formData = new URLSearchParams();
  if (credentials.grant_type) formData.append('grant_type', credentials.grant_type);
  if (credentials.username) formData.append('username', credentials.username);
  if (credentials.password) formData.append('password', credentials.password);
  if (credentials.scope) formData.append('scope', credentials.scope);
  if (credentials.client_id) formData.append('client_id', credentials.client_id);
  if (credentials.client_secret) formData.append('client_secret', credentials.client_secret);

  console.log('Sending login request to:', `${API_BASE_URL}/auth/token`);
  
  // Clear cache on login to ensure fresh data
  clearAuthCache();
  
  try {
    const response = await apiClient.post('/auth/token', formData.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

export async function getCurrentUser(token: string): Promise<User> {
  return getOrFetchData<User>(`current-user-${token.substring(0, 10)}`, async () => {
    console.log('Fetching current user from:', `${API_BASE_URL}/auth/me`);
    
    try {
      const response = await apiClient.get('/auth/me');
      const userData = response.data;
      console.log('Raw user data from API:', userData);
      return userData;
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw error;
    }
  });
}

export async function getUserTenants(token: string): Promise<UserTenantInfo[]> {
  return getOrFetchData<UserTenantInfo[]>(`user-tenants-${token.substring(0, 10)}`, async () => {
    console.log('Fetching user tenants from:', `${API_BASE_URL}/users/me/tenants`);
    
    try {
      const response = await apiClient.get('/users/me/tenants');
      return response.data;
    } catch (error) {
      console.error('Error fetching user tenants:', error);
      throw error;
    }
  });
}

export async function changeUserPassword(data: UserPasswordChange, token: string): Promise<Msg> {
  try {
    const response = await apiClient.post('/auth/change-password', data);
    return response.data;
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
} 
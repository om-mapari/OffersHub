// Using VITE_API_BASE_URL from .env or defaulting to localhost:8000
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

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

// Helper function to clear cache
export function clearAuthCache(): void {
  Object.keys(apiCache).forEach(key => {
    delete apiCache[key];
  });
  // Also clear ongoing fetches
  Object.keys(ongoingFetches).forEach(key => {
    delete ongoingFetches[key];
  });
  console.log('Auth API cache cleared');
}

export interface LoginError {
  detail?: string | { msg: string }[];
}

// As per OpenAPI spec: Body_login_for_access_token_api_v1_auth_token_post
export interface LoginCredentials {
  grant_type?: string; // Optional: 'password', 'refresh_token', etc.
  username?: string;
  password?: string;
  scope?: string; // Optional: space-separated list of scopes
  client_id?: string; // Optional
  client_secret?: string; // Optional
}

export interface Token {
  access_token: string;
  token_type: string;
  // Optional fields like refresh_token, expires_in, etc.
  refresh_token?: string;
  expires_in?: number;
}

// Matches the User schema from OpenAPI
export interface User {
  username: string;
  full_name: string | null;
  email?: string;
  is_active?: boolean;
  is_superuser?: boolean;
  is_super_admin?: boolean;
  created_at?: string;
  id?: string;
  avatar?: string;
}

export interface UserTenantInfo {
  tenant_name: string;
  roles: string[];
}

export interface UserPasswordChange {
  current_password: string;
  new_password: string;
}

export interface Msg {
  msg: string;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: response.statusText }));
    throw errorData;
  }
  return response.json() as Promise<T>;
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
  
  const response = await fetch(`${API_BASE_URL}/auth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData,
  });
  return handleResponse<Token>(response);
}

export async function getCurrentUser(token: string): Promise<User> {
  return getOrFetchData<User>(`current-user-${token.substring(0, 10)}`, async () => {
    console.log('Fetching current user from:', `${API_BASE_URL}/auth/me`);
    
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const userData = await handleResponse<User>(response);
    console.log('Raw user data from API:', userData);
    return userData;
  });
}

export async function getUserTenants(token: string): Promise<UserTenantInfo[]> {
  return getOrFetchData<UserTenantInfo[]>(`user-tenants-${token.substring(0, 10)}`, async () => {
    console.log('Fetching user tenants from:', `${API_BASE_URL}/users/me/tenants`);
    
    const response = await fetch(`${API_BASE_URL}/users/me/tenants`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse<UserTenantInfo[]>(response);
  });
}

export async function changeUserPassword(data: UserPasswordChange, token: string): Promise<Msg> {
  const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  return handleResponse<Msg>(response);
} 
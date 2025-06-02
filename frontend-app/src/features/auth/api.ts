// Using VITE_API_BASE_URL from .env or defaulting to localhost:8000
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

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
  console.log('Fetching current user from:', `${API_BASE_URL}/auth/me`);
  
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse<User>(response);
}

export async function getUserTenants(token: string): Promise<UserTenantInfo[]> {
  console.log('Fetching user tenants from:', `${API_BASE_URL}/users/me/tenants`);
  
  const response = await fetch(`${API_BASE_URL}/users/me/tenants`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse<UserTenantInfo[]>(response);
}

export async function changeUserPassword(data: UserPasswordChange, token: string): Promise<Msg> {
  const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  return handleResponse<Msg>(response);
} 
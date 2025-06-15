import { User, CreateUserInput, UpdateUserInput, UserTenantRole, CreateUserTenantRoleInput, DeleteUserTenantRoleInput } from './schema';
import { API_BASE_URL } from '@/config/api';

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: response.statusText }));
    throw errorData;
  }
  return response.json() as Promise<T>;
}

// Get all users (Super Admin only)
export async function getAllUsers(token: string): Promise<User[]> {
  const response = await fetch(`${API_BASE_URL}/sa/users/?skip=0&limit=100`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return handleResponse<User[]>(response);
}

// Get user by username (Super Admin only)
export async function getUserByUsername(username: string, token: string): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/sa/users/${username}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return handleResponse<User>(response);
}

// Create a new user (Super Admin only)
export async function createUser(data: CreateUserInput, token: string): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/sa/users/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  
  return handleResponse<User>(response);
}

// Update a user (Super Admin only)
export async function updateUser(username: string, data: UpdateUserInput, token: string): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/sa/users/${username}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  
  return handleResponse<User>(response);
}

// Delete a user (Super Admin only)
export async function deleteUser(username: string, token: string): Promise<{ msg: string }> {
  const response = await fetch(`${API_BASE_URL}/sa/users/${username}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return handleResponse<{ msg: string }>(response);
}

// Change user password (Super Admin only)
export async function changeUserPassword(username: string, newPassword: string, token: string): Promise<{ msg: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/sa/users/${username}/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ password: newPassword })
    });
    
    return handleResponse<{ msg: string }>(response);
  } catch (error) {
    console.error("Error changing password:", error);
    throw error;
  }
}

// Get user tenant roles (Super Admin only)
export async function getUserTenantRoles(token: string, username?: string, tenantName?: string): Promise<UserTenantRole[]> {
  let url = `${API_BASE_URL}/sa/user-tenant-roles/`;
  
  // Add query parameters if provided
  const params = new URLSearchParams();
  if (username) params.append('username', username);
  if (tenantName) params.append('tenant_name', tenantName);
  
  // Append query parameters to URL if any exist
  if (params.toString()) {
    url += `?${params.toString()}`;
  }
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return handleResponse<UserTenantRole[]>(response);
}

// Assign role to user in tenant (Super Admin only)
export async function assignRoleToUser(data: CreateUserTenantRoleInput, token: string): Promise<UserTenantRole> {
  const response = await fetch(`${API_BASE_URL}/sa/user-tenant-roles/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  
  return handleResponse<UserTenantRole>(response);
}

// Remove role from user in tenant (Super Admin only)
export async function removeRoleFromUser(data: DeleteUserTenantRoleInput, token: string): Promise<{ msg: string }> {
  const response = await fetch(`${API_BASE_URL}/sa/user-tenant-roles/`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  
  return handleResponse<{ msg: string }>(response);
} 
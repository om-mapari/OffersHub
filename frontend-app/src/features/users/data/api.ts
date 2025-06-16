import { User, CreateUserInput, UpdateUserInput, UserTenantRole, CreateUserTenantRoleInput, DeleteUserTenantRoleInput } from './schema';
import { apiClient, API_BASE_URL } from '@/config/api';

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: response.statusText }));
    throw errorData;
  }
  return response.json() as Promise<T>;
}

// Get all users (Super Admin only)
export async function getAllUsers(): Promise<User[]> {
  try {
    const response = await apiClient.get('/sa/users/?skip=0&limit=100');
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

// Get user by username (Super Admin only)
export async function getUserByUsername(username: string): Promise<User> {
  try {
    const response = await apiClient.get(`/sa/users/${username}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching user ${username}:`, error);
    throw error;
  }
}

// Create a new user (Super Admin only)
export async function createUser(data: CreateUserInput): Promise<User> {
  try {
    const response = await apiClient.post('/sa/users/', data);
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

// Update a user (Super Admin only)
export async function updateUser(username: string, data: UpdateUserInput): Promise<User> {
  try {
    const response = await apiClient.put(`/sa/users/${username}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating user ${username}:`, error);
    throw error;
  }
}

// Delete a user (Super Admin only)
export async function deleteUser(username: string): Promise<void> {
  try {
    await apiClient.delete(`/sa/users/${username}`);
  } catch (error) {
    console.error(`Error deleting user ${username}:`, error);
    throw error;
  }
}

// Change user password (Super Admin only)
export async function changeUserPassword(username: string, newPassword: string, token: string): Promise<{ msg: string }> {
  try {
    const response = await apiClient.post('/sa/users/${username}/change-password', { password: newPassword });
    return response.data;
  } catch (error) {
    console.error("Error changing password:", error);
    throw error;
  }
}

// Get user-tenant roles
export async function getUserTenantRoles(username?: string, tenantName?: string): Promise<UserTenantRole[]> {
  try {
    const queryParams = new URLSearchParams();
    if (username) queryParams.append('username', username);
    if (tenantName) queryParams.append('tenant_name', tenantName);
    
    const response = await apiClient.get(`/sa/user-tenant-roles/?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user-tenant roles:', error);
    throw error;
  }
}

// Assign role to user in tenant
export async function assignRoleToUser(data: CreateUserTenantRoleInput): Promise<UserTenantRole> {
  try {
    const response = await apiClient.post('/sa/user-tenant-roles/', data);
    return response.data;
  } catch (error) {
    console.error('Error assigning role to user:', error);
    throw error;
  }
}

// Remove role from user in tenant
export async function removeRoleFromUser(data: DeleteUserTenantRoleInput): Promise<void> {
  try {
    const response = await apiClient.delete('/sa/user-tenant-roles/', { data });
    return response.data;
  } catch (error) {
    console.error('Error removing role from user:', error);
    throw error;
  }
} 
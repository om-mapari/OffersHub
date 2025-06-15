import { Tenant, CreateTenantInput, UpdateTenantInput } from './schema';
import { API_BASE_URL, buildTenantApiUrl } from '@/config/api';

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: response.statusText }));
    throw errorData;
  }
  return response.json() as Promise<T>;
}

// Get all tenants (Super Admin only)
export async function getAllTenants(token: string): Promise<Tenant[]> {
  const response = await fetch(`${API_BASE_URL}/sa/tenants/?skip=0&limit=100`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return handleResponse<Tenant[]>(response);
}

// Get tenant by name (Super Admin only)
export async function getTenantByName(name: string, token: string): Promise<Tenant> {
  const response = await fetch(`${API_BASE_URL}/sa/tenants/${name}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return handleResponse<Tenant>(response);
}

// Create a new tenant (Super Admin only)
export async function createTenant(data: CreateTenantInput, token: string): Promise<Tenant> {
  const response = await fetch(`${API_BASE_URL}/sa/tenants/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  
  return handleResponse<Tenant>(response);
}

// Update a tenant (Super Admin only)
export async function updateTenant(name: string, data: UpdateTenantInput, token: string): Promise<Tenant> {
  const response = await fetch(`${API_BASE_URL}/sa/tenants/${name}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  
  return handleResponse<Tenant>(response);
}

// Delete a tenant (Super Admin only)
export async function deleteTenant(name: string, token: string): Promise<{ msg: string }> {
  const response = await fetch(`${API_BASE_URL}/sa/tenants/${name}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return handleResponse<{ msg: string }>(response);
} 
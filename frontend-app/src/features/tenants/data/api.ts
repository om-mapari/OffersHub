import { Tenant, CreateTenantInput, UpdateTenantInput } from './schema';
import { apiClient, API_BASE_URL } from '@/config/api';

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: response.statusText }));
    throw errorData;
  }
  return response.json() as Promise<T>;
}

// Get all tenants (Super Admin only)
export async function getAllTenants(): Promise<Tenant[]> {
  try {
    const response = await apiClient.get('/sa/tenants/?skip=0&limit=100');
    return response.data;
  } catch (error) {
    console.error('Error fetching tenants:', error);
    throw error;
  }
}

// Get tenant by name (Super Admin only)
export async function getTenantByName(name: string): Promise<Tenant> {
  try {
    const response = await apiClient.get(`/sa/tenants/${name}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching tenant ${name}:`, error);
    throw error;
  }
}

// Create a new tenant (Super Admin only)
export async function createTenant(data: CreateTenantInput): Promise<Tenant> {
  try {
    const response = await apiClient.post('/sa/tenants/', data);
    return response.data;
  } catch (error) {
    console.error('Error creating tenant:', error);
    throw error;
  }
}

// Update a tenant (Super Admin only)
export async function updateTenant(name: string, data: UpdateTenantInput): Promise<Tenant> {
  try {
    const response = await apiClient.put(`/sa/tenants/${name}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating tenant ${name}:`, error);
    throw error;
  }
}

// Delete a tenant (Super Admin only)
export async function deleteTenant(name: string): Promise<void> {
  try {
    await apiClient.delete(`/sa/tenants/${name}`);
  } catch (error) {
    console.error(`Error deleting tenant ${name}:`, error);
    throw error;
  }
} 
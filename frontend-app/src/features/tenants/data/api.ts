import { Tenant, CreateTenantInput, UpdateTenantInput } from './schema';
import { tenants as mockTenantsRaw } from './tenants';

// Convert string dates to Date objects
const mockTenants: Tenant[] = mockTenantsRaw.map(tenant => ({
  ...tenant,
  createdAt: new Date(tenant.createdAt),
}));

// In a real app, these functions would make actual API calls
// For now, they simulate API behavior with mock data

// Get all tenants
export async function getAllTenants(): Promise<Tenant[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockTenants;
}

// Get tenant by ID
export async function getTenantById(id: string): Promise<Tenant | undefined> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockTenants.find(tenant => tenant.id === id);
}

// Create a new tenant
export async function createTenant(data: CreateTenantInput): Promise<Tenant> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 700));
  
  const newTenant: Tenant = {
    id: crypto.randomUUID(),
    name: data.name,
    description: data.description || null,
    createdBy: "current-user", // In a real app, get from auth context
    createdAt: new Date(),
  };
  
  return newTenant;
}

// Update a tenant
export async function updateTenant(id: string, data: UpdateTenantInput): Promise<Tenant> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const tenant = mockTenants.find(t => t.id === id);
  
  if (!tenant) {
    throw new Error(`Tenant with ID ${id} not found`);
  }
  
  const updatedTenant: Tenant = {
    ...tenant,
    ...data,
  };
  
  return updatedTenant;
}

// Delete a tenant
export async function deleteTenant(id: string): Promise<void> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 600));
  
  const tenantIndex = mockTenants.findIndex(t => t.id === id);
  
  if (tenantIndex === -1) {
    throw new Error(`Tenant with ID ${id} not found`);
  }
  
  // In a real app, you would make a DELETE request to the API
  // For now, we just simulate success
} 
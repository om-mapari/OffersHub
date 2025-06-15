import { z } from 'zod'

// Define tenant schema based on API response
export const tenantSchema = z.object({
  name: z.string(),
  created_at: z.string().transform(str => new Date(str)),
})

export type Tenant = z.infer<typeof tenantSchema>

export const tenantListSchema = z.array(tenantSchema)

// Schema for creating a new tenant
export const createTenantSchema = z.object({
  name: z.string().min(3).max(50),
})

export type CreateTenantInput = z.infer<typeof createTenantSchema>

// Schema for updating a tenant (not used as API doesn't support updating name)
export const updateTenantSchema = z.object({})

export type UpdateTenantInput = z.infer<typeof updateTenantSchema> 
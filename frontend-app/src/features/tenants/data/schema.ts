import { z } from 'zod'

// Define tenant schema based on project requirements
export const tenantSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  createdBy: z.string(),
  createdAt: z.coerce.date(),
})

export type Tenant = z.infer<typeof tenantSchema>

export const tenantListSchema = z.array(tenantSchema)

// Schema for creating a new tenant
export const createTenantSchema = z.object({
  name: z.string().min(3).max(50),
  description: z.string().optional(),
})

export type CreateTenantInput = z.infer<typeof createTenantSchema>

// Schema for updating a tenant
export const updateTenantSchema = z.object({
  description: z.string().optional(),
})

export type UpdateTenantInput = z.infer<typeof updateTenantSchema> 
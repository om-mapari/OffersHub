import { z } from 'zod'

// Define user schema based on API response
export const userSchema = z.object({
  username: z.string(),
  full_name: z.string().nullable(),
  email: z.string().optional(),
  is_active: z.boolean().optional().default(true),
  is_super_admin: z.boolean().optional().default(false),
  created_at: z.string().transform(str => new Date(str)),
})

export type User = z.infer<typeof userSchema>

export const userListSchema = z.array(userSchema)

// Schema for creating a new user
export const createUserSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(8),
  full_name: z.string().optional(),
  email: z.string().email().optional(),
})

export type CreateUserInput = z.infer<typeof createUserSchema>

// Schema for updating a user
export const updateUserSchema = z.object({
  full_name: z.string().optional(),
  email: z.string().email().optional(),
  is_active: z.boolean().optional(),
})

export type UpdateUserInput = z.infer<typeof updateUserSchema>

// Schema for user tenant role
export const userTenantRoleSchema = z.object({
  username: z.string(),
  tenant_name: z.string(),
  role: z.string(),
})

export type UserTenantRole = z.infer<typeof userTenantRoleSchema>

export const userTenantRoleListSchema = z.array(userTenantRoleSchema)

// Schema for creating a user tenant role
export const createUserTenantRoleSchema = z.object({
  username: z.string(),
  tenant_name: z.string(),
  role: z.string(),
})

export type CreateUserTenantRoleInput = z.infer<typeof createUserTenantRoleSchema>

// Schema for deleting a user tenant role
export const deleteUserTenantRoleSchema = z.object({
  username: z.string(),
  tenant_name: z.string(),
  role: z.string(),
})

export type DeleteUserTenantRoleInput = z.infer<typeof deleteUserTenantRoleSchema>

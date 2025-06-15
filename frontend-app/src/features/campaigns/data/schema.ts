import { z } from 'zod'

// Define the campaign status type
export const campaignStatusSchema = z.enum([
  'draft',
  'active',
  'paused',
  'completed',
  'approved',
])

// Define the selection criteria schema
export const selectionCriteriaSchema = z.object({
  segment: z.string().optional(),
}).and(z.record(z.string(), z.any()))

// Define the campaign schema based on API response
export const campaignSchema = z.object({
  id: z.number(),
  tenant_name: z.string(),
  name: z.string(),
  offer_id: z.number(),
  description: z.string().optional(),
  selection_criteria: selectionCriteriaSchema,
  start_date: z.string(),
  end_date: z.string(),
  status: campaignStatusSchema,
  created_by_username: z.string().nullable(),
  created_at: z.string(),
})

// Define the campaign list schema
export const campaignListSchema = z.array(campaignSchema)

// Define the campaign create schema
export const campaignCreateSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  offer_id: z.number(),
  description: z.string().optional(),
  selection_criteria: selectionCriteriaSchema,
  start_date: z.string(),
  end_date: z.string(),
  status: campaignStatusSchema.optional(),
})

// Define the campaign update schema
export const campaignUpdateSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").optional(),
  description: z.string().optional(),
  selection_criteria: selectionCriteriaSchema.optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  status: campaignStatusSchema.optional(),
})

// Types derived from schemas
export type CampaignStatus = z.infer<typeof campaignStatusSchema>
export type Campaign = z.infer<typeof campaignSchema>
export type CampaignCreate = z.infer<typeof campaignCreateSchema>
export type CampaignUpdate = z.infer<typeof campaignUpdateSchema>
export type SelectionCriteria = z.infer<typeof selectionCriteriaSchema> 
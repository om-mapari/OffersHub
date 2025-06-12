import { z } from 'zod'

// Define the offer status type
export const offerStatusSchema = z.enum([
  'draft',
  'pending_review',
  'approved',
  'rejected',
  'retired'
])

// Define the offer schema based on actual API response
export const offerSchema = z.object({
  id: z.number(),
  tenant_name: z.string(),
  status: offerStatusSchema,
  created_at: z.string(),
  updated_at: z.string(),
  data: z.record(z.any()),
  offer_description: z.string(),
  offer_type: z.string(),
  created_by_username: z.string().nullable(),
  comments: z.string().nullable(),
})

// Define the offer list schema
export const offerListSchema = z.array(offerSchema)

// Types derived from schemas
export type OfferStatus = z.infer<typeof offerStatusSchema>
export type Offer = z.infer<typeof offerSchema> 
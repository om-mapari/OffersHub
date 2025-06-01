import { z } from 'zod'

// Define the offer status type
export const offerStatusSchema = z.enum([
  'draft',
  'submitted',
  'approved',
  'rejected',
])

// Define the offer schema
export const offerSchema = z.object({
  id: z.string(),
  tenant_id: z.string(),
  name: z.string(),
  status: offerStatusSchema,
  created_by: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  approved_by: z.string().optional(),
  approved_at: z.string().optional(),
  data: z.record(z.any()),
})

// Define the offer list schema
export const offerListSchema = z.array(offerSchema)

// Types derived from schemas
export type OfferStatus = z.infer<typeof offerStatusSchema>
export type Offer = z.infer<typeof offerSchema> 
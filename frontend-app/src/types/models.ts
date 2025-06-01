// Offer Status Types
export type OfferStatus = "draft" | "submitted" | "approved" | "rejected";

// Offer Model
export interface Offer {
  id: string;
  tenant_id: string;
  name: string;
  status: OfferStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
  approved_by?: string;
  approved_at?: string;
  // Flexible JSONB data field for tenant-specific attributes
  data: Record<string, any>;
}

// Comment Model for Offers
export interface OfferComment {
  id: string;
  offer_id: string;
  user_id: string;
  comment: string;
  created_at: string;
}

// Campaign Status Types
export type CampaignStatus = "draft" | "active" | "paused" | "completed";

// Campaign Model
export interface Campaign {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  offer_id: string;
  status: CampaignStatus;
  start_date: string;
  end_date?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Flexible JSONB field for selection criteria
  selection_criteria: Record<string, any>;
}

// Campaign Customer Model
export interface CampaignCustomer {
  id: string;
  campaign_id: string;
  customer_id: string;
  delivery_status: "pending" | "sent" | "failed";
  delivery_method?: "email" | "sms" | "push";
  last_attempted_at?: string;
  delivered_at?: string;
}

// Customer Model (simplified)
export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  segment?: string;
  kyc_status?: string;
  // Other customer attributes
  [key: string]: any;
} 
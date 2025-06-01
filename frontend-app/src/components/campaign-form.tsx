import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTenant } from "@/context/TenantContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Offer } from "@/features/offers/data/schema";

// Campaign Status Type
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

interface CampaignFormProps {
  campaign?: Campaign;
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
}

// Basic form schema for campaign fields
const campaignFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  description: z.string().optional(),
  offer_id: z.string().min(1, {
    message: "Please select an offer.",
  }),
  start_date: z.string().min(1, {
    message: "Please select a start date.",
  }),
  end_date: z.string().optional(),
});

type FormData = z.infer<typeof campaignFormSchema> & {
  selection_criteria: Record<string, any>;
};

// A simplified rule interface for the selection criteria
interface Rule {
  field: string;
  operator: "equals" | "not_equals" | "contains" | "greater_than" | "less_than";
  value: string;
}

// Available customer fields for rule builder
const CUSTOMER_FIELDS = [
  { label: "Segment", value: "segment" },
  { label: "KYC Status", value: "kyc_status" },
  { label: "Email Domain", value: "email_domain" },
  { label: "Age", value: "age" },
  { label: "Country", value: "country" },
];

// Operators for different field types
const OPERATORS = [
  { label: "Equals", value: "equals" },
  { label: "Not Equals", value: "not_equals" },
  { label: "Contains", value: "contains" },
  { label: "Greater Than", value: "greater_than" },
  { label: "Less Than", value: "less_than" },
];

// Mock offers - in a real app, these would come from an API
const MOCK_OFFERS: Offer[] = [
  {
    id: "offer-1",
    tenant_id: "tenant-1",
    name: "Credit Card Offer",
    status: "approved",
    created_by: "user-1",
    created_at: "2023-01-01",
    updated_at: "2023-01-01",
    data: { interest_rate: "12.99%" },
  },
  {
    id: "offer-2",
    tenant_id: "tenant-1",
    name: "Loan Offer",
    status: "approved",
    created_by: "user-1",
    created_at: "2023-01-02",
    updated_at: "2023-01-02",
    data: { loan_amount: "10000" },
  },
];

export function CampaignForm({ campaign, onSubmit, onCancel }: CampaignFormProps) {
  const { currentTenant } = useTenant();
  const { user } = useAuth();
  
  // State for rules
  const [rules, setRules] = useState<Rule[]>(
    campaign?.selection_criteria.rules || []
  );
  
  // For new rule creation
  const [newRule, setNewRule] = useState<Rule>({
    field: "",
    operator: "equals",
    value: "",
  });

  const form = useForm<z.infer<typeof campaignFormSchema>>({
    resolver: zodResolver(campaignFormSchema),
    defaultValues: {
      name: campaign?.name || "",
      description: campaign?.description || "",
      offer_id: campaign?.offer_id || "",
      start_date: campaign?.start_date || "",
      end_date: campaign?.end_date || "",
    },
  });

  const handleSubmit = (values: z.infer<typeof campaignFormSchema>) => {
    const formData: FormData = {
      ...values,
      selection_criteria: {
        rules,
        combine_with: "AND", // We could make this configurable too
      },
    };
    
    onSubmit(formData);
  };

  const addRule = () => {
    if (!newRule.field || !newRule.value) return;
    
    setRules((prev) => [...prev, { ...newRule }]);
    setNewRule({
      field: "",
      operator: "equals",
      value: "",
    });
  };

  const removeRule = (index: number) => {
    setRules((prev) => prev.filter((_, i) => i !== index));
  };

  if (!currentTenant) {
    return <div>Please select a tenant to create or edit a campaign.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {campaign ? "Edit Campaign" : "Create New Campaign"}
        </h2>
        <p className="text-muted-foreground">
          {campaign
            ? `Update campaign details for ${currentTenant.name}`
            : `Create a new campaign for ${currentTenant.name}`}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Campaign Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter campaign name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter campaign description"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="offer_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select Offer</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an offer" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {MOCK_OFFERS.map((offer) => (
                      <SelectItem key={offer.id} value={offer.id}>
                        {offer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="start_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="end_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date (Optional)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Selection Criteria Rules */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Selection Criteria</h3>
            <p className="text-sm text-muted-foreground">
              Define rules to select customers for this campaign.
            </p>

            {/* Display existing rules */}
            {rules.length > 0 ? (
              <div className="rounded-md border p-4 space-y-2">
                {rules.map((rule, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <div>
                      <span className="font-medium">
                        {CUSTOMER_FIELDS.find((f) => f.value === rule.field)?.label || rule.field}
                      </span>{" "}
                      <span>
                        {OPERATORS.find((o) => o.value === rule.operator)?.label || rule.operator}
                      </span>{" "}
                      <span className="font-medium">{rule.value}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRule(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground italic">
                No selection criteria added yet. All customers will be included.
              </div>
            )}

            {/* Add new rule */}
            <div className="grid grid-cols-3 gap-2 items-end">
              <div>
                <FormLabel>Field</FormLabel>
                <Select
                  value={newRule.field}
                  onValueChange={(value) =>
                    setNewRule((prev) => ({ ...prev, field: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select field" />
                  </SelectTrigger>
                  <SelectContent>
                    {CUSTOMER_FIELDS.map((field) => (
                      <SelectItem key={field.value} value={field.value}>
                        {field.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <FormLabel>Operator</FormLabel>
                <Select
                  value={newRule.operator}
                  onValueChange={(value) =>
                    setNewRule((prev) => ({
                      ...prev,
                      operator: value as Rule["operator"],
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select operator" />
                  </SelectTrigger>
                  <SelectContent>
                    {OPERATORS.map((op) => (
                      <SelectItem key={op.value} value={op.value}>
                        {op.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <FormLabel>Value</FormLabel>
                  <Input
                    value={newRule.value}
                    onChange={(e) =>
                      setNewRule((prev) => ({
                        ...prev,
                        value: e.target.value,
                      }))
                    }
                    placeholder="Enter value"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addRule}
                  className="mb-0.5"
                >
                  Add
                </Button>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {campaign ? "Update Campaign" : "Create Campaign"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
} 
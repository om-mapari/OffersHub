import { useState } from "react";
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
import { Offer } from "../data/schema";

interface OfferFormProps {
  offer?: Offer;
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
}

// Basic form schema for common offer fields
const offerFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  // We'll handle the dynamic JSONB data separately
});

type FormData = z.infer<typeof offerFormSchema> & {
  data: Record<string, any>;
};

export function OfferForm({ offer, onSubmit, onCancel }: OfferFormProps) {
  const { currentTenant } = useTenant();
  const { user } = useAuth();
  
  // State for dynamic JSON data
  const [jsonData, setJsonData] = useState<Record<string, any>>(
    offer?.data || {}
  );
  
  // For adding new key-value pairs to the JSON data
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  const form = useForm<z.infer<typeof offerFormSchema>>({
    resolver: zodResolver(offerFormSchema),
    defaultValues: {
      name: offer?.name || "",
    },
  });

  const handleSubmit = (values: z.infer<typeof offerFormSchema>) => {
    const formData: FormData = {
      ...values,
      data: jsonData,
    };
    
    onSubmit(formData);
  };

  const addKeyValuePair = () => {
    if (newKey.trim() === "") return;
    
    setJsonData((prev) => ({
      ...prev,
      [newKey]: newValue,
    }));
    
    setNewKey("");
    setNewValue("");
  };

  const removeKeyValuePair = (key: string) => {
    setJsonData((prev) => {
      const newData = { ...prev };
      delete newData[key];
      return newData;
    });
  };

  if (!currentTenant) {
    return <div>Please select a tenant to create or edit an offer.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {offer ? "Edit Offer" : "Create New Offer"}
        </h2>
        <p className="text-muted-foreground">
          {offer
            ? `Update offer details for ${currentTenant.name}`
            : `Create a new offer for ${currentTenant.name}`}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Offer Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter offer name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* JSON Data Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Offer Details</h3>
            <p className="text-sm text-muted-foreground">
              Add tenant-specific attributes for this offer.
            </p>

            {/* Display existing JSON data */}
            {Object.entries(jsonData).length > 0 ? (
              <div className="rounded-md border p-4 space-y-2">
                {Object.entries(jsonData).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">{key}:</span>{" "}
                      <span>{String(value)}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeKeyValuePair(key)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground italic">
                No attributes added yet.
              </div>
            )}

            {/* Add new key-value pair */}
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <FormLabel>Attribute Name</FormLabel>
                <Input
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  placeholder="e.g., interest_rate"
                />
              </div>
              <div className="flex-1">
                <FormLabel>Value</FormLabel>
                <Input
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="e.g., 5.99"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={addKeyValuePair}
                className="mb-0.5"
              >
                Add
              </Button>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {offer ? "Update Offer" : "Create Offer"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
} 
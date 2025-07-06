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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Offer } from "../data/schema";
import offerTypesByTenant from "../data/offers_types_by_tenant.json";
import { Sparkles, AlertCircle } from "lucide-react";
import { generateOfferData } from "@/services/azure-openai";
import { toast } from "sonner";
import { useAzureConfig } from "@/hooks/use-azure-config";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface OfferFormProps {
  offer?: Offer;
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
}

// Basic form schema for common offer fields
const offerFormSchema = z.object({
  offer_description: z.string().min(2, {
    message: "Description must be at least 2 characters.",
  }),
  offer_type: z.string().min(1, {
    message: "Please select an offer type.",
  }),
  comments: z.string().optional(),
});

type FormData = z.infer<typeof offerFormSchema> & {
  data: Record<string, any>;
};

export function OfferForm({ offer, onSubmit, onCancel }: OfferFormProps) {
  const { currentTenant } = useTenant();
  const { isValid: isAzureConfigValid, missingVars } = useAzureConfig();
  
  // State for tenant offer types
  const [offerTypes, setOfferTypes] = useState<string[]>([]);
  
  // State for selected offer type
  const [selectedOfferType, setSelectedOfferType] = useState<string>(offer?.offer_type || "");
  
  // State for default attributes of selected offer type
  const [defaultAttributes, setDefaultAttributes] = useState<Record<string, any>>({});
  
  // State for dynamic JSON data
  const [jsonData, setJsonData] = useState<Record<string, any>>(
    offer?.data || {}
  );
  
  // For adding new key-value pairs to the JSON data
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  
  // State for AI generation
  const [isGenerating, setIsGenerating] = useState(false);

  const form = useForm<z.infer<typeof offerFormSchema>>({
    resolver: zodResolver(offerFormSchema),
    defaultValues: {
      offer_description: offer?.offer_description || "",
      offer_type: offer?.offer_type || "",
      comments: offer?.comments || "",
    },
  });

  // Load offer types based on the selected tenant
  useEffect(() => {
    if (!currentTenant) return;
    
    const tenantName = currentTenant.name;
    if (tenantName && offerTypesByTenant[tenantName as keyof typeof offerTypesByTenant]) {
      const types = Object.keys(offerTypesByTenant[tenantName as keyof typeof offerTypesByTenant]);
      setOfferTypes(types);
      
      // Reset offer type if the current one isn't valid for this tenant
      if (selectedOfferType && !types.includes(selectedOfferType)) {
        setSelectedOfferType("");
        form.setValue("offer_type", "");
      }
    } else {
      setOfferTypes([]);
    }
  }, [currentTenant]);

  // Load default attributes when offer type changes
  useEffect(() => {
    if (!currentTenant || !selectedOfferType) {
      setDefaultAttributes({});
      return;
    }
    
    const tenantName = currentTenant.name;
    const tenantData = offerTypesByTenant[tenantName as keyof typeof offerTypesByTenant];
    
    if (tenantData && tenantData[selectedOfferType as keyof typeof tenantData]) {
      const typeAttributes = tenantData[selectedOfferType as keyof typeof tenantData];
      setDefaultAttributes(typeAttributes as Record<string, any>);
      
      // Initialize jsonData with default attribute keys if creating a new offer
      if (!offer) {
        // Create a template with empty values based on the attribute types
        const template: Record<string, any> = {};
        Object.entries(typeAttributes as Record<string, any>).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            template[key] = [];
          } else if (typeof value === 'number') {
            template[key] = 0;
          } else if (typeof value === 'boolean') {
            template[key] = false;
          } else {
            template[key] = "";
          }
        });
        setJsonData(template);
      }
    } else {
      setDefaultAttributes({});
    }
  }, [selectedOfferType, currentTenant]);

  const handleOfferTypeChange = (value: string) => {
    setSelectedOfferType(value);
    form.setValue("offer_type", value);
  };

  const handleAttributeChange = (key: string, value: any) => {
    setJsonData(prev => ({
      ...prev,
      [key]: value
    }));
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

  const handleSubmit = (values: z.infer<typeof offerFormSchema>) => {
    const formData: FormData = {
      ...values,
      data: jsonData,
    };
    
    onSubmit(formData);
  };
  
  // Function to handle AI fill
  const handleAIFill = async () => {
    if (!currentTenant || !selectedOfferType || Object.keys(defaultAttributes).length === 0) {
      toast.error("Please select an offer type first.");
      return;
    }
    
    try {
      setIsGenerating(true);
      
      // Show a loading toast
      toast.loading("Generating offer data with AI...");
      
      const tenantName = currentTenant.name;
      console.log('Generating AI offer for', { tenantName, selectedOfferType, defaultAttributes });
      
      const generatedData = await generateOfferData(
        tenantName,
        selectedOfferType,
        defaultAttributes
      );
      
      console.log('Generated offer data:', generatedData);
      
      // Update form values with generated data
      form.setValue('offer_description', generatedData.description);
      form.setValue('comments', generatedData.comments || '');
      
      // Update attribute values
      const newJsonData: Record<string, any> = { ...jsonData };
      
      // Update default attributes with AI values
      Object.entries(generatedData.attributeValues).forEach(([key, value]) => {
        if (key in defaultAttributes) {
          // For array values that might come as string
          if (Array.isArray(defaultAttributes[key]) && typeof value === 'string') {
            try {
              newJsonData[key] = value.split(',').map(item => item.trim());
            } catch (e) {
              newJsonData[key] = value;
            }
          } else {
            newJsonData[key] = value;
          }
        }
      });
      
      // Add custom attributes
      Object.entries(generatedData.customAttributes || {}).forEach(([key, value]) => {
        if (!(key in defaultAttributes)) {
          newJsonData[key] = value;
        }
      });
      
      setJsonData(newJsonData);
      
      // Dismiss all toasts and show success
      toast.dismiss();
      toast.success("Form filled with AI-generated data.");
    } catch (error) {
      console.error('Error filling form with AI:', error);
      toast.dismiss();
      toast.error("Failed to generate data. Please try again or fill the form manually.", {
        description: error instanceof Error ? error.message : "Unknown error",
        duration: 4000,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (!currentTenant) {
    return <div>Please select a tenant to create or edit an offer.</div>;
  }

  // Render input field based on attribute type
  const renderAttributeInput = (key: string) => {
    // Determine the input type based on the attribute value type in the template
    const templateValue = defaultAttributes[key];
    const currentValue = jsonData[key];

    if (Array.isArray(templateValue)) {
      // For array values, use a comma-separated input
      return (
        <Input
          value={Array.isArray(currentValue) ? currentValue.join(", ") : ""}
          onChange={(e) => {
            const values = e.target.value.split(",").map(v => v.trim());
            handleAttributeChange(key, values);
          }}
          placeholder={`e.g., ${Array.isArray(templateValue) ? templateValue.join(", ") : ""}`}
          className="w-full"
        />
      );
    } else if (typeof templateValue === 'number') {
      return (
        <Input
          type="number"
          value={currentValue || ""}
          onChange={(e) => handleAttributeChange(key, parseFloat(e.target.value) || 0)}
          placeholder={`e.g., ${templateValue}`}
          className="w-full"
        />
      );
    } else if (typeof templateValue === 'boolean') {
      return (
        <Select
          value={currentValue ? "true" : "false"}
          onValueChange={(v) => handleAttributeChange(key, v === "true")}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select value" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">True</SelectItem>
            <SelectItem value="false">False</SelectItem>
          </SelectContent>
        </Select>
      );
    } else {
      // Default to string input
      return (
        <Input
          value={currentValue || ""}
          onChange={(e) => handleAttributeChange(key, e.target.value)}
          placeholder={`e.g., ${templateValue}`}
          className="w-full"
        />
      );
    }
  };

  return (
    <div className="space-y-4 max-w-3xl mx-auto px-2">
      <div>
        <h2 className="text-xl font-bold tracking-tight">
          {offer ? "Edit Offer" : "Create New Offer"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {offer
            ? `Update offer details for ${currentTenant.name}`
            : `Create a new offer for ${currentTenant.name}`}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {/* Offer Type Selection */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-2">
            <div className="flex-1">
              <FormField
                control={form.control}
                name="offer_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Offer Type</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleOfferTypeChange(value);
                      }}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select an offer type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {offerTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.replace(/_/g, ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* AI Fill Button */}
            <div className="w-full sm:w-auto">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full sm:w-auto"
                        onClick={handleAIFill}
                        disabled={!selectedOfferType || isGenerating}
                      >
                        {isGenerating ? (
                          <>
                            <svg 
                              className="animate-spin -ml-1 mr-2 h-4 w-4" 
                              xmlns="http://www.w3.org/2000/svg" 
                              fill="none" 
                              viewBox="0 0 24 24"
                            >
                              <circle 
                                className="opacity-25" 
                                cx="12" cy="12" r="10" 
                                stroke="currentColor" 
                                strokeWidth="4"
                              />
                              <path 
                                className="opacity-75" 
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            AI Fill
                          </>
                        )}
                      </Button>
                    </div>
                  </TooltipTrigger>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Offer Description */}
          <FormField
            control={form.control}
            name="offer_description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Offer Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Enter a description for this offer" 
                    className="resize-none h-20" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Comments (Optional) */}
          <FormField
            control={form.control}
            name="comments"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Comments (Optional)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Add any additional comments" 
                    className="resize-none h-20" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Dynamic Attributes Section */}
          {selectedOfferType && (
            <div className="space-y-3 border p-2 sm:p-3 rounded-md">
              <div>
                <h3 className="text-md font-medium">Offer Attributes</h3>
                <p className="text-xs text-muted-foreground">
                  Configure the attributes for this {selectedOfferType.replace(/_/g, ' ')} offer.
                </p>
              </div>

              <div className="space-y-4">
                {Object.keys(defaultAttributes).map((key) => (
                  <div key={key} className="flex flex-col sm:grid sm:grid-cols-3 gap-1 sm:gap-2 sm:items-center">
                    <div className="text-sm font-medium capitalize mb-1 sm:mb-0 col-span-1">
                      {key.replace(/_/g, ' ')}:
                    </div>
                    <div className="col-span-1 sm:col-span-2">
                      {renderAttributeInput(key)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Custom Attributes Section */}
          <div className="space-y-3 border p-2 sm:p-3 rounded-md">
            <div>
              <h3 className="text-md font-medium">Custom Attributes</h3>
              <p className="text-xs text-muted-foreground">
                Add custom attributes specific to this offer.
              </p>
            </div>

            {/* Display custom attributes */}
            {Object.entries(jsonData)
              .filter(([key]) => !defaultAttributes[key]) // Only show custom attributes
              .length > 0 ? (
              <div className="border rounded-md p-2 mb-3 bg-gray-50 dark:bg-gray-900">
                <div className="space-y-2">
                  {Object.entries(jsonData)
                    .filter(([key]) => !defaultAttributes[key]) // Only show custom attributes
                    .map(([key, value], index, array) => (
                      <div 
                        key={key} 
                        className={`flex flex-wrap sm:flex-nowrap items-center justify-between ${index < array.length - 1 ? 'border-b pb-2 mb-2' : ''}`}
                      >
                        <div className="truncate mr-2 max-w-full sm:max-w-[70%] mb-1 sm:mb-0">
                          <span className="font-medium capitalize break-all">{key.replace(/_/g, ' ')}:</span>{" "}
                          <span className="text-sm break-all">{Array.isArray(value) ? value.join(", ") : String(value)}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeKeyValuePair(key)}
                          className="ml-auto"
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground italic mb-3">
                No custom attributes added yet.
              </div>
            )}

            {/* Add new key-value pair - Add a separator line for visual distinction */}
            <div className="border-t pt-3">
              <p className="text-xs font-medium mb-2">Add New Attribute</p>
              <div className="flex flex-col sm:grid sm:grid-cols-7 gap-3 sm:gap-2">
                <div className="sm:col-span-3">
                  <FormLabel className="text-xs">Attribute Name</FormLabel>
                  <Input
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                    placeholder="e.g., campaign_code"
                    className="h-8 text-sm w-full mt-1"
                  />
                </div>
                <div className="sm:col-span-3">
                  <FormLabel className="text-xs">Value</FormLabel>
                  <Input
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    placeholder="e.g., SUMMER2023"
                    className="h-8 text-sm w-full mt-1"
                  />
                </div>
                <div className="sm:col-span-1 flex items-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addKeyValuePair}
                    className="h-8 w-full"
                    size="sm"
                    disabled={!newKey.trim()}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={!selectedOfferType}>
              {offer ? "Update Offer" : "Create Offer"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
} 
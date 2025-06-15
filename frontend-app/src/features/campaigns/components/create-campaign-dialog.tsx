import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCampaigns } from '../context/campaigns-context'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { campaignCreateSchema, CampaignCreate } from '../data/schema'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Plus, Trash, Sparkles } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { useTenant } from '@/context/TenantContext'
import { campaignsApi } from '../api/campaigns-api'
import { Offer } from '@/features/offers/data/schema'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAzureConfig } from '@/hooks/use-azure-config'
import { generateCampaignData } from '@/services/azure-openai'

// Type for structured selection criteria
interface StructuredCriterion {
  criterion: string;
  operator: string;
  value: string;
}

// Helper function to truncate offer description
const truncateDescription = (description: string, maxLength = 35): string => {
  return description.length > maxLength 
    ? `${description.substring(0, maxLength)}...` 
    : description;
};

// Define the selection criteria options from selection-criterion.md
const SELECTION_CRITERIA = [
  {
    name: 'credit_score',
    operators: ['>', '<', '='],
    valueType: 'number',
    values: [] // For number inputs, values are determined by user input
  },
  {
    name: 'gender',
    operators: ['=', '!'],
    valueType: 'select',
    values: ['male', 'female', 'other']
  },
  {
    name: 'is_active',
    operators: ['='],
    valueType: 'boolean',
    values: ['true', 'false']
  },
  {
    name: 'occupation',
    operators: ['='],
    valueType: 'select',
    values: ['salaried', 'self-employed', 'student', 'retired']
  },
  {
    name: 'marital_status',
    operators: ['='],
    valueType: 'select',
    values: ['single', 'married', 'divorced', 'widowed']
  },
  {
    name: 'segment',
    operators: ['=', '!'],
    valueType: 'select',
    values: ['premium', 'regular', 'corporate']
  },
  {
    name: 'deliquency',
    operators: ['='],
    valueType: 'boolean',
    values: ['true', 'false']
  },
  {
    name: 'kyc_status',
    operators: ['='],
    valueType: 'select',
    values: ['verified', 'pending', 'rejected']
  }
]

export function CreateCampaignDialog() {
  const { isCreateDialogOpen, setIsCreateDialogOpen, createCampaign } = useCampaigns()
  const { currentTenant } = useTenant()
  const { token } = useAuth()
  const { isValid: isAzureConfigValid, missingVars } = useAzureConfig()
  const [offers, setOffers] = useState<Offer[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectionCriteria, setSelectionCriteria] = useState<StructuredCriterion[]>([])
  const [startDate, setStartDate] = useState<Date | undefined>(new Date())
  const [endDate, setEndDate] = useState<Date | undefined>(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
  const [selectedOfferDetails, setSelectedOfferDetails] = useState<Offer | null>(null)

  const form = useForm<z.infer<typeof campaignCreateSchema>>({
    resolver: zodResolver(campaignCreateSchema),
    defaultValues: {
      name: '',
      offer_id: undefined,
      description: '',
      selection_criteria: {},
      start_date: formatDateToYYYYMMDD(new Date()),
      end_date: formatDateToYYYYMMDD(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
    }
  })

  // Helper function to format date to YYYY-MM-DD
  function formatDateToYYYYMMDD(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Fetch offers for dropdown
  useEffect(() => {
    if (currentTenant && isCreateDialogOpen && token) {
      setIsLoading(true);
      campaignsApi.getOffers(currentTenant.name)
        .then(data => {
          // Filter only approved offers
          const approvedOffers = data.filter((offer: any) => offer.status === 'approved')
          setOffers(approvedOffers)
          setIsLoading(false)
        })
        .catch(err => {
          console.error('Error fetching offers:', err)
          toast.error('Failed to fetch offers', { duration: 10000 })
          setIsLoading(false)
        })
    }
  }, [currentTenant, isCreateDialogOpen, token])

  // Update selected offer details when offer_id changes
  useEffect(() => {
    const selectedOfferId = form.getValues('offer_id')?.toString();
    if (!selectedOfferId || isLoading) {
      setSelectedOfferDetails(null);
      return;
    }
    
    const offer = offers.find((o: Offer) => o.id.toString() === selectedOfferId);
    setSelectedOfferDetails(offer || null);
  }, [form.watch('offer_id'), offers, isLoading]);

  // Handle AI Fill button click
  const handleAIFill = async () => {
    if (!selectedOfferDetails) {
      toast.error("Please select an offer first");
      return;
    }

    if (!isAzureConfigValid) {
      toast.error("Azure OpenAI configuration is missing. Please check your environment variables.", {
        description: `Missing: ${missingVars.join(', ')}`,
        duration: 10000,
      });
      return;
    }

    if (!currentTenant) {
      toast.error("Tenant information is missing");
      return;
    }

    setIsGenerating(true);
    toast.loading("Generating campaign data with AI...");

    try {
      const generatedData = await generateCampaignData(
        selectedOfferDetails,
        currentTenant.name
      );

      // Update form with generated data
      form.setValue('name', generatedData.name);
      form.setValue('description', generatedData.description);

      // Update selection criteria
      const newCriteria = generatedData.selectionCriteria.map(criterion => ({
        criterion: criterion.criterion,
        operator: criterion.operator,
        value: criterion.value
      }));
      setSelectionCriteria(newCriteria);

      toast.dismiss();
      toast.success("Campaign data generated successfully");
    } catch (error) {
      console.error('Error generating campaign data:', error);
      toast.dismiss();
      toast.error("Failed to generate campaign data", {
        description: error instanceof Error ? error.message : "Unknown error",
        duration: 10000,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle form submission
  const onSubmit = async (data: z.infer<typeof campaignCreateSchema>) => {
    if (!token) {
      toast.error('You must be authenticated to create a campaign', { duration: 10000 })
      return
    }
    
    // Format criteria for API
    const criteriaObject: Record<string, string> = {};
    
    selectionCriteria.forEach(({ criterion, operator, value }) => {
      if (criterion && operator && value) {
        criteriaObject[criterion] = `${operator}${value}`;
      }
    });

    const campaignData: CampaignCreate = {
      ...data,
      selection_criteria: criteriaObject,
    }

    try {
      await createCampaign(campaignData)
      setIsCreateDialogOpen(false)
      form.reset()
      setStartDate(new Date())
      setEndDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
      setSelectionCriteria([])
    } catch (error) {
      console.error('Error creating campaign:', error)
      toast.error('Failed to create campaign', { duration: 10000 })
    }
  }

  // Handle selection criteria
  const addCriterion = () => {
    setSelectionCriteria([
      ...selectionCriteria, 
      { 
        criterion: '', 
        operator: '', 
        value: '' 
      }
    ]);
  }

  const removeCriterion = (index: number) => {
    const newCriteria = [...selectionCriteria]
    newCriteria.splice(index, 1)
    setSelectionCriteria(newCriteria)
  }

  const updateCriterion = (index: number, field: keyof StructuredCriterion, value: string) => {
    const newCriteria = [...selectionCriteria];
    
    // Update the specific field
    newCriteria[index] = {
      ...newCriteria[index],
      [field]: value
    }
    
    // If criterion type changed, reset operator and value
    if (field === 'criterion') {
      const criterionDef = SELECTION_CRITERIA.find(c => c.name === value)
      if (criterionDef) {
        newCriteria[index].operator = '';
        newCriteria[index].value = '';
      }
    }
    
    setSelectionCriteria(newCriteria)
  }

  // Get available criteria options excluding already selected ones
  const getAvailableCriteria = (currentIndex: number): typeof SELECTION_CRITERIA => {
    const usedCriteria = selectionCriteria
      .filter((_, i) => i !== currentIndex)
      .map(c => c.criterion);
    
    return SELECTION_CRITERIA.filter(c => !usedCriteria.includes(c.name));
  }

  // Get available operators for a criterion
  const getOperatorsForCriterion = (criterionName: string): string[] => {
    const criterionDef = SELECTION_CRITERIA.find(c => c.name === criterionName)
    return criterionDef?.operators || []
  }

  // Get available values for a criterion
  const getValuesForCriterion = (criterionName: string): string[] => {
    const criterionDef = SELECTION_CRITERIA.find(c => c.name === criterionName)
    return criterionDef?.values || []
  }

  // Get value type for a criterion
  const getValueTypeForCriterion = (criterionName: string): string => {
    const criterionDef = SELECTION_CRITERIA.find(c => c.name === criterionName)
    return criterionDef?.valueType || 'text'
  }

  // Fix for date selection
  const handleStartDateSelect = (date: Date | undefined) => {
    setStartDate(date)
    if (date) {
      form.setValue('start_date', formatDateToYYYYMMDD(date));
    }
  }

  const handleEndDateSelect = (date: Date | undefined) => {
    setEndDate(date)
    if (date) {
      form.setValue('end_date', formatDateToYYYYMMDD(date));
    }
  }

  return (
    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Campaign</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Campaign Name</Label>
              <Input
                id="name"
                placeholder="Enter campaign name"
                {...form.register('name')}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Enter campaign description"
                {...form.register('description')}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-end justify-between mb-1">
                <Label htmlFor="offer_id">Select Offer</Label>
                
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAIFill}
                  disabled={!selectedOfferDetails || isGenerating || !isAzureConfigValid}
                  className="h-8"
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
              <Select
                onValueChange={(value) => form.setValue('offer_id', parseInt(value))}
                defaultValue={form.getValues('offer_id')?.toString()}
              >
                <SelectTrigger className="truncate">
                  <SelectValue placeholder="Select an offer" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {isLoading ? (
                    <SelectItem value="loading" disabled>Loading offers...</SelectItem>
                  ) : offers.length > 0 ? (
                    offers.map((offer: Offer) => {
                      const truncatedDesc = truncateDescription(offer.offer_description);
                      
                      return (
                        <SelectItem 
                          key={offer.id} 
                          value={offer.id.toString()}
                          title={offer.offer_description}
                          className="flex items-center"
                        >
                          <div className="truncate">
                            {truncatedDesc} ({offer.offer_type})
                          </div>
                        </SelectItem>
                      );
                    })
                  ) : (
                    <SelectItem value="none" disabled>No approved offers available</SelectItem>
                  )}
                </SelectContent>
              </Select>
              {form.formState.errors.offer_id && (
                <p className="text-sm text-red-500">{form.formState.errors.offer_id.message}</p>
              )}
              
              {selectedOfferDetails && (
                <div className="mt-1 text-xs text-muted-foreground">
                  <span 
                    title={selectedOfferDetails.offer_description} 
                    className="cursor-help hover:text-foreground transition-colors"
                  >
                    {truncateDescription(selectedOfferDetails.offer_description, 50)} ({selectedOfferDetails.offer_type})
                  </span>
                </div>
              )}

              {!selectedOfferDetails && !isLoading && (
                <div className="mt-1 text-xs text-amber-500">
                  <span>Select an offer to enable AI Fill</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? (
                        format(startDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={handleStartDateSelect}
                      initialFocus
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? (
                        format(endDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={handleEndDateSelect}
                      initialFocus
                      disabled={(date) => startDate ? date < startDate : date < new Date(new Date().setHours(0, 0, 0, 0))}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Selection Criteria</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={addCriterion}
                  disabled={selectionCriteria.length >= SELECTION_CRITERIA.length}
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Criterion
                </Button>
              </div>
              
              <ScrollArea className="h-[200px] rounded-md border p-4">
                {selectionCriteria.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground py-8">
                    <p>No selection criteria added yet</p>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={addCriterion}
                      className="mt-2"
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Your First Criterion
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectionCriteria.map((criterion, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        {/* Criterion Type Selection */}
                        <Select
                          value={criterion.criterion}
                          onValueChange={(value) => updateCriterion(index, 'criterion', value)}
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {getAvailableCriteria(index).map((criterionOption) => (
                              <SelectItem key={criterionOption.name} value={criterionOption.name}>
                                {criterionOption.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {/* Operator Selection */}
                        <Select
                          value={criterion.operator}
                          onValueChange={(value) => updateCriterion(index, 'operator', value)}
                          disabled={!criterion.criterion}
                        >
                          <SelectTrigger className="w-[80px]">
                            <SelectValue placeholder="Op" />
                          </SelectTrigger>
                          <SelectContent>
                            {getOperatorsForCriterion(criterion.criterion).map((op) => (
                              <SelectItem key={op} value={op}>
                                {op}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {/* Value Selection or Input based on type */}
                        {criterion.criterion && getValueTypeForCriterion(criterion.criterion) === 'select' ? (
                          <Select
                            value={criterion.value}
                            onValueChange={(value) => updateCriterion(index, 'value', value)}
                            disabled={!criterion.operator}
                          >
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="Value" />
                            </SelectTrigger>
                            <SelectContent>
                              {getValuesForCriterion(criterion.criterion).map((val) => (
                                <SelectItem key={val} value={val}>
                                  {val}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : criterion.criterion && getValueTypeForCriterion(criterion.criterion) === 'boolean' ? (
                          <Select
                            value={criterion.value}
                            onValueChange={(value) => updateCriterion(index, 'value', value)}
                            disabled={!criterion.operator}
                          >
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="Value" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="true">true</SelectItem>
                              <SelectItem value="false">false</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            type="text"
                            placeholder="Value"
                            value={criterion.value}
                            onChange={(e) => updateCriterion(index, 'value', e.target.value)}
                            className="flex-1"
                            disabled={!criterion.operator}
                          />
                        )}

                        {/* Remove button */}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeCriterion(index)}
                          aria-label="Remove criterion"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>Create Campaign</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 
import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCampaigns } from '../context/campaigns-context'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { campaignUpdateSchema, CampaignUpdate, Campaign } from '../data/schema'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Plus, Trash } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'
import { useTenant } from '@/context/TenantContext'
import { campaignsApi } from '../api/campaigns-api'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

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

// Type for structured selection criteria
interface StructuredCriterion {
  criterion: string;
  operator: string;
  value: string;
}

export function CampaignEditDialog() {
  const { 
    selectedCampaign, 
    isEditDialogOpen, 
    setIsEditDialogOpen, 
    fetchCampaigns 
  } = useCampaigns()
  
  const { currentTenant } = useTenant()
  const { isAuthenticated } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [selectionCriteria, setSelectionCriteria] = useState<StructuredCriterion[]>([])
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)

  // Helper function to format date to YYYY-MM-DD
  function formatDateToYYYYMMDD(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  const form = useForm<z.infer<typeof campaignUpdateSchema>>({
    resolver: zodResolver(campaignUpdateSchema),
    defaultValues: {
      name: '',
      description: '',
      selection_criteria: {},
      start_date: '',
      end_date: '',
    }
  })

  // Parse structured criteria from API format
  const parseApiSelectionCriteria = (criteria: Record<string, any>): StructuredCriterion[] => {
    const result: StructuredCriterion[] = [];
    
    Object.entries(criteria).forEach(([key, value]) => {
      const criterion = key;
      let operator = '=';
      let criterionValue = String(value);
      
      // Check if value contains operator
      if (typeof value === 'string') {
        if (value.startsWith('=')) {
          operator = '=';
          criterionValue = value.substring(1);
        } else if (value.startsWith('>')) {
          operator = '>';
          criterionValue = value.substring(1);
        } else if (value.startsWith('<')) {
          operator = '<';
          criterionValue = value.substring(1);
        } else if (value.startsWith('!')) {
          operator = '!';
          criterionValue = value.substring(1);
        }
      }
      
      result.push({
        criterion,
        operator,
        value: criterionValue
      });
    });
    
    return result;
  };

  // Initialize form when selected campaign changes
  useEffect(() => {
    if (selectedCampaign && isEditDialogOpen) {
      const startDateObj = parseISO(selectedCampaign.start_date);
      const endDateObj = parseISO(selectedCampaign.end_date);
      
      // Reset form with campaign data
      form.reset({
        name: selectedCampaign.name,
        description: selectedCampaign.description || '',
        start_date: formatDateToYYYYMMDD(startDateObj),
        end_date: formatDateToYYYYMMDD(endDateObj),
      })
      
      // Set dates for the date pickers
      setStartDate(startDateObj)
      setEndDate(endDateObj)
      
      // Parse selection criteria from API format
      const parsedCriteria = parseApiSelectionCriteria(selectedCampaign.selection_criteria);
      setSelectionCriteria(parsedCriteria);
    }
  }, [selectedCampaign, isEditDialogOpen, form])

  // Handle form submission
  const onSubmit = async (data: z.infer<typeof campaignUpdateSchema>) => {
    if (!isAuthenticated || !selectedCampaign || !currentTenant) {
      toast.error('Authentication or campaign data error', { duration: 4000 })
      return
    }
    
    setIsLoading(true)
    
    // Format criteria for API
    const criteriaObject: Record<string, string> = {};
    
    selectionCriteria.forEach(({ criterion, operator, value }) => {
      if (criterion && operator && value) {
        criteriaObject[criterion] = `${operator}${value}`;
      }
    });

    const campaignData: CampaignUpdate = {
      ...data,
      selection_criteria: criteriaObject,
    }

    try {
      await campaignsApi.updateCampaign(currentTenant.name, selectedCampaign.id, campaignData)
      await fetchCampaigns()
      setIsEditDialogOpen(false)
      toast.success('Campaign updated successfully', { duration: 4000 })
    } catch (error) {
      console.error('Error updating campaign:', error)
      toast.error('Failed to update campaign', { duration: 4000 })
    } finally {
      setIsLoading(false)
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

  if (!selectedCampaign) {
    return null
  }

  return (
    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Campaign</DialogTitle>
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
                      disabled={(date) => startDate ? date < startDate : false}
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
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Campaign'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 
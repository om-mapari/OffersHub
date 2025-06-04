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
  const [selectionCriteria, setSelectionCriteria] = useState<{ key: string; value: string }[]>([])
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
      
      // Convert selection criteria object to array format for UI
      const criteriaArray = Object.entries(selectedCampaign.selection_criteria).map(
        ([key, value]) => ({ key, value: String(value) })
      )
      
      // Ensure at least one criterion exists
      setSelectionCriteria(criteriaArray.length > 0 
        ? criteriaArray 
        : [{ key: 'selection_criteria', value: 'ai_generated' }]
      )
    }
  }, [selectedCampaign, isEditDialogOpen, form])

  // Handle form submission
  const onSubmit = async (data: z.infer<typeof campaignUpdateSchema>) => {
    if (!isAuthenticated || !selectedCampaign || !currentTenant) {
      toast.error('Authentication or campaign data error', { duration: 10000 })
      return
    }
    
    setIsLoading(true)
    
    // Convert selection criteria array to object
    const criteriaObject = selectionCriteria.reduce((acc, { key, value }) => {
      if (key && value) {
        acc[key] = value
      }
      return acc
    }, {} as Record<string, string>)

    const campaignData: CampaignUpdate = {
      ...data,
      selection_criteria: criteriaObject,
    }

    try {
      await campaignsApi.updateCampaign(currentTenant.name, selectedCampaign.id, campaignData)
      await fetchCampaigns()
      setIsEditDialogOpen(false)
      toast.success('Campaign updated successfully', { duration: 10000 })
    } catch (error) {
      console.error('Error updating campaign:', error)
      toast.error('Failed to update campaign', { duration: 10000 })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle selection criteria
  const addCriterion = () => {
    setSelectionCriteria([...selectionCriteria, { key: '', value: '' }])
  }

  const removeCriterion = (index: number) => {
    const newCriteria = [...selectionCriteria]
    newCriteria.splice(index, 1)
    setSelectionCriteria(newCriteria)
  }

  const updateCriterion = (index: number, field: 'key' | 'value', value: string) => {
    const newCriteria = [...selectionCriteria]
    newCriteria[index][field] = value
    setSelectionCriteria(newCriteria)
  }

  // Fix for date selection
  const handleStartDateSelect = (date: Date | undefined) => {
    setStartDate(date)
    if (date) {
      // Use a method that preserves the exact date without timezone adjustments
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      form.setValue('start_date', formattedDate);
    }
  }

  const handleEndDateSelect = (date: Date | undefined) => {
    setEndDate(date)
    if (date) {
      // Use a method that preserves the exact date without timezone adjustments
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      form.setValue('end_date', formattedDate);
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
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Criterion
                </Button>
              </div>
              
              <ScrollArea className="h-[200px] rounded-md border p-4">
                <div className="space-y-3">
                  {selectionCriteria.map((criterion, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        placeholder="Key"
                        value={criterion.key}
                        onChange={(e) => updateCriterion(index, 'key', e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        placeholder="Value"
                        value={criterion.value}
                        onChange={(e) => updateCriterion(index, 'value', e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCriterion(index)}
                        disabled={index === 0 && selectionCriteria.length === 1}
                        aria-label="Remove criterion"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
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
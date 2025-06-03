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
import { CalendarIcon, Plus, Trash } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { useTenant } from '@/context/TenantContext'
import { campaignsApi } from '../api/campaigns-api'
import { Offer } from '@/features/offers/data/schema'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'
import { ScrollArea } from '@/components/ui/scroll-area'

export function CreateCampaignDialog() {
  const { isCreateDialogOpen, setIsCreateDialogOpen, createCampaign } = useCampaigns()
  const { currentTenant } = useTenant()
  const { isAuthenticated } = useAuth()
  const [offers, setOffers] = useState<Offer[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectionCriteria, setSelectionCriteria] = useState<{ key: string; value: string }[]>([
    { key: 'selection_criteria', value: 'ai_generated' }
  ])
  const [startDate, setStartDate] = useState<Date | undefined>(new Date())
  const [endDate, setEndDate] = useState<Date | undefined>(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))

  const form = useForm<z.infer<typeof campaignCreateSchema>>({
    resolver: zodResolver(campaignCreateSchema),
    defaultValues: {
      name: '',
      offer_id: undefined,
      description: '',
      selection_criteria: { selection_criteria: 'ai_generated' },
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    }
  })

  // Fetch offers for dropdown
  useEffect(() => {
    if (currentTenant && isCreateDialogOpen && isAuthenticated) {
      setIsLoading(true)
      campaignsApi.getOffers(currentTenant.name)
        .then(data => {
          // Filter only approved offers
          const approvedOffers = data.filter((offer: any) => offer.status === 'approved')
          setOffers(approvedOffers)
          setIsLoading(false)
        })
        .catch(err => {
          console.error('Error fetching offers:', err)
          toast.error('Failed to fetch offers')
          setIsLoading(false)
        })
    }
  }, [currentTenant, isCreateDialogOpen, isAuthenticated])

  // Handle form submission
  const onSubmit = async (data: z.infer<typeof campaignCreateSchema>) => {
    if (!isAuthenticated) {
      toast.error('You must be authenticated to create a campaign')
      return
    }
    
    // Convert selection criteria array to object
    const criteriaObject = selectionCriteria.reduce((acc, { key, value }) => {
      if (key && value) {
        acc[key] = value
      }
      return acc
    }, {} as Record<string, string>)

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
      setSelectionCriteria([{ key: 'selection_criteria', value: 'ai_generated' }])
    } catch (error) {
      console.error('Error creating campaign:', error)
      toast.error('Failed to create campaign')
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
      const formattedDate = date.toISOString().split('T')[0]
      form.setValue('start_date', formattedDate)
    }
  }

  const handleEndDateSelect = (date: Date | undefined) => {
    setEndDate(date)
    if (date) {
      const formattedDate = date.toISOString().split('T')[0]
      form.setValue('end_date', formattedDate)
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
              <Label htmlFor="offer_id">Select Offer</Label>
              <Select
                onValueChange={(value) => form.setValue('offer_id', parseInt(value))}
                defaultValue={form.getValues('offer_id')?.toString()}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an offer" />
                </SelectTrigger>
                <SelectContent>
                  {isLoading ? (
                    <SelectItem value="loading" disabled>Loading offers...</SelectItem>
                  ) : offers.length > 0 ? (
                    offers.map((offer: Offer) => (
                      <SelectItem key={offer.id} value={offer.id.toString()}>
                        {offer.offer_description} ({offer.offer_type})
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>No approved offers available</SelectItem>
                  )}
                </SelectContent>
              </Select>
              {form.formState.errors.offer_id && (
                <p className="text-sm text-red-500">{form.formState.errors.offer_id.message}</p>
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
                        disabled={index === 0}
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
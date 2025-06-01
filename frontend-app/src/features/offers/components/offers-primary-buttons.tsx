import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useOffers } from '../context/offers-context'

export function OffersPrimaryButtons() {
  const { setIsCreateDialogOpen } = useOffers()

  return (
    <div className='flex items-center space-x-2'>
      <Button
        className='inline-flex items-center'
        onClick={() => setIsCreateDialogOpen(true)}
      >
        <Plus className='mr-2 h-4 w-4' />
        New Offer
      </Button>
    </div>
  )
} 
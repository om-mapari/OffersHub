import { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { Check, Clock, X, MoreHorizontal, FileText } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Offer, OfferStatus } from '../data/schema'
import { Button } from '@/components/ui/button'
import { useOffers } from '../context/offers-context'

// Status badge variants
const statusVariants: Record<OfferStatus, { variant: "default" | "outline" | "secondary" | "destructive" | "success"; icon: any }> = {
  draft: { variant: "secondary", icon: Clock },
  pending_review: { variant: "outline", icon: Clock },
  approved: { variant: "success", icon: Check },
  rejected: { variant: "destructive", icon: X },
  retired: { variant: "default", icon: FileText },
}

// Simple placeholder for row actions until we implement the full component
function OffersRowActions({ offer }: { offer: Offer }) {
  const { setSelectedOffer, setIsViewDialogOpen } = useOffers()
  
  return (
    <Button 
      variant="ghost" 
      className="h-8 w-8 p-0"
      onClick={() => {
        setSelectedOffer(offer)
        setIsViewDialogOpen(true)
      }}
    >
      <span className="sr-only">Open menu</span>
      <MoreHorizontal className="h-4 w-4" />
    </Button>
  )
}

export const columns: ColumnDef<Offer>[] = [
  {
    accessorKey: 'offer_description',
    header: 'Description',
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.getValue('offer_description')}</div>
        <div className="text-sm text-muted-foreground">{row.original.offer_type}</div>
      </div>
    ),
  },
  {
    accessorKey: 'created_by_username',
    header: 'Created By',
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue('created_by_username')}</div>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as OfferStatus
      const { variant, icon: Icon } = statusVariants[status]

      return (
        <Badge variant={variant as any} className="capitalize">
          <Icon className="mr-1 h-3 w-3" />
          {status.replace('_', ' ')}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'created_at',
    header: 'Created At',
    cell: ({ row }) => {
      return format(new Date(row.getValue('created_at')), 'MMM d, yyyy')
    },
  },
  {
    accessorKey: 'updated_at',
    header: 'Updated At',
    cell: ({ row }) => {
      return format(new Date(row.getValue('updated_at')), 'MMM d, yyyy')
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <OffersRowActions offer={row.original} />,
  },
] 
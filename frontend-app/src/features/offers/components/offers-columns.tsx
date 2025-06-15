import { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { Check, Clock, X, FileText } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Offer, OfferStatus } from '../data/schema'
import { OffersRowActions } from './offers-row-actions'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { ArrowUpDown } from 'lucide-react'

// Status badge variants
const statusVariants: Record<OfferStatus, { variant: "default" | "outline" | "secondary" | "destructive" | "success"; icon: any }> = {
  draft: { variant: "secondary", icon: Clock },
  pending_review: { variant: "outline", icon: Clock },
  approved: { variant: "success", icon: Check },
  rejected: { variant: "destructive", icon: X },
  retired: { variant: "default", icon: FileText },
}

export const columns: ColumnDef<Offer>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'offer_description',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Description
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const description = row.getValue('offer_description') as string;
      return (
        <div className="max-w-[300px]">
          <div 
            className="font-medium truncate" 
            title={description}
          >
            {description}
          </div>
          <div className="text-sm text-muted-foreground truncate">
            {row.original.offer_type}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'offer_type',
    header: 'Type',
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'created_by_username',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created By
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue('created_by_username') || 'System'}</div>
    ),
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
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
    enableSorting: true,
    enableHiding: true,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'created_at',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created At
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return format(new Date(row.getValue('created_at')), 'MMM d, yyyy')
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'updated_at',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Updated At
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return format(new Date(row.getValue('updated_at')), 'MMM d, yyyy')
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    id: 'actions',
    cell: ({ row }) => <OffersRowActions offer={row.original} />,
    enableHiding: false,
  },
] 
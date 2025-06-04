import { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Campaign, CampaignStatus } from '../data/schema'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { ArrowUpDown } from 'lucide-react'
import { Check, Clock, Pause, FileText } from 'lucide-react'
import { CampaignsRowActions } from './campaigns-row-actions'

// Status badge variants
const statusVariants: Record<CampaignStatus, { variant: "default" | "outline" | "secondary" | "destructive" | "success"; icon: any }> = {
  draft: { variant: "secondary", icon: Clock },
  active: { variant: "success", icon: Check },
  paused: { variant: "outline", icon: Pause },
  completed: { variant: "default", icon: FileText },
  approved: { variant: "success", icon: Check },
}

export const columns: ColumnDef<Campaign>[] = [
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
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue('name')}</div>
    ),
  },
  {
    accessorKey: 'offer_id',
    header: 'Offer ID',
    cell: ({ row }) => (
      <div>{row.getValue('offer_id')}</div>
    ),
    filterFn: (row, id, value) => {
      const offerId = row.getValue(id) as number;
      return value.includes(offerId.toString())
    },
  },
  {
    accessorKey: 'start_date',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Start Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return format(new Date(row.getValue('start_date')), 'MMM d, yyyy')
    },
  },
  {
    accessorKey: 'end_date',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          End Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return format(new Date(row.getValue('end_date')), 'MMM d, yyyy')
    },
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
      const status = row.getValue('status') as CampaignStatus
      const { variant, icon: Icon } = statusVariants[status]

      return (
        <Badge variant={variant as any} className="capitalize">
          <Icon className="mr-1 h-3 w-3" />
          {status.replace('_', ' ')}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'created_by_username',
    header: 'Created By',
    cell: ({ row }) => (
      <div>{row.getValue('created_by_username')}</div>
    ),
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
  },
  {
    id: 'actions',
    cell: ({ row }) => <CampaignsRowActions campaign={row.original} />,
    enableHiding: false,
  },
] 
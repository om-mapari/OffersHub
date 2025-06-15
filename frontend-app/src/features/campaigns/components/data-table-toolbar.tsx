import { Cross2Icon } from '@radix-ui/react-icons'
import { Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTableFacetedFilter } from '@/features/offers/components/data-table-faceted-filter'
import { DataTableViewOptions } from '@/features/offers/components/data-table-view-options'
import { Check, Clock, Pause, FileText, Tag } from 'lucide-react'
import { Campaign } from '../data/schema'
import { DataTableExport } from './data-table-export'
import { useCampaigns } from '../context/campaigns-context'

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  data: Campaign[]
}

export function DataTableToolbar<TData>({
  table,
  data,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0
  const { campaigns } = useCampaigns()
  
  // Extract unique offer IDs for filtering, filtering out null values
  const uniqueOfferIds = Array.from(
    new Set(
      campaigns
        .filter(campaign => campaign.offer_id !== null)
        .map(campaign => campaign.offer_id!.toString())
    )
  ).map(id => ({
    label: `Offer #${id}`,
    value: id,
    icon: Tag
  }))

  return (
    <div className='flex items-center justify-between'>
      <div className='flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2'>
        <Input
          placeholder='Filter campaigns...'
          value={
            (table.getColumn('name')?.getFilterValue() as string) ?? ''
          }
          onChange={(event) =>
            table.getColumn('name')?.setFilterValue(event.target.value)
          }
          className='h-8 w-[150px] lg:w-[250px]'
        />
        <div className='flex gap-x-2'>
          {table.getColumn('status') && (
            <DataTableFacetedFilter
              column={table.getColumn('status')}
              title='Status'
              options={[
                { label: 'Draft', value: 'draft', icon: Clock },
                { label: 'Approved', value: 'approved', icon: Check },
                { label: 'Active', value: 'active', icon: Check },
                { label: 'Paused', value: 'paused', icon: Pause },
                { label: 'Completed', value: 'completed', icon: FileText },
              ]}
            />
          )}
          
          {table.getColumn('offer_id') && uniqueOfferIds.length > 0 && (
            <DataTableFacetedFilter
              column={table.getColumn('offer_id')}
              title='Offer'
              options={uniqueOfferIds}
            />
          )}
        </div>
        {isFiltered && (
          <Button
            variant='ghost'
            onClick={() => table.resetColumnFilters()}
            className='h-8 px-2 lg:px-3'
          >
            Reset
            <Cross2Icon className='ml-2 h-4 w-4' />
          </Button>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <DataTableExport table={table} data={data} />
        <DataTableViewOptions table={table} />
      </div>
    </div>
  )
} 
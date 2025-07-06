import { Cross2Icon } from '@radix-ui/react-icons'
import { Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTableFacetedFilter } from './data-table-faceted-filter'
import { DataTableViewOptions } from './data-table-view-options'
import { DataTableExport } from './data-table-export'
import { Check, Clock, X, FileText, RefreshCw } from 'lucide-react'
import { Offer } from '../data/schema'
import { useOffers } from '../context/offers-context'

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  data: Offer[]
}

export function DataTableToolbar<TData>({
  table,
  data,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0
  const { refreshOffers } = useOffers();

  return (
    <div className='flex flex-col space-y-3 md:flex-row md:items-center md:justify-between md:space-y-0'>
      <div className='flex flex-1 flex-col space-y-2 md:flex-row md:items-center md:space-x-2 md:space-y-0'>
        <div className='flex w-full items-center space-x-2 md:w-auto'>
          <Input
            placeholder='Filter offers...'
            value={
              (table.getColumn('offer_description')?.getFilterValue() as string) ?? ''
            }
            onChange={(event) =>
              table.getColumn('offer_description')?.setFilterValue(event.target.value)
            }
            className='h-8 w-full md:w-[250px]'
          />
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 px-2 flex-shrink-0" 
            onClick={() => refreshOffers()}
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="sr-only md:not-sr-only md:ml-2">Refresh</span>
          </Button>
        </div>
        <div className='flex flex-wrap gap-2'>
          {table.getColumn('status') && (
            <DataTableFacetedFilter
              column={table.getColumn('status')}
              title='Status'
              options={[
                { label: 'Draft', value: 'draft', icon: Clock },
                { label: 'Pending Review', value: 'pending_review', icon: Clock },
                { label: 'Approved', value: 'approved', icon: Check },
                { label: 'Rejected', value: 'rejected', icon: X },
                { label: 'Retired', value: 'retired', icon: FileText },
              ]}
            />
          )}
          {table.getColumn('offer_type') && (
            <DataTableFacetedFilter
              column={table.getColumn('offer_type')}
              title='Type'
              options={[
                { label: 'Bundle Offer', value: 'bundle_offer' },
                { label: 'Premium Discount', value: 'premium_discount' },
                { label: 'Processing Fee Waiver', value: 'processing_fee_waiver' },
                { label: 'Interest Rate Reduction', value: 'interest_rate_reduction' },
                { label: 'Quick Approval', value: 'quick_approval' },
                { label: 'Home Insurance Bundle', value: 'home_insurance_bundle' },
              ]}
            />
          )}
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
      </div>
      <div className="flex items-center space-x-2">
        <DataTableExport table={table} data={data} />
        <DataTableViewOptions table={table} />
      </div>
    </div>
  )
} 
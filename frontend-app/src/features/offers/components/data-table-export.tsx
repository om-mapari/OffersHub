import { Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { FileDown } from 'lucide-react'
import { Offer } from '../data/schema'
import { exportFilteredOffersToExcel, exportOffersToExcel, exportSelectedOffersToExcel } from '../utils/export-utils'

interface DataTableExportProps<TData> {
  table: Table<TData>
  data: Offer[]
}

export function DataTableExport<TData>({
  table,
  data,
}: DataTableExportProps<TData>) {
  // Get filtered rows
  const filteredRows = table.getFilteredRowModel().rows
  const filteredData = filteredRows.map(row => row.original) as Offer[]
  
  // Get selected rows
  const selectedRows = table.getState().rowSelection
  
  // Check if any rows are selected
  const hasSelectedRows = Object.keys(selectedRows).length > 0
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8">
          <FileDown className="mr-2 h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem 
          onClick={() => exportOffersToExcel(data, 'all-offers')}
        >
          Export All
        </DropdownMenuItem>
        
        {filteredRows.length !== data.length && (
          <DropdownMenuItem 
            onClick={() => exportFilteredOffersToExcel(filteredData)}
          >
            Export Filtered
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={() => exportSelectedOffersToExcel(data, selectedRows)}
          disabled={!hasSelectedRows}
          className={!hasSelectedRows ? "text-muted-foreground cursor-not-allowed" : ""}
        >
          Export Selected
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 
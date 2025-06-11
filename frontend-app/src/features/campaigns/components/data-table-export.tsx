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
import { Campaign } from '../data/schema'
import { exportCampaignsToExcel, exportFilteredCampaignsToExcel, exportSelectedCampaignsToExcel } from '../utils/export-utils'

interface DataTableExportProps<TData> {
  table: Table<TData>
  data: Campaign[]
}

export function DataTableExport<TData>({
  table,
  data,
}: DataTableExportProps<TData>) {
  // Get filtered rows
  const filteredRows = table.getFilteredRowModel().rows
  const filteredData = filteredRows.map(row => row.original) as Campaign[]
  
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
          onClick={() => exportCampaignsToExcel(data, 'all-campaigns')}
        >
          Export All
        </DropdownMenuItem>
        
        {filteredRows.length !== data.length && (
          <DropdownMenuItem 
            onClick={() => exportFilteredCampaignsToExcel(filteredData)}
          >
            Export Filtered
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={() => exportSelectedCampaignsToExcel(data, selectedRows)}
          disabled={!hasSelectedRows}
          className={!hasSelectedRows ? "text-muted-foreground cursor-not-allowed" : ""}
        >
          Export Selected
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 
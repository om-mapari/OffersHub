import { useState } from 'react'
import {
  ColumnDef,
  ColumnFiltersState,
  RowData,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Campaign } from '../data/schema'
import { useTenant } from '@/context/TenantContext'
import { useCampaigns } from '../context/campaigns-context'
import { Plus } from 'lucide-react'
import { DataTableToolbar } from './data-table-toolbar'

// Define permissions interface
export interface CampaignsPermissions {
  canManage: boolean;
  canRead: boolean;
}

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    className: string
  }
}

interface CampaignsTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  permissions?: CampaignsPermissions
}

export function CampaignsTable<TData, TValue>({
  columns,
  data,
  permissions = {
    canManage: false,
    canRead: false
  }
}: CampaignsTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const { currentTenant } = useTenant()
  const { setIsCreateDialogOpen } = useCampaigns()

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  if (!currentTenant) {
    return (
      <div className="flex h-[300px] items-center justify-center rounded-md border border-dashed">
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="text-lg font-medium">No Tenant Selected</div>
          <div className="text-sm text-muted-foreground">
            Please select a tenant to view campaigns
          </div>
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center rounded-md border border-dashed">
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="text-lg font-medium">No Campaigns Found</div>
          <div className="text-sm text-muted-foreground">
            No campaigns exist for this tenant yet.
          </div>
          {permissions.canManage && (
            <div className="mt-4">
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create New Campaign
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      <DataTableToolbar table={table} data={data as Campaign[]} />
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className='group/row'>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={header.column.columnDef.meta?.className ?? ''}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className='group/row'
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cell.column.columnDef.meta?.className ?? ''}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 
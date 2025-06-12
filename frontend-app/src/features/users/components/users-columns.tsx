import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { UsersRowActions } from './users-row-actions'
import { User } from '../data/schema'

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'username',
    header: 'Username',
    cell: ({ row }) => <div className="font-medium">{row.getValue('username')}</div>,
  },
  {
    accessorKey: 'full_name',
    header: 'Full Name',
    cell: ({ row }) => <div>{row.getValue('full_name') || '-'}</div>,
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => <div>{row.getValue('email') || '-'}</div>,
  },
  {
    accessorKey: 'is_active',
    header: 'Status',
    cell: ({ row }) => {
      const isActive = row.getValue('is_active')
      
      return (
        <Badge variant={isActive ? "default" : "secondary"}>
          {isActive ? "Active" : "Inactive"}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'is_super_admin',
    header: 'Super Admin',
    cell: ({ row }) => {
      const isSuperAdmin = row.getValue('is_super_admin')
      
      return (
        <Badge variant={isSuperAdmin ? "default" : "outline"}>
          {isSuperAdmin ? "Yes" : "No"}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'created_at',
    header: 'Created At',
    cell: ({ row }) => {
      const date = row.original.created_at
      return <div>{format(date, 'MMM d, yyyy')}</div>
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <UsersRowActions user={row.original} />,
  },
]

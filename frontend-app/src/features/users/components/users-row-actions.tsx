import { DotsHorizontalIcon } from "@radix-ui/react-icons"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User } from "../data/schema"
import { useUsersContext } from "../context/users-context"
import { Edit, Key, Trash, UserCog, Eye } from "lucide-react"

interface UsersRowActionsProps {
  user: User
}

export function UsersRowActions({ user }: UsersRowActionsProps) {
  const { 
    setSelectedUser, 
    setIsEditDialogOpen, 
    setIsDeleteDialogOpen, 
    setIsChangePasswordDialogOpen,
    setIsAssignRoleDialogOpen,
    setIsViewRolesDialogOpen,
    fetchUserTenantRoles
  } = useUsersContext()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
        >
          <DotsHorizontalIcon className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem
          onClick={() => {
            setSelectedUser(user)
            setIsEditDialogOpen(true)
          }}
        >
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            setSelectedUser(user)
            setIsChangePasswordDialogOpen(true)
          }}
        >
          <Key className="mr-2 h-4 w-4" />
          Change Password
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            setSelectedUser(user)
            fetchUserTenantRoles(user.username)
            setIsViewRolesDialogOpen(true)
          }}
        >
          <Eye className="mr-2 h-4 w-4" />
          View Roles
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            setSelectedUser(user)
            setIsAssignRoleDialogOpen(true)
          }}
        >
          <UserCog className="mr-2 h-4 w-4" />
          Assign Role
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() => {
            setSelectedUser(user)
            setIsDeleteDialogOpen(true)
          }}
        >
          <Trash className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 
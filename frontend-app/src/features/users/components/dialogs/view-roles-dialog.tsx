import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useUsersContext } from '../../context/users-context'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trash } from 'lucide-react'
import { useState } from 'react'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'

export function ViewRolesDialog() {
  const { 
    isViewRolesDialogOpen, 
    setIsViewRolesDialogOpen, 
    selectedUser, 
    userTenantRoles, 
    removeRoleFromUser,
    isLoading 
  } = useUsersContext()
  
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [roleToDelete, setRoleToDelete] = useState<{ username: string, tenant_name: string, role: string } | null>(null)

  const handleDeleteClick = (username: string, tenant_name: string, role: string) => {
    setRoleToDelete({ username, tenant_name, role })
    setIsConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (roleToDelete) {
      await removeRoleFromUser(roleToDelete)
      setIsConfirmOpen(false)
      setRoleToDelete(null)
    }
  }

  return (
    <>
      <Dialog open={isViewRolesDialogOpen} onOpenChange={setIsViewRolesDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>User Roles: {selectedUser?.username}</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            {userTenantRoles.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No roles assigned to this user
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tenant</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userTenantRoles.map((role, index) => (
                      <TableRow key={`${role.tenant_name}-${role.role}-${index}`}>
                        <TableCell>{role.tenant_name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {role.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(role.username, role.tenant_name, role.role)}
                            disabled={isLoading}
                          >
                            <Trash className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove the role <strong>{roleToDelete?.role}</strong> from tenant <strong>{roleToDelete?.tenant_name}</strong> for this user?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} disabled={isLoading}>
              {isLoading ? 'Removing...' : 'Remove Role'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
} 
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useUsersContext } from '../../context/users-context'
import { AlertTriangle } from 'lucide-react'

export function DeleteUserDialog() {
  // Try to use the context, but don't throw if it's not available
  let contextValue;
  try {
    contextValue = useUsersContext();
  } catch (error) {
    console.warn("DeleteUserDialog: UsersContext not available");
    return null;
  }
  
  const { isDeleteDialogOpen, setIsDeleteDialogOpen, selectedUser, deleteUser, isLoading } = contextValue;

  const handleDelete = async () => {
    if (selectedUser) {
      await deleteUser(selectedUser.username)
    }
  }

  return (
    <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete User
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the user <span className="font-semibold">{selectedUser?.username}</span>?
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsDeleteDialogOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? 'Deleting...' : 'Delete User'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 
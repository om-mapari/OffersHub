import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useUsersContext } from '../../context/users-context'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { updateUserSchema } from '../../data/schema'
import { useEffect } from 'react'
import { Switch } from '@/components/ui/switch'

export function EditUserDialog() {
  // Try to use the context, but don't throw if it's not available
  let contextValue;
  try {
    contextValue = useUsersContext();
  } catch (error) {
    console.warn("EditUserDialog: UsersContext not available");
    return null;
  }
  
  const { isEditDialogOpen, setIsEditDialogOpen, selectedUser, updateUser, isLoading } = contextValue;

  const form = useForm<z.infer<typeof updateUserSchema>>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      full_name: selectedUser?.full_name || '',
      email: selectedUser?.email || '',
      is_active: selectedUser?.is_active || true,
    },
  })

  // Update form values when selected user changes
  useEffect(() => {
    if (selectedUser) {
      form.reset({
        full_name: selectedUser.full_name || '',
        email: selectedUser.email || '',
        is_active: selectedUser.is_active !== undefined ? selectedUser.is_active : true,
      })
    }
  }, [selectedUser, form])

  const onSubmit = async (data: z.infer<typeof updateUserSchema>) => {
    if (selectedUser) {
      await updateUser(selectedUser.username, data)
    }
  }

  return (
    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit User: {selectedUser?.username}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                placeholder="Enter full name"
                {...form.register('full_name')}
              />
              {form.formState.errors.full_name && (
                <p className="text-sm text-red-500">{form.formState.errors.full_name.message}</p>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email"
                {...form.register('email')}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={form.watch('is_active')}
                onCheckedChange={(checked) => form.setValue('is_active', checked)}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 
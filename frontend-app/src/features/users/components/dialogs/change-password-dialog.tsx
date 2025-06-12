import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useUsersContext } from '../../context/users-context'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// Define a local schema for the password change form
const passwordChangeSchema = z.object({
  password: z.string().min(8),
})

export function ChangePasswordDialog() {
  // Try to use the context, but don't throw if it's not available
  let contextValue;
  try {
    contextValue = useUsersContext();
  } catch (error) {
    console.warn("ChangePasswordDialog: UsersContext not available");
    return null;
  }
  
  const { isChangePasswordDialogOpen, setIsChangePasswordDialogOpen, selectedUser, changeUserPassword, isLoading } = contextValue;
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<z.infer<typeof passwordChangeSchema>>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      password: '',
    },
  })

  const onSubmit = async (data: z.infer<typeof passwordChangeSchema>) => {
    if (selectedUser) {
      await changeUserPassword(selectedUser.username, data.password)
      form.reset()
    }
  }

  return (
    <Dialog open={isChangePasswordDialogOpen} onOpenChange={setIsChangePasswordDialogOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Change Password: {selectedUser?.username}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  {...form.register('password')}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </Button>
              </div>
              {form.formState.errors.password && (
                <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsChangePasswordDialogOpen(false)
                form.reset()
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Changing...' : 'Change Password'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useUsersContext } from '../../context/users-context'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createUserSchema } from '../../data/schema'

export function CreateUserDialog() {
  // Try to use the context, but don't throw if it's not available
  let contextValue;
  try {
    contextValue = useUsersContext();
  } catch (error) {
    console.warn("CreateUserDialog: UsersContext not available");
    return null;
  }
  
  const { isCreateDialogOpen, setIsCreateDialogOpen, createUser, isLoading } = contextValue;
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<z.infer<typeof createUserSchema>>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      username: '',
      password: '',
      full_name: '',
      email: '',
    },
  })

  const onSubmit = async (data: z.infer<typeof createUserSchema>) => {
    await createUser(data)
    form.reset()
  }

  return (
    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="Enter username"
                {...form.register('username')}
              />
              {form.formState.errors.username && (
                <p className="text-sm text-red-500">{form.formState.errors.username.message}</p>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
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
            
            <div className="grid gap-2">
              <Label htmlFor="full_name">Full Name (Optional)</Label>
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
              <Label htmlFor="email">Email (Optional)</Label>
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
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false)
                form.reset()
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create User'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 
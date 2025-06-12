import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useUsersContext } from '../../context/users-context'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createUserTenantRoleSchema } from '../../data/schema'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useEffect, useState } from 'react'
import { getAllTenants } from '@/features/tenants/data/api'
import { useAuth } from '@/context/AuthContext'
import { Tenant } from '@/features/tenants/data/schema'

// Available roles
const AVAILABLE_ROLES = [
  'admin',
  'create',
  'approver',
  'read_only'
]

export function AssignRoleDialog() {
  const { isAssignRoleDialogOpen, setIsAssignRoleDialogOpen, selectedUser, assignRoleToUser, isLoading } = useUsersContext()
  const { token } = useAuth()
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [isLoadingTenants, setIsLoadingTenants] = useState(false)

  const form = useForm<z.infer<typeof createUserTenantRoleSchema>>({
    resolver: zodResolver(createUserTenantRoleSchema),
    defaultValues: {
      username: selectedUser?.username || '',
      tenant_name: '',
      role: '',
    },
  })

  // Update username when selected user changes
  useEffect(() => {
    if (selectedUser) {
      form.setValue('username', selectedUser.username)
    }
  }, [selectedUser, form])

  // Fetch tenants when dialog opens
  useEffect(() => {
    if (isAssignRoleDialogOpen && token) {
      setIsLoadingTenants(true)
      getAllTenants(token)
        .then(data => {
          setTenants(data)
          setIsLoadingTenants(false)
        })
        .catch(error => {
          console.error('Error fetching tenants:', error)
          setIsLoadingTenants(false)
        })
    }
  }, [isAssignRoleDialogOpen, token])

  const onSubmit = async (data: z.infer<typeof createUserTenantRoleSchema>) => {
    await assignRoleToUser(data)
    form.reset({
      username: selectedUser?.username || '',
      tenant_name: '',
      role: '',
    })
  }

  return (
    <Dialog open={isAssignRoleDialogOpen} onOpenChange={setIsAssignRoleDialogOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Role: {selectedUser?.username}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="tenant_name">Tenant</Label>
              <Select
                onValueChange={(value) => form.setValue('tenant_name', value)}
                defaultValue={form.getValues('tenant_name')}
                disabled={isLoadingTenants}
              >
                <SelectTrigger id="tenant_name">
                  <SelectValue placeholder="Select a tenant" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingTenants ? (
                    <SelectItem value="loading" disabled>Loading tenants...</SelectItem>
                  ) : tenants.length > 0 ? (
                    tenants.map((tenant) => (
                      <SelectItem key={tenant.name} value={tenant.name}>
                        {tenant.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>No tenants available</SelectItem>
                  )}
                </SelectContent>
              </Select>
              {form.formState.errors.tenant_name && (
                <p className="text-sm text-red-500">{form.formState.errors.tenant_name.message}</p>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Select
                onValueChange={(value) => form.setValue('role', value)}
                defaultValue={form.getValues('role')}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.role && (
                <p className="text-sm text-red-500">{form.formState.errors.role.message}</p>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAssignRoleDialogOpen(false)
                form.reset()
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || isLoadingTenants}>
              {isLoading ? 'Assigning...' : 'Assign Role'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 
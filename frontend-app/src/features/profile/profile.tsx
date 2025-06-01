import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChangePasswordForm } from '@/features/auth/change-password/components/change-password-form'
import { useAuth } from '@/context/AuthContext'
import { useTenant } from '@/context/TenantContext'
import { useEffect, useState } from 'react'
import { Tenant } from '@/context/TenantContext'

export function Profile() {
  const { user } = useAuth()
  const { userTenants, fetchTenantDetails } = useTenant()
  const [tenantMap, setTenantMap] = useState<Record<string, Tenant>>({})
  const [loading, setLoading] = useState(false)

  // Fetch tenant details for all user groups
  useEffect(() => {
    if (!user || !fetchTenantDetails) return

    const loadTenantDetails = async () => {
      setLoading(true)
      const tenantDetailsMap: Record<string, Tenant> = {}
      
      for (const group of user.groups) {
        const tenantDetails = await fetchTenantDetails(group.tenantId)
        if (tenantDetails) {
          tenantDetailsMap[group.tenantId] = tenantDetails
        }
      }
      
      setTenantMap(tenantDetailsMap)
      setLoading(false)
    }
    
    loadTenantDetails()
  }, [user, fetchTenantDetails])

  if (!user) {
    return <div>Loading...</div>
  }

  // Get tenant name from ID
  const getTenantName = (tenantId: string): string => {
    if (tenantMap[tenantId]) {
      return tenantMap[tenantId].name
    }
    
    // Fallback to ID if name not found
    return tenantId
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">User Profile</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>User Information</CardTitle>
              <CardDescription>Your account details</CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Username</dt>
                  <dd className="text-base">{user.username}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Full Name</dt>
                  <dd className="text-base">{user.fullName}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Role</dt>
                  <dd className="text-base">{user.isSuperAdmin ? 'Super Admin' : 'User'}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <Tabs defaultValue="tenants">
            <TabsList className="mb-4">
              <TabsTrigger value="tenants">My Tenants</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>
            
            <TabsContent value="tenants">
              <Card>
                <CardHeader>
                  <CardTitle>My Tenants</CardTitle>
                  <CardDescription>Tenants you have access to and your roles</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                    </div>
                  ) : user.groups.length > 0 ? (
                    <div className="space-y-4">
                      {user.groups.map((group) => (
                        <div key={group.tenantId} className="border rounded-md p-4">
                          <h3 className="font-medium">{getTenantName(group.tenantId)}</h3>
                          <p className="text-xs text-muted-foreground mb-2">ID: {group.tenantId}</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {group.roles.map((role) => (
                              <span 
                                key={role} 
                                className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full"
                              >
                                {role}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">You don't have access to any tenants.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>Update your account password</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChangePasswordForm />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
} 
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { NotificationButton } from '@/components/notification-button'
import { columns } from './components/users-columns'
import { UsersDialogs } from './components/users-dialogs'
import { UsersPrimaryButtons } from './components/users-primary-buttons'
import { UsersTable } from './components/users-table'
import { UsersProvider, useUsersContext } from './context/users-context'
import { useAuth } from '@/context/AuthContext'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, Loader2 } from 'lucide-react'

function UsersContent() {
  const { users, isLoading, error } = useUsersContext()
  const { user } = useAuth()
  
  // Check if user is super admin
  if (!user?.isSuperAdmin) {
    return (
      <Alert variant="destructive" className="mt-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          You must be a Super Admin to access user management.
        </AlertDescription>
      </Alert>
    )
  }
  
  return (
    <>
      <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>User Management</h2>
          <p className='text-muted-foreground'>
            Create and manage users for your platform.
          </p>
        </div>
        <UsersPrimaryButtons />
      </div>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {isLoading && users.length === 0 ? (
        <div className="flex h-[400px] w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <UsersTable data={users} columns={columns} />
        </div>
      )}
      
      <UsersDialogs />
    </>
  )
}

export default function Users() {
  return (
    <UsersProvider>
      <Header fixed>
        <Search />
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <NotificationButton />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <UsersContent />
      </Main>
    </UsersProvider>
  )
}

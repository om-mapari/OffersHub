import { Button } from '@/components/ui/button'
import { Plus, RefreshCw } from 'lucide-react'
import { useUsersContext } from '../context/users-context'
import { useState, useContext } from 'react'

export function UsersPrimaryButtons() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // Try to use the context, but don't throw if it's not available
  let contextValue;
  try {
    contextValue = useUsersContext();
  } catch (error) {
    console.warn("UsersPrimaryButtons: UsersContext not available");
    return null;
  }
  
  const { setIsCreateDialogOpen, refreshUsers } = contextValue;

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refreshUsers()
    setIsRefreshing(false)
  }

  return (
    <div className="flex space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleRefresh}
        disabled={isRefreshing}
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
        {isRefreshing ? 'Refreshing...' : 'Refresh'}
      </Button>
      <Button onClick={() => setIsCreateDialogOpen(true)}>
        <Plus className="mr-2 h-4 w-4" /> Create User
      </Button>
    </div>
  )
}

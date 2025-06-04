import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { NotificationButton } from '@/components/notification-button'
import { columns } from './components/offers-columns'
import { OffersDialogs } from './components/offers-dialogs'
import { OffersPrimaryButtons } from './components/offers-primary-buttons'
import { OffersTable } from './components/offers-table'
import OffersProvider from './context/offers-context'
import { offerListSchema, Offer } from './data/schema'
import { useTenant } from '@/context/TenantContext'
import { useAuth } from '@/context/AuthContext'
import { useEffect, useState, useCallback } from 'react'
import { Loader2 } from 'lucide-react'
import ChatBot from '../ai-chat'

// Define permissions for different offer operations
const PERMISSIONS = {
  CREATE: ["admin", "create"],
  READ: ["admin", "create", "approver", "read_only"],
  UPDATE_DRAFT: ["admin", "create"],
  UPDATE_ADMIN: ["admin"],
  DELETE: ["admin"],
  SUBMIT: ["admin", "create"],
  APPROVE_REJECT: ["admin", "approver"],
  COMMENT: ["admin", "create", "approver"]
};

export default function Offers() {
  const { currentTenant } = useTenant();
  const { user, hasPermission, token } = useAuth();
  const [offers, setOffers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedOffers, setParsedOffers] = useState<Offer[]>([]);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  
  // Check if user has permission for a specific action
  const hasActionPermission = (action: keyof typeof PERMISSIONS) => {
    if (!currentTenant) return false;
    return PERMISSIONS[action].some(role => userRoles.includes(role));
  };
  
  // Fetch user roles for the current tenant
  useEffect(() => {
    if (!currentTenant || !token) return;
    
    // Get user roles for the current tenant
    fetch('http://localhost:8000/api/v1/users/me/tenants', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => response.json())
    .then(data => {
      // Find the current tenant's roles
      const tenantInfo = data.find((t: any) => t.tenant_name === currentTenant.name);
      if (tenantInfo) {
        setUserRoles(tenantInfo.roles || []);
      } else {
        setUserRoles([]);
      }
    })
    .catch(err => {
      console.error('Error fetching user roles:', err);
      setUserRoles([]);
    });
  }, [currentTenant, token]);
  
  // Function to fetch offers data
  const fetchOffers = useCallback(async () => {
    if (!currentTenant || !token) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/tenants/${currentTenant.name}/offers/?skip=0&limit=100`, 
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched offers:', data);
        setOffers(data);
        
        // Parse offer list
        try {
          if (data.length > 0) {
            const parsed = offerListSchema.parse(data);
            setParsedOffers(parsed);
          } else {
            setParsedOffers([]);
          }
        } catch (parseError) {
          console.error('Error parsing offers:', parseError);
          setError('Error processing offer data.');
        }
      } else {
        console.error('Failed to fetch offers:', await response.text());
        setError('Failed to fetch offers. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching offers:', error);
      setError('An error occurred while fetching offers.');
    } finally {
      setIsLoading(false);
    }
  }, [currentTenant, token]);
  
  // Fetch offers when tenant changes
  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  // Check if user can create offers
  const canCreate = hasActionPermission('CREATE');
  
  // Check if user can approve/reject offers
  const canApproveReject = hasActionPermission('APPROVE_REJECT');
  
  // Check if user can submit offers
  const canSubmit = hasActionPermission('SUBMIT');

  // Get the highest priority role for display
  const getPrimaryUserRole = () => {
    if (!currentTenant) return 'None';
    if (user?.isSuperAdmin) return 'Super Admin';
    
    // Priority order: Admin > Create > Approver > Read Only
    if (userRoles.includes('admin')) return 'Admin';
    if (userRoles.includes('create')) return 'Create';
    if (userRoles.includes('approver')) return 'Approver';
    if (userRoles.includes('read_only')) return 'Read Only';
    
    return 'None';
  };
  
  const primaryRole = getPrimaryUserRole();

  return (
    <OffersProvider>
      <Header fixed>
        <Search />
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <NotificationButton />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Offers</h2>
            <p className='text-muted-foreground'>
              {currentTenant 
                ? `Manage offers for ${currentTenant.name}`
                : "Select a tenant to manage offers"}
            </p>
            <div className="mt-2 flex items-center">
              <span className="text-sm font-medium mr-2">Your role:</span>
              <span className={`text-xs px-2 py-1 rounded-full ${
                primaryRole === 'Super Admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' :
                primaryRole === 'Admin' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                primaryRole === 'Create' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                primaryRole === 'Approver' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300' :
                'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
              }`}>
                {primaryRole}
              </span>
            </div>
          </div>
          {canCreate && <OffersPrimaryButtons />}
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          {isLoading ? (
            <div className="flex h-[300px] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading offers...</span>
            </div>
          ) : error ? (
            <div className="flex h-[300px] items-center justify-center">
              <p className="text-red-500">{error}</p>
            </div>
          ) : (
            <OffersTable 
              data={parsedOffers} 
              columns={columns} 
              permissions={{
                canApproveReject,
                canSubmit,
                canCreate
              }}
            />
          )}
        </div>
      </Main>

      <OffersDialogs 
        permissions={{
          canApproveReject,
          canSubmit,
          canCreate,
          canDelete: hasActionPermission('DELETE'),
          canComment: hasActionPermission('COMMENT'),
          canUpdateDraft: hasActionPermission('UPDATE_DRAFT'),
          canUpdateAdmin: hasActionPermission('UPDATE_ADMIN')
        }}
        onActionComplete={fetchOffers}
      />
      <ChatBot />
    </OffersProvider>
  )
} 
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { saTenantsApi, Tenant as ApiTenant } from "@/services/api";

// Define Tenant interface
export interface Tenant {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  createdBy?: string;
}

interface TenantContextType {
  currentTenant: Tenant | null;
  userTenants: Tenant[];
  setCurrentTenant: (tenant: Tenant) => void;
  setUserTenants: (tenants: Tenant[]) => void;
  fetchTenantDetails: (tenantName: string) => Promise<Tenant | null>;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: ReactNode }) {
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [userTenants, setUserTenants] = useState<Tenant[]>([]);
  const { user, hasPermission } = useAuth();

  // Initialize tenant data from user context
  useEffect(() => {
    const initializeTenants = async () => {
      if (!user) return;

      try {
        // Map user groups to tenant IDs
        const tenantIds = user.groups.map(group => group.tenantId);
        
        // If user has tenants, fetch details for each tenant
        if (tenantIds.length > 0) {
          const tenants: Tenant[] = [];
          
          for (const tenantId of tenantIds) {
            const tenantDetails = await fetchTenantDetails(tenantId);
            if (tenantDetails) {
              tenants.push(tenantDetails);
            }
          }
          
          setUserTenants(tenants);
          
          // Set current tenant from localStorage or use the first one
          const savedTenantId = localStorage.getItem('currentTenantId');
          if (savedTenantId) {
            const savedTenant = tenants.find(t => t.id === savedTenantId);
            if (savedTenant) {
              setCurrentTenant(savedTenant);
            } else if (tenants.length > 0) {
              setCurrentTenant(tenants[0]);
              localStorage.setItem('currentTenantId', tenants[0].id);
            }
          } else if (tenants.length > 0) {
            setCurrentTenant(tenants[0]);
            localStorage.setItem('currentTenantId', tenants[0].id);
          }
        }
      } catch (error) {
        console.error("Failed to initialize tenants:", error);
      }
    };

    initializeTenants();
  }, [user]);

  // Function to fetch tenant details by name
  const fetchTenantDetails = async (tenantName: string): Promise<Tenant | null> => {
    try {
      // Only super admins can fetch tenant details directly
      // For regular users, we'll use the tenant name from their groups
      if (user?.isSuperAdmin) {
        const apiTenant = await saTenantsApi.getTenantByName(tenantName);
        return mapApiTenantToTenant(apiTenant);
      } else {
        // For non-super admins, create a basic tenant object from the name
        return {
          id: tenantName,
          name: tenantName,
          createdAt: new Date().toISOString(),
        };
      }
    } catch (error) {
      console.error(`Failed to fetch tenant details for ${tenantName}:`, error);
      return null;
    }
  };

  // Helper function to map API tenant to our Tenant interface
  const mapApiTenantToTenant = (apiTenant: ApiTenant): Tenant => {
    return {
      id: apiTenant.name,
      name: apiTenant.name,
      createdAt: apiTenant.created_at,
    };
  };

  // Update localStorage when current tenant changes
  useEffect(() => {
    if (currentTenant) {
      localStorage.setItem('currentTenantId', currentTenant.id);
    }
  }, [currentTenant]);

  return (
    <TenantContext.Provider
      value={{
        currentTenant,
        userTenants,
        setCurrentTenant,
        setUserTenants,
        fetchTenantDetails,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error("useTenant must be used within a TenantProvider");
  }
  return context;
} 
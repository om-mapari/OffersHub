import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { buildUserApiUrl } from "@/config/api";
import { getUserTenants } from "@/features/auth/api";

// Define Tenant interface based on API response
export interface Tenant {
  name: string;
  roles: string[];
}

interface TenantContextType {
  currentTenant: Tenant | null;
  userTenants: Tenant[];
  setCurrentTenant: (tenant: Tenant) => void;
  setUserTenants: (tenants: Tenant[]) => void;
  isLoading: boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: ReactNode }) {
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [userTenants, setUserTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { token, user } = useAuth();

  // Fetch user tenants from API using cached auth API
  useEffect(() => {
    async function fetchUserTenants() {
      if (!token) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // This will use the cached data if available (implemented in api.ts)
        const data = await getUserTenants(token);
        console.log('Fetched tenant data:', data);
        
        // Transform API response to match our Tenant interface
        const tenants: Tenant[] = data.map((item: any) => ({
          name: item.tenant_name,
          roles: item.roles || []
        }));
        
        setUserTenants(tenants);
        
        // Set default tenant if available
        if (tenants.length > 0 && !currentTenant) {
          setCurrentTenant(tenants[0]);
        }
      } catch (error) {
        console.error('Error fetching tenants:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserTenants();
  }, [token, user]);

  return (
    <TenantContext.Provider
      value={{
        currentTenant,
        userTenants,
        setCurrentTenant,
        setUserTenants,
        isLoading
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
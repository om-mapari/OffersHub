import { createContext, useContext, useState, ReactNode, useEffect } from "react";

// Define Tenant interface
export interface Tenant {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  createdBy: string;
}

interface TenantContextType {
  currentTenant: Tenant | null;
  userTenants: Tenant[];
  setCurrentTenant: (tenant: Tenant) => void;
  setUserTenants: (tenants: Tenant[]) => void;
}

// Mock tenants for testing
const MOCK_TENANTS: Tenant[] = [
  {
    id: "tenant-1",
    name: "Credit Card",
    description: "Credit Card Financial Products",
    createdAt: "2023-01-01",
    createdBy: "admin",
  },
  {
    id: "tenant-2",
    name: "Personal Loans",
    description: "Personal Loan Financial Products",
    createdAt: "2023-01-02",
    createdBy: "admin",
  },
  {
    id: "tenant-3",
    name: "Mortgages",
    description: "Mortgage Financial Products",
    createdAt: "2023-01-03",
    createdBy: "admin",
  },
];

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: ReactNode }) {
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [userTenants, setUserTenants] = useState<Tenant[]>([]);

  // Initialize with mock data for testing
  useEffect(() => {
    // In a real app, this would come from an API call based on the logged-in user
    setUserTenants(MOCK_TENANTS);
    
    // Optionally set a default current tenant
    if (MOCK_TENANTS.length > 0) {
      setCurrentTenant(MOCK_TENANTS[0]);
    }
  }, []);

  return (
    <TenantContext.Provider
      value={{
        currentTenant,
        userTenants,
        setCurrentTenant,
        setUserTenants,
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
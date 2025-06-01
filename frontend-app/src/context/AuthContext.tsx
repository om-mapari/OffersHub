import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Tenant } from "./TenantContext";

// Define user roles
export type UserRole = "super_admin" | "admin" | "read_only" | "create" | "approver";

// Define user groups for tenants
export interface UserGroup {
  tenantId: string;
  roles: UserRole[];
}

// Define user interface
export interface User {
  id: string;
  username: string;
  fullName: string;
  isSuperAdmin: boolean;
  groups: UserGroup[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  hasPermission: (role: UserRole, tenantId?: string) => boolean;
  logout: () => void;
  setUser: (user: User) => void;
}

// Mock user for testing
const MOCK_USER: User = {
  id: "user-1",
  username: "admin",
  fullName: "Admin User",
  isSuperAdmin: false,
  groups: [
    {
      tenantId: "tenant-1",
      roles: ["admin", "create", "approver"],
    },
    {
      tenantId: "tenant-2",
      roles: ["read_only"],
    },
    {
      tenantId: "tenant-3",
      roles: ["create", "approver"],
    },
  ],
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize with mock data for testing
  useEffect(() => {
    // In a real app, this would be an API call to get the user data
    // For now, we'll just use our mock data
    setUser(MOCK_USER);
    setLoading(false);
  }, []);

  const hasPermission = (role: UserRole, tenantId?: string) => {
    if (!user) return false;
    
    // Super admins have all permissions
    if (user.isSuperAdmin) return true;
    
    // If tenantId is provided, check for that specific tenant
    if (tenantId) {
      const tenantGroup = user.groups.find(group => group.tenantId === tenantId);
      return tenantGroup ? tenantGroup.roles.includes(role) : false;
    }
    
    // If no tenantId, check if user has the role in any tenant
    return user.groups.some(group => group.roles.includes(role));
  };

  const logout = () => {
    setUser(null);
    // Add any additional logout logic here (e.g. clearing cookies, etc.)
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        hasPermission,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
} 
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Tenant } from "./TenantContext";
import { authApi, usersApi, User as ApiUser, UserTenantInfo } from "@/services/api";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";

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
  login: (username: string, password: string) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
}

// Context creation
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { setAccessToken, resetAccessToken } = useAuthStore().auth;

  // Initialize user data from API
  useEffect(() => {
    const initializeUser = async () => {
      try {
        // Check if we have a token
        const token = useAuthStore.getState().auth.accessToken;
        if (!token) {
          setLoading(false);
          return;
        }

        // Fetch current user data
        await fetchUserData();
      } catch (error) {
        console.error("Failed to initialize user:", error);
        resetAccessToken();
        setLoading(false);
      }
    };

    initializeUser();
  }, []);

  // Fetch user data from API
  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Get user data
      const apiUser = await usersApi.getMe();
      
      // Get user tenants and roles
      const userTenantInfos = await usersApi.getMyTenantsAndRoles();
      
      // Check if user is super admin (this might need to be determined by role or another API call)
      const isSuperAdmin = checkIfSuperAdmin(userTenantInfos);
      
      // Map API user data to our User interface
      const userData: User = {
        id: apiUser.username, // Using username as ID since API doesn't return an explicit ID
        username: apiUser.username,
        fullName: apiUser.username, // API doesn't provide full name, using username
        isSuperAdmin,
        groups: mapUserTenantInfosToGroups(userTenantInfos),
      };
      
      setUser(userData);
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Helper function to check if user is super admin based on roles
  const checkIfSuperAdmin = (userTenantInfos: UserTenantInfo[]): boolean => {
    // Check if any tenant has a super_admin role
    return userTenantInfos.some(info => info.roles.includes('super_admin'));
  };

  // Helper function to map API UserTenantInfo to our UserGroup structure
  const mapUserTenantInfosToGroups = (userTenantInfos: UserTenantInfo[]): UserGroup[] => {
    return userTenantInfos.map(info => ({
      tenantId: info.tenant_name,
      roles: info.roles as UserRole[],
    }));
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Call login API
      const tokenData = await authApi.login(username, password);
      
      // Store the token
      setAccessToken(tokenData.access_token);
      
      // Fetch user data
      await fetchUserData();
      
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      toast.error("Login failed. Please check your credentials.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    resetAccessToken();
    setUser(null);
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
      await authApi.changePassword(currentPassword, newPassword);
      toast.success("Password changed successfully");
      return true;
    } catch (error) {
      console.error("Failed to change password:", error);
      toast.error("Failed to change password");
      return false;
    }
  };

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

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        hasPermission,
        logout,
        setUser,
        login,
        changePassword,
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
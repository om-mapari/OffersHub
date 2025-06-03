import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useAuthStore, AuthUser as StoreUser, UserPasswordChange, LoginCredentials, UserRole as StoreUserRole } from '@/stores/authStore';

// Define user roles
export type UserRole = StoreUserRole;

// Define user interface
// Use AuthUser from authStore, which should align with API's User model
export type User = StoreUser;

interface AuthContextType {
  user: StoreUser | null;
  token: string | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: (redirectUrl?: string) => void;
  changePassword: (data: UserPasswordChange) => Promise<{ msg: string }>;
  hasPermission: (role: UserRole, tenantName?: string) => boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const {
    user,
    accessToken,
    isLoading,
    login: storeLogin,
    logout: storeLogout,
    changePassword: storeChangePassword,
    initializeAuth,
  } = useAuthStore(state => state.auth);

  // Initialize with mock data for testing
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const login = async (credentials: LoginCredentials) => {
    await storeLogin(credentials);
    // Navigation will be handled by the component that calls login
  };

  const logout = (redirectUrl?: string) => {
    storeLogout();
    // Let the component handle navigation after logout
    if (redirectUrl) {
      window.location.href = redirectUrl;
    }
  };
  
  const changePassword = async (data: UserPasswordChange) => {
    return storeChangePassword(data);
  };

  const hasPermission = (role: UserRole, tenantName?: string) => {
    if (!user) return false;

    // Super admin has all permissions
    if (user.isSuperAdmin) return true;

    // If tenantName is provided, check permissions for that tenant
    if (tenantName) {
      const group = user.groups?.find(g => g.tenantId === tenantName);
      return !!group && group.roles.includes(role);
    }

    // Otherwise, check if user has the role in any tenant
    return user.groups?.some(group => group.roles.includes(role)) || false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token: accessToken,
        loading: isLoading,
        login,
        logout,
        changePassword,
        hasPermission,
        isAuthenticated: !!accessToken && !!user,
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
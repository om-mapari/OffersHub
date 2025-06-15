import { createContext, useContext, ReactNode, useEffect, useRef } from "react";
import { useAuthStore, AuthUser as StoreUser, UserPasswordChange, LoginCredentials, UserRole as StoreUserRole } from '@/stores/authStore';
import { clearAuthCache } from '@/features/auth/api';

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

// Global flag to track auth initialization across all instances
// Using module-level variable ensures singleton initialization
let authInitialized = false;
// Promise to track ongoing initialization
let authInitPromise: Promise<void> | null = null;

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

  // Debug user object
  useEffect(() => {
    console.log('AuthContext - Current user:', user);
    if (user) {
      console.log('AuthContext - isSuperAdmin:', user.isSuperAdmin);
    }
  }, [user]);

  // Local ref to track if this instance initiated auth
  const didInitRef = useRef(false);

  // Initialize auth only once across all provider instances
  useEffect(() => {
    const initAuth = async () => {
      if (authInitialized) {
        console.log('Auth already initialized globally, skipping');
        return;
      }
      
      if (authInitPromise) {
        console.log('Auth initialization already in progress, waiting...');
        return authInitPromise;
      }
      
      console.log('Starting global auth initialization');
      // Clear auth cache on initialization to force fresh data
      clearAuthCache();
      
      authInitialized = true;
      didInitRef.current = true;
      
      // Create a promise for the initialization so other instances can wait for it
      authInitPromise = initializeAuth().finally(() => {
        authInitPromise = null;
      });
      
      return authInitPromise;
    };
    
    initAuth();
    
    // Cleanup function
    return () => {
      // Only reset the global flag if this instance was the one that initialized
      if (didInitRef.current) {
        console.log('Auth provider that initialized is unmounting');
      }
    };
  }, [initializeAuth]);

  const login = async (credentials: LoginCredentials) => {
    await storeLogin(credentials);
    // Navigation will be handled by the component that calls login
  };

  const logout = (redirectUrl?: string) => {
    storeLogout();
    // Reset initialization flag to ensure re-initialization on next login
    authInitialized = false;
    authInitPromise = null;
    didInitRef.current = false;
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
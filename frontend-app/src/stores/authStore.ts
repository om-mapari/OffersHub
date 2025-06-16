import Cookies from 'js-cookie'
import { create } from 'zustand'
import * as authApi from '@/features/auth/api'
import { API_BASE_URL } from '@/config/api'
import type { User as ApiUser, Token, UserPasswordChange as ApiUserPasswordChange, Msg, LoginCredentials as ApiLoginCredentials, UserTenantInfo } from '@/features/auth/api'

const ACCESS_TOKEN_COOKIE_KEY = 'app_access_token' // Use a more specific key

// Define UserRole and AuthUser based on your application's needs and API response
export type UserRole = "super_admin" | "admin" | "read_only" | "create" | "approver" | string; // Allow string for flexibility

export interface UserGroup {
  tenantId: string;
  roles: UserRole[];
}

export interface AuthUser extends Omit<ApiUser, 'is_active' | 'is_superuser' | 'is_super_admin' | 'full_name'> {
  isActive: boolean;
  isSuperAdmin: boolean;
  fullName: string | null;
  email: string;
  groups: UserGroup[]; // Assuming groups might be part of user data or derived
  avatar?: string;
}

export type LoginCredentials = ApiLoginCredentials;
export type UserPasswordChange = ApiUserPasswordChange;

interface AuthSlice {
  user: AuthUser | null;
  accessToken: string | null;
  isLoading: boolean; // For auth operations like login, fetchUser
  isInitialized: boolean; // To track if initial auth check is done
  error: any | null;
  setUser: (user: AuthUser | null) => void;
  setAccessToken: (accessToken: string | null) => void;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  fetchCurrentUser: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  changePassword: (data: UserPasswordChange) => Promise<Msg>;
  reset: () => void;
}

interface AppState {
  auth: AuthSlice;
}

export const useAuthStore = create<AppState>()((set, get) => ({
  auth: {
    user: null,
    accessToken: Cookies.get(ACCESS_TOKEN_COOKIE_KEY) || null,
    isLoading: false, // Default to false, true during operations
    isInitialized: false,
    error: null,
    setUser: (user) => set(state => ({ auth: { ...state.auth, user, error: null } })),
    setAccessToken: (accessToken) => {
      if (accessToken) {
        Cookies.set(ACCESS_TOKEN_COOKIE_KEY, accessToken, { expires: 7, secure: import.meta.env.PROD, sameSite: 'Lax' });
      } else {
        Cookies.remove(ACCESS_TOKEN_COOKIE_KEY);
      }
      set(state => ({ auth: { ...state.auth, accessToken, error: null } }));
    },
    login: async (credentials) => {
      set(state => ({ auth: { ...state.auth, isLoading: true, error: null } }));
      try {
        console.log('Attempting login with credentials:', { ...credentials, password: '***' });
        const tokenData: Token = await authApi.loginForAccessToken(credentials);
        console.log('Login successful, token received:', { access_token: tokenData.access_token ? '***' : null });
        get().auth.setAccessToken(tokenData.access_token);
        await get().auth.fetchCurrentUser();
      } catch (error) {
        console.error("Login failed:", error);
        get().auth.reset(); // Clear any partial state on login failure
        set(state => ({ auth: { ...state.auth, error, isLoading: false } }));
        throw error;
      }
      // isLoading will be set to false by fetchCurrentUser or in finally block if fetchCurrentUser is not awaited fully here.
    },
    fetchCurrentUser: async () => {
      const token = get().auth.accessToken;
      if (!token) {
        set(state => ({ auth: { ...state.auth, user: null, isLoading: false } }));
        return;
      }
      set(state => ({ auth: { ...state.auth, isLoading: true, error: null } }));
      try {
        console.log('Fetching current user with token:', token ? '***' : null);
        const apiUser: ApiUser = await authApi.getCurrentUser(token);
        console.log('User data received:', apiUser);
        
        // Get user tenant roles
        let userGroups: UserGroup[] = [];
        try {
          const tenantInfo: UserTenantInfo[] = await authApi.getUserTenants(token);
          console.log('User tenant roles received:', tenantInfo);
          userGroups = tenantInfo.map(info => ({
            tenantId: info.tenant_name,
            roles: info.roles,
          }));
        } catch (error) {
          console.error("Failed to fetch user tenant roles:", error);
        }

        const authUser: AuthUser = {
          ...apiUser,
          isActive: apiUser.is_active ?? true,
          isSuperAdmin: apiUser.is_super_admin ?? false,
          fullName: apiUser.full_name ?? apiUser.username,
          email: apiUser.email ?? '',
          groups: userGroups,
        };
        console.log('Processed auth user:', { ...authUser, id: authUser.id ? '***' : null });
        get().auth.setUser(authUser);
      } catch (error) {
        console.error("Failed to fetch current user:", error);
        get().auth.reset(); // Token might be invalid, so reset auth state
        set(state => ({ auth: { ...state.auth, error } }));
      } finally {
        set(state => ({ auth: { ...state.auth, isLoading: false } }));
      }
    },
    initializeAuth: async () => {
      if (get().auth.isInitialized) {
        console.log('Auth store already initialized, skipping');
        return;
      }
      console.log('Initializing auth store');
      set(state => ({ auth: { ...state.auth, isLoading: true } }));
      const token = Cookies.get(ACCESS_TOKEN_COOKIE_KEY);
      console.log('Initializing auth, token exists:', !!token);
      if (token) {
        get().auth.setAccessToken(token); // Ensure token is in state
        try {
          await get().auth.fetchCurrentUser();
        } catch (error) {
          console.error("Failed to initialize auth:", error);
          get().auth.reset();
        }
      }
      set(state => ({ auth: { ...state.auth, isLoading: false, isInitialized: true } }));
    },
    logout: () => {
      // Optionally: Call a backend /logout endpoint
      // await authApi.logoutUser(get().auth.accessToken);
      authApi.clearAuthCache(); // Clear API cache on logout
      get().auth.reset();
    },
    changePassword: async (data: UserPasswordChange) => {
      const token = get().auth.accessToken;
      if (!token) throw new Error("Not authenticated");
      set(state => ({ auth: { ...state.auth, isLoading: true, error: null } }));
      try {
        const response: Msg = await authApi.changeUserPassword(data, token);
        return response;
      } catch (error) {
        console.error("Change password failed:", error);
        set(state => ({ auth: { ...state.auth, error } }));
        throw error;
      } finally {
        set(state => ({ auth: { ...state.auth, isLoading: false } }));
      }
    },
    reset: () => {
      authApi.clearAuthCache(); // Clear API cache on reset
      set(state => {
        Cookies.remove(ACCESS_TOKEN_COOKIE_KEY);
        return {
          auth: {
            ...state.auth,
            user: null,
            accessToken: null,
            isLoading: false,
            error: null,
          },
        };
      });
    },
  },
}))

// export const useAuth = () => useAuthStore((state) => state.auth)

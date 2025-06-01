import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { useAuthStore } from '@/stores/authStore';

// API base URL
const API_URL = 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().auth.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle specific error cases here
    return Promise.reject(error);
  }
);

// Generic request function
const request = async <T>(config: AxiosRequestConfig): Promise<T> => {
  try {
    const response: AxiosResponse<T> = await api(config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// API interfaces based on the documentation
export interface Token {
  access_token: string;
  token_type: string;
}

export interface User {
  username: string;
  created_at: string;
}

export interface Tenant {
  name: string;
  created_at: string;
}

export interface UserTenantInfo {
  tenant_name: string;
  roles: string[];
}

export interface Offer {
  data: any;
  id: string;
  tenant_name: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Campaign {
  name: string;
  start_date: string;
  end_date: string;
  id: string;
  tenant_name: string;
  status: string;
  created_at: string;
}

// Auth API
export const authApi = {
  login: (username: string, password: string) => {
    // Create URLSearchParams for form data
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    
    return request<Token>({
      url: '/api/v1/auth/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: formData,
    });
  },
  
  getCurrentUser: () => 
    request<User>({
      url: '/api/v1/auth/me',
      method: 'GET',
    }),
  
  changePassword: (current_password: string, new_password: string) => 
    request<{ msg: string }>({
      url: '/api/v1/auth/change-password',
      method: 'POST',
      data: { current_password, new_password },
    }),
};

// Users API
export const usersApi = {
  getMe: () => 
    request<User>({
      url: '/api/v1/users/me',
      method: 'GET',
    }),
  
  getMyTenantsAndRoles: () => 
    request<UserTenantInfo[]>({
      url: '/api/v1/users/me/tenants',
      method: 'GET',
    }),
};

// Super Admin Tenants API
export const saTenantsApi = {
  createTenant: (name: string) => 
    request<Tenant>({
      url: '/api/v1/sa/tenants/',
      method: 'POST',
      data: { name },
    }),
  
  getTenants: (skip = 0, limit = 100) => 
    request<Tenant[]>({
      url: '/api/v1/sa/tenants/',
      method: 'GET',
      params: { skip, limit },
    }),
  
  getTenantByName: (tenantName: string) => 
    request<Tenant>({
      url: `/api/v1/sa/tenants/${tenantName}`,
      method: 'GET',
    }),
  
  updateTenant: (tenantName: string, data: any) => 
    request<Tenant>({
      url: `/api/v1/sa/tenants/${tenantName}`,
      method: 'PUT',
      data,
    }),
  
  deleteTenant: (tenantName: string) => 
    request<{ msg: string }>({
      url: `/api/v1/sa/tenants/${tenantName}`,
      method: 'DELETE',
    }),
};

// Super Admin User Tenant Roles API
export const saUserTenantRolesApi = {
  assignRoleToUser: (username: string, tenant_name: string, role: string) => 
    request<any>({
      url: '/api/v1/sa/user-tenant-roles/',
      method: 'POST',
      data: { username, tenant_name, role },
    }),
  
  listUserTenantRoles: (username?: string, tenant_name?: string) => 
    request<any[]>({
      url: '/api/v1/sa/user-tenant-roles/',
      method: 'GET',
      params: { username, tenant_name },
    }),
  
  removeRoleFromUser: (username: string, tenant_name: string, role: string) => 
    request<{ msg: string }>({
      url: '/api/v1/sa/user-tenant-roles/',
      method: 'DELETE',
      data: { username, tenant_name, role },
    }),
};

// Super Admin Users API
export const saUsersApi = {
  createUser: (username: string, password: string) => 
    request<User>({
      url: '/api/v1/sa/users/',
      method: 'POST',
      data: { username, password },
    }),
  
  getUsers: (skip = 0, limit = 100) => 
    request<User[]>({
      url: '/api/v1/sa/users/',
      method: 'GET',
      params: { skip, limit },
    }),
  
  getUserByUsername: (username: string) => 
    request<User>({
      url: `/api/v1/sa/users/${username}`,
      method: 'GET',
    }),
  
  updateUser: (username: string, data: any) => 
    request<User>({
      url: `/api/v1/sa/users/${username}`,
      method: 'PUT',
      data,
    }),
  
  deleteUser: (username: string) => 
    request<{ msg: string }>({
      url: `/api/v1/sa/users/${username}`,
      method: 'DELETE',
    }),
  
  changeUserPassword: (username: string, password: string) => 
    request<{ msg: string }>({
      url: `/api/v1/sa/users/${username}/change-password`,
      method: 'POST',
      data: { password },
    }),
};

// Tenant Campaigns API
export const tenantCampaignsApi = {
  createCampaign: (tenant_name: string, data: { name: string, start_date: string, end_date: string }) => 
    request<Campaign>({
      url: `/api/v1/tenants/${tenant_name}/campaigns/`,
      method: 'POST',
      data,
    }),
  
  listCampaigns: (tenant_name: string, skip = 0, limit = 100) => 
    request<Campaign[]>({
      url: `/api/v1/tenants/${tenant_name}/campaigns/`,
      method: 'GET',
      params: { skip, limit },
    }),
};

// Tenant Offers API
export const tenantOffersApi = {
  createOffer: (tenant_name: string, data: { data: any }) => 
    request<Offer>({
      url: `/api/v1/tenants/${tenant_name}/offers/`,
      method: 'POST',
      data,
    }),
  
  listOffers: (tenant_name: string, skip = 0, limit = 100, status_filter?: string, created_by_filter?: string) => 
    request<Offer[]>({
      url: `/api/v1/tenants/${tenant_name}/offers/`,
      method: 'GET',
      params: { skip, limit, status_filter, created_by_filter },
    }),
  
  getOffer: (tenant_name: string, offer_id: string) => 
    request<Offer>({
      url: `/api/v1/tenants/${tenant_name}/offers/${offer_id}`,
      method: 'GET',
    }),
  
  updateOffer: (tenant_name: string, offer_id: string, data: any) => 
    request<Offer>({
      url: `/api/v1/tenants/${tenant_name}/offers/${offer_id}`,
      method: 'PATCH',
      data,
    }),
  
  submitOffer: (tenant_name: string, offer_id: string) => 
    request<Offer>({
      url: `/api/v1/tenants/${tenant_name}/offers/${offer_id}/submit`,
      method: 'POST',
    }),
  
  approveOffer: (tenant_name: string, offer_id: string) => 
    request<Offer>({
      url: `/api/v1/tenants/${tenant_name}/offers/${offer_id}/approve`,
      method: 'POST',
    }),
  
  rejectOffer: (tenant_name: string, offer_id: string) => 
    request<Offer>({
      url: `/api/v1/tenants/${tenant_name}/offers/${offer_id}/reject`,
      method: 'POST',
    }),
};

// Customers API
export const customersApi = {
  createCustomer: (full_name: string, email: string) => 
    request<any>({
      url: '/api/v1/customers/',
      method: 'POST',
      data: { full_name, email },
    }),
  
  listCustomers: (skip = 0, limit = 100) => 
    request<any[]>({
      url: '/api/v1/customers/',
      method: 'GET',
      params: { skip, limit },
    }),
  
  getCustomer: (customer_id: string) => 
    request<any>({
      url: `/api/v1/customers/${customer_id}`,
      method: 'GET',
    }),
};

export default api; 
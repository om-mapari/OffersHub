import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { Tenant, CreateTenantInput } from "../data/schema";
import * as tenantsApi from "../data/api";
import { useAuth } from "@/context/AuthContext";

interface TenantsContextType {
  tenants: Tenant[];
  selectedTenant: Tenant | null;
  setSelectedTenant: React.Dispatch<React.SetStateAction<Tenant | null>>;
  isCreateDialogOpen: boolean;
  setIsCreateDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  createTenant: (data: CreateTenantInput) => Promise<void>;
  deleteTenant: (name: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  refreshTenants: () => Promise<void>;
}

const TenantsContext = createContext<TenantsContextType | undefined>(undefined);

export function TenantsProvider({ children }: { children: ReactNode }) {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get auth context for token
  const { token, user } = useAuth();

  // Load tenants on initial render if user is super admin
  const fetchTenants = useCallback(async () => {
    if (!token || !user?.isSuperAdmin) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await tenantsApi.getAllTenants(token);
      setTenants(data);
    } catch (error) {
      console.error("Failed to load tenants:", error);
      setError("Failed to load tenants. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [token, user]);

  // Refresh tenants data
  const refreshTenants = useCallback(async () => {
    await fetchTenants();
  }, [fetchTenants]);

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  // Create a new tenant
  const createTenant = async (data: CreateTenantInput) => {
    if (!token) {
      setError("You must be logged in to create a tenant");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const newTenant = await tenantsApi.createTenant(data, token);
      setTenants((prev) => [...prev, newTenant]);
      setIsCreateDialogOpen(false);
    } catch (error: any) {
      console.error("Failed to create tenant:", error);
      setError(error.detail || "Failed to create tenant. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a tenant
  const deleteTenant = async (name: string) => {
    if (!token) {
      setError("You must be logged in to delete a tenant");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      await tenantsApi.deleteTenant(name, token);
      setTenants((prev) => prev.filter((tenant) => tenant.name !== name));
      setIsDeleteDialogOpen(false);
      setSelectedTenant(null);
    } catch (error: any) {
      console.error("Failed to delete tenant:", error);
      setError(error.detail || "Failed to delete tenant. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TenantsContext.Provider
      value={{
        tenants,
        selectedTenant,
        setSelectedTenant,
        isCreateDialogOpen,
        setIsCreateDialogOpen,
        isDeleteDialogOpen,
        setIsDeleteDialogOpen,
        createTenant,
        deleteTenant,
        isLoading,
        error,
        refreshTenants,
      }}
    >
      {children}
    </TenantsContext.Provider>
  );
}

export function useTenantsContext() {
  const context = useContext(TenantsContext);
  if (context === undefined) {
    throw new Error("useTenantsContext must be used within a TenantsProvider");
  }
  return context;
}

export default TenantsProvider; 
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Tenant, CreateTenantInput, UpdateTenantInput } from "../data/schema";
import * as tenantsApi from "../data/api";

interface TenantsContextType {
  tenants: Tenant[];
  setTenants: React.Dispatch<React.SetStateAction<Tenant[]>>;
  selectedTenant: Tenant | null;
  setSelectedTenant: React.Dispatch<React.SetStateAction<Tenant | null>>;
  isCreateDialogOpen: boolean;
  setIsCreateDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isEditDialogOpen: boolean;
  setIsEditDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  createTenant: (data: CreateTenantInput) => void;
  updateTenant: (id: string, data: UpdateTenantInput) => void;
  deleteTenant: (id: string) => void;
  isLoading: boolean;
}

const TenantsContext = createContext<TenantsContextType | undefined>(undefined);

export function TenantsProvider({ children }: { children: ReactNode }) {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load tenants on initial render
  useEffect(() => {
    const loadTenants = async () => {
      setIsLoading(true);
      try {
        const data = await tenantsApi.getAllTenants();
        setTenants(data);
      } catch (error) {
        console.error("Failed to load tenants:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTenants();
  }, []);

  // Create a new tenant
  const createTenant = async (data: CreateTenantInput) => {
    setIsLoading(true);
    
    try {
      const newTenant = await tenantsApi.createTenant(data);
      setTenants((prev) => [...prev, newTenant]);
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error("Failed to create tenant:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update an existing tenant
  const updateTenant = async (id: string, data: UpdateTenantInput) => {
    setIsLoading(true);
    
    try {
      const updatedTenant = await tenantsApi.updateTenant(id, data);
      setTenants((prev) =>
        prev.map((tenant) =>
          tenant.id === id
            ? { ...tenant, ...updatedTenant }
            : tenant
        )
      );
      setIsEditDialogOpen(false);
      setSelectedTenant(null);
    } catch (error) {
      console.error("Failed to update tenant:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a tenant
  const deleteTenant = async (id: string) => {
    setIsLoading(true);
    
    try {
      await tenantsApi.deleteTenant(id);
      setTenants((prev) => prev.filter((tenant) => tenant.id !== id));
      setIsDeleteDialogOpen(false);
      setSelectedTenant(null);
    } catch (error) {
      console.error("Failed to delete tenant:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TenantsContext.Provider
      value={{
        tenants,
        setTenants,
        selectedTenant,
        setSelectedTenant,
        isCreateDialogOpen,
        setIsCreateDialogOpen,
        isEditDialogOpen,
        setIsEditDialogOpen,
        isDeleteDialogOpen,
        setIsDeleteDialogOpen,
        createTenant,
        updateTenant,
        deleteTenant,
        isLoading,
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
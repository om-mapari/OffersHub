import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { User, CreateUserInput, UpdateUserInput, UserTenantRole, CreateUserTenantRoleInput, DeleteUserTenantRoleInput } from "../data/schema";
import * as usersApi from "../data/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface UsersContextType {
  users: User[];
  selectedUser: User | null;
  setSelectedUser: React.Dispatch<React.SetStateAction<User | null>>;
  userTenantRoles: UserTenantRole[];
  isCreateDialogOpen: boolean;
  setIsCreateDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isEditDialogOpen: boolean;
  setIsEditDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isChangePasswordDialogOpen: boolean;
  setIsChangePasswordDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isAssignRoleDialogOpen: boolean;
  setIsAssignRoleDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isViewRolesDialogOpen: boolean;
  setIsViewRolesDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  createUser: (data: CreateUserInput) => Promise<void>;
  updateUser: (username: string, data: UpdateUserInput) => Promise<void>;
  deleteUser: (username: string) => Promise<void>;
  changeUserPassword: (username: string, newPassword: string) => Promise<void>;
  assignRoleToUser: (data: CreateUserTenantRoleInput) => Promise<void>;
  removeRoleFromUser: (data: DeleteUserTenantRoleInput) => Promise<void>;
  fetchUserTenantRoles: (username?: string, tenantName?: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  refreshUsers: () => Promise<void>;
}

const UsersContext = createContext<UsersContextType | undefined>(undefined);

export function UsersProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userTenantRoles, setUserTenantRoles] = useState<UserTenantRole[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] = useState(false);
  const [isAssignRoleDialogOpen, setIsAssignRoleDialogOpen] = useState(false);
  const [isViewRolesDialogOpen, setIsViewRolesDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get auth context for token
  const { token, user } = useAuth();

  // Load users on initial render if user is super admin
  const fetchUsers = useCallback(async () => {
    if (!token || !user?.isSuperAdmin) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await usersApi.getAllUsers();
      setUsers(data);
    } catch (error: any) {
      console.error("Failed to load users:", error);
      setError("Failed to load users. Please try again.");
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  }, [token, user]);

  // Refresh users data
  const refreshUsers = useCallback(async () => {
    await fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Fetch user tenant roles
  const fetchUserTenantRoles = async (username?: string, tenantName?: string) => {
    if (!token) {
      setError("You must be logged in to view roles");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const roles = await usersApi.getUserTenantRoles(username, tenantName);
      setUserTenantRoles(roles);
    } catch (error: any) {
      console.error("Failed to load user tenant roles:", error);
      setError("Failed to load roles. Please try again.");
      toast.error("Failed to load user roles");
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new user
  const createUser = async (data: CreateUserInput) => {
    if (!token) {
      setError("You must be logged in to create a user");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const newUser = await usersApi.createUser(data);
      setUsers((prev) => [...prev, newUser]);
      setIsCreateDialogOpen(false);
      toast.success("User created successfully");
    } catch (error: any) {
      console.error("Failed to create user:", error);
      setError(error.detail || "Failed to create user. Please try again.");
      toast.error("Failed to create user");
    } finally {
      setIsLoading(false);
    }
  };

  // Update a user
  const updateUser = async (username: string, data: UpdateUserInput) => {
    if (!token) {
      setError("You must be logged in to update a user");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedUser = await usersApi.updateUser(username, data);
      setUsers((prev) => prev.map((user) => user.username === username ? updatedUser : user));
      setIsEditDialogOpen(false);
      toast.success("User updated successfully");
    } catch (error: any) {
      console.error("Failed to update user:", error);
      setError(error.detail || "Failed to update user. Please try again.");
      toast.error("Failed to update user");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a user
  const deleteUser = async (username: string) => {
    if (!token) {
      setError("You must be logged in to delete a user");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      await usersApi.deleteUser(username);
      setUsers((prev) => prev.filter((user) => user.username !== username));
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
      toast.success("User deleted successfully");
    } catch (error: any) {
      console.error("Failed to delete user:", error);
      setError(error.detail || "Failed to delete user. Please try again.");
      toast.error("Failed to delete user");
    } finally {
      setIsLoading(false);
    }
  };

  // Change user password
  const changeUserPassword = async (username: string, newPassword: string) => {
    if (!token) {
      setError("You must be logged in to change a password");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      await usersApi.changeUserPassword(username, newPassword, token);
      setIsChangePasswordDialogOpen(false);
      toast.success("Password changed successfully");
    } catch (error: any) {
      console.error("Failed to change password:", error);
      if (error.detail) {
        setError(error.detail);
        toast.error(error.detail);
      } else {
        setError("Failed to change password. Please try again.");
        toast.error("Failed to change password");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Assign role to user in tenant
  const assignRoleToUser = async (data: CreateUserTenantRoleInput) => {
    if (!token) {
      setError("You must be logged in to assign a role");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const newRole = await usersApi.assignRoleToUser(data);
      setUserTenantRoles((prev) => [...prev, newRole]);
      setIsAssignRoleDialogOpen(false);
      toast.success("Role assigned successfully");
    } catch (error: any) {
      console.error("Failed to assign role:", error);
      setError(error.detail || "Failed to assign role. Please try again.");
      toast.error("Failed to assign role");
    } finally {
      setIsLoading(false);
    }
  };

  // Remove role from user in tenant
  const removeRoleFromUser = async (data: DeleteUserTenantRoleInput) => {
    if (!token) {
      setError("You must be logged in to remove a role");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      await usersApi.removeRoleFromUser(data);
      setUserTenantRoles((prev) => 
        prev.filter((role) => 
          !(role.username === data.username && 
            role.tenant_name === data.tenant_name && 
            role.role === data.role)
        )
      );
      toast.success("Role removed successfully");
    } catch (error: any) {
      console.error("Failed to remove role:", error);
      setError(error.detail || "Failed to remove role. Please try again.");
      toast.error("Failed to remove role");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <UsersContext.Provider
      value={{
        users,
        selectedUser,
        setSelectedUser,
        userTenantRoles,
        isCreateDialogOpen,
        setIsCreateDialogOpen,
        isDeleteDialogOpen,
        setIsDeleteDialogOpen,
        isEditDialogOpen,
        setIsEditDialogOpen,
        isChangePasswordDialogOpen,
        setIsChangePasswordDialogOpen,
        isAssignRoleDialogOpen,
        setIsAssignRoleDialogOpen,
        isViewRolesDialogOpen,
        setIsViewRolesDialogOpen,
        createUser,
        updateUser,
        deleteUser,
        changeUserPassword,
        assignRoleToUser,
        removeRoleFromUser,
        fetchUserTenantRoles,
        isLoading,
        error,
        refreshUsers,
      }}
    >
      {children}
    </UsersContext.Provider>
  );
}

export function useUsersContext() {
  const context = useContext(UsersContext);
  if (context === undefined) {
    throw new Error("useUsersContext must be used within a UsersProvider");
  }
  return context;
}

export default UsersProvider;

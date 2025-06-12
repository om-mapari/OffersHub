// Import all dialog components
import { CreateUserDialog } from "@/features/users/components/dialogs/create-user-dialog";
import { DeleteUserDialog } from "@/features/users/components/dialogs/delete-user-dialog";
import { EditUserDialog } from "@/features/users/components/dialogs/edit-user-dialog";
import { ChangePasswordDialog } from "@/features/users/components/dialogs/change-password-dialog";
import { AssignRoleDialog } from "@/features/users/components/dialogs/assign-role-dialog";
import { ViewRolesDialog } from "@/features/users/components/dialogs/view-roles-dialog";

export function UsersDialogs() {
  return (
    <>
      <CreateUserDialog />
      <DeleteUserDialog />
      <EditUserDialog />
      <ChangePasswordDialog />
      <AssignRoleDialog />
      <ViewRolesDialog />
    </>
  );
} 
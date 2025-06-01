import { TenantsCreateDialog } from "./tenants-create-dialog";
import { TenantsEditDialog } from "./tenants-edit-dialog";
import { TenantsDeleteDialog } from "./tenants-delete-dialog";

export function TenantsDialogs() {
  return (
    <>
      <TenantsCreateDialog />
      <TenantsEditDialog />
      <TenantsDeleteDialog />
    </>
  );
} 
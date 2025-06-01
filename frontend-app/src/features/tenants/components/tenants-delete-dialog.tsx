import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTenantsContext } from "../context/tenants-context";

export function TenantsDeleteDialog() {
  const { 
    isDeleteDialogOpen, 
    setIsDeleteDialogOpen, 
    selectedTenant, 
    deleteTenant,
    isLoading
  } = useTenantsContext();

  function handleDelete() {
    if (!selectedTenant) return;
    deleteTenant(selectedTenant.id);
  }

  return (
    <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Tenant</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this tenant? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        {selectedTenant && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-medium">Tenant Name</h3>
              <p className="text-sm text-muted-foreground">{selectedTenant.name}</p>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-medium">Description</h3>
              <p className="text-sm text-muted-foreground">
                {selectedTenant.description || "No description provided"}
              </p>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                variant="destructive" 
                onClick={handleDelete}
                disabled={isLoading}
              >
                {isLoading ? "Deleting..." : "Delete Tenant"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 
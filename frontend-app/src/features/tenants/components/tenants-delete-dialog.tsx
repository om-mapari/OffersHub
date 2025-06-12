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
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function TenantsDeleteDialog() {
  // Try to use the context, but don't throw if it's not available
  let contextValue;
  try {
    contextValue = useTenantsContext();
  } catch (error) {
    console.warn("TenantsDeleteDialog: TenantsContext not available");
    return null;
  }
  
  const { 
    isDeleteDialogOpen, 
    setIsDeleteDialogOpen, 
    selectedTenant, 
    deleteTenant,
    isLoading,
    error
  } = contextValue;

  function handleDelete() {
    if (!selectedTenant) return;
    deleteTenant(selectedTenant.name);
  }

  return (
    <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Tenant</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this tenant? This action cannot be undone.
            All associated offers, campaigns, and user roles will be deleted.
          </DialogDescription>
        </DialogHeader>
        {selectedTenant && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-medium">Tenant Name</h3>
              <p className="text-sm text-muted-foreground">{selectedTenant.name}</p>
            </div>
            
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
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
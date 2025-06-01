import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useTenantsContext } from "../context/tenants-context";
import { UpdateTenantInput, updateTenantSchema } from "../data/schema";

export function TenantsEditDialog() {
  const { 
    isEditDialogOpen, 
    setIsEditDialogOpen, 
    selectedTenant, 
    updateTenant,
    isLoading
  } = useTenantsContext();

  const form = useForm<UpdateTenantInput>({
    resolver: zodResolver(updateTenantSchema),
    defaultValues: {
      description: selectedTenant?.description || "",
    },
  });

  // Update form values when selected tenant changes
  useEffect(() => {
    if (selectedTenant) {
      form.reset({
        description: selectedTenant.description || "",
      });
    }
  }, [selectedTenant, form]);

  function onSubmit(data: UpdateTenantInput) {
    if (!selectedTenant) return;
    updateTenant(selectedTenant.id, data);
  }

  return (
    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Tenant</DialogTitle>
          <DialogDescription>
            Update the tenant details. Note that the tenant name cannot be changed.
          </DialogDescription>
        </DialogHeader>
        {selectedTenant && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-medium">Tenant Name</h3>
                <p className="text-sm text-muted-foreground">{selectedTenant.name}</p>
              </div>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Description of the tenant"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
} 
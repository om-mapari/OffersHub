import { Row } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tenant } from "../data/schema";
import { useTenantsContext } from "../context/tenants-context";

interface DataTableRowActionsProps {
  row: Row<Tenant>;
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const tenant = row.original;
  const { setSelectedTenant, setIsEditDialogOpen, setIsDeleteDialogOpen } = useTenantsContext();

  const handleEdit = () => {
    setSelectedTenant(tenant);
    setIsEditDialogOpen(true);
  };

  const handleDelete = () => {
    setSelectedTenant(tenant);
    setIsDeleteDialogOpen(true);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleEdit}>
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={handleDelete}
          className="text-destructive focus:text-destructive"
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

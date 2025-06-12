import { ColumnDef } from "@tanstack/react-table";
import { Tenant } from "../data/schema";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";
import { format } from "date-fns";

export const columns: ColumnDef<Tenant>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tenant Name" />
    ),
    cell: ({ row }) => {
      return (
        <div className="font-medium">
          {row.getValue("name")}
        </div>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created At" />
    ),
    cell: ({ row }) => {
      // created_at is already transformed to Date in the schema
      const date = row.original.created_at;
      return (
        <div>
          {format(date, "MMM d, yyyy")}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]; 
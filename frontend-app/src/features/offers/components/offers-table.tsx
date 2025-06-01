import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { tenantOffersApi, Offer } from "@/services/api";
import { useTenant } from "@/context/TenantContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/utils/format-date";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/context/AuthContext";
import { PlusCircle } from "lucide-react";

export function OffersTable() {
  const { currentTenant } = useTenant();
  const { hasPermission } = useAuth();
  const [page, setPage] = useState(1);
  const limit = 10;

  // Reset pagination when tenant changes
  useEffect(() => {
    setPage(1);
  }, [currentTenant?.id]);

  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["offers", currentTenant?.id, page],
    queryFn: () => {
      if (!currentTenant) return Promise.resolve([]);
      return tenantOffersApi.listOffers(
        currentTenant.id,
        (page - 1) * limit,
        limit
      );
    },
    enabled: !!currentTenant,
  });

  if (!currentTenant) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Offers</CardTitle>
          <CardDescription>
            Please select a tenant to view offers.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Offers</CardTitle>
          <CardDescription>
            Error loading offers. Please try again.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-200 text-gray-800";
      case "submitted":
        return "bg-blue-100 text-blue-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Offers</CardTitle>
          <CardDescription>
            Manage offers for {currentTenant.name}
          </CardDescription>
        </div>
        {hasPermission("create", currentTenant.id) && (
          <Button asChild>
            <Link to={`/tenants/${currentTenant.id}/offers/new`}>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Offer
            </Link>
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-full" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Updated At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data && data.length > 0 ? (
                    data.map((offer: Offer) => (
                      <TableRow key={offer.id}>
                        <TableCell className="font-medium">
                          <Link
                            to={`/tenants/${currentTenant.id}/offers/${offer.id}`}
                            className="text-blue-600 hover:underline"
                          >
                            {offer.id.substring(0, 8)}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={getStatusBadgeColor(offer.status)}
                            variant="outline"
                          >
                            {offer.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {formatDate(new Date(offer.created_at))}
                        </TableCell>
                        <TableCell>
                          {formatDate(new Date(offer.updated_at))}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                          >
                            <Link
                              to={`/tenants/${currentTenant.id}/offers/${offer.id}`}
                            >
                              View
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="h-24 text-center"
                      >
                        No offers found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            {data && data.length > 0 && (
              <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={data.length < limit}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
} 
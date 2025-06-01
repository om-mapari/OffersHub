import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/offers")({
  component: OffersLayout,
});
 
function OffersLayout() {
  return <Outlet />;
} 
from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth, 
    users, 
    sa_tenants, 
    sa_users, 
    sa_user_roles,
    offers, # Will be mounted under tenants
    campaigns, # Will be mounted under tenants
    customers
)

api_router = APIRouter()

# Authentication
api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])

# Current User specific routes
api_router.include_router(users.router, prefix="/users", tags=["Users - Current User"])

# Super Admin routes
api_router.include_router(sa_tenants.router, prefix="/sa/tenants", tags=["Super Admin - Tenants"])
api_router.include_router(sa_users.router, prefix="/sa/users", tags=["Super Admin - Users"])
api_router.include_router(sa_user_roles.router, prefix="/sa/user-tenant-roles", tags=["Super Admin - User Tenant Roles"])

# General Customer Management (could be Super Admin or specific role)
api_router.include_router(customers.router, prefix="/customers", tags=["Customers"])


# Tenant-scoped routes
# These routers (offers, campaigns) will expect tenant_name in their path operations
# and use dependencies to ensure user has access to the tenant.
# We create a parent router for /tenants/{tenant_name} to group them.

tenant_scoped_router = APIRouter()
tenant_scoped_router.include_router(offers.router, prefix="/offers", tags=["Tenant Offers"])
tenant_scoped_router.include_router(campaigns.router, prefix="/campaigns", tags=["Tenant Campaigns"])

# Mount tenant-scoped routes under /tenants/{tenant_name}
api_router.include_router(tenant_scoped_router, prefix="/tenants/{tenant_name}")

# Note: The actual path parameter {tenant_name} will be handled by FastAPI if defined in
# the endpoint functions within offers.router and campaigns.router, along with dependencies
# like get_tenant_by_name from deps.py.

from .crud_user import user
from .crud_tenant import tenant
from .crud_user_tenant_role import user_tenant_role
from .crud_offer import offer
from .crud_offer_audit_log import offer_audit_log
from .crud_customer import customer
from .crud_campaign import campaign
from .crud_campaign_customer import campaign_customer

# For a more generic approach, you could initialize CRUDBase instances here
# from .base import CRUDBase
# from app.models import User, Tenant # etc.
# from app.schemas import UserCreate, UserUpdate # etc.

# user = CRUDBase[User, UserCreate, UserUpdate](User)
# tenant = CRUDBase[Tenant, TenantCreate, TenantUpdate](Tenant)
# ... and so on for other models if they fit the generic pattern.
# However, specific CRUD classes offer more flexibility for custom methods.

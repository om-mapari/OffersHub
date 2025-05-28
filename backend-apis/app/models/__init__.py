# This file makes the 'models' directory a package.
# It's also a good place to import all your models so they are registered with SQLAlchemy's Base.
# This is important for tools like Alembic or for Base.metadata.create_all(engine).

from .user import User
from .tenant import Tenant
from .user_tenant_role import UserTenantRole
from .offer import Offer, OfferStatus
from .offer_audit_log import OfferAuditLog
from .customer import Customer
from .campaign import Campaign
from .campaign_customer import CampaignCustomer

# You can also define __all__ if you want to control what 'from .models import *' imports
# __all__ = ["User", "Tenant", "UserTenantRole", "Offer", "OfferAuditLog", "Customer", "Campaign", "CampaignCustomer"]

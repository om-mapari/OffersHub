from app.crud.base import CRUDBase
from app.models.offer_audit_log import OfferAuditLog
from app.schemas.offer_audit_log import OfferAuditLogCreate # Create only, no update schema

# Audit logs are typically append-only, so no UpdateSchemaType
class CRUDOfferAuditLog(CRUDBase[OfferAuditLog, OfferAuditLogCreate, OfferAuditLogCreate]):
    pass

offer_audit_log = CRUDOfferAuditLog(OfferAuditLog)

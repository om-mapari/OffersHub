from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from db import get_db  # Adjust this import to your actual db session module

router = APIRouter()

# ----------------------------------------------------------------------
# User Management Endpoints
@router.get("/users", response_model=list)
async def get_all_users(db: Session = Depends(get_db)):
    try:
        result = db.execute(text("SELECT * FROM users")).fetchall()
        return [dict(row) for row in result]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching users: {str(e)}")

@router.get("/users/{user_name}", response_model=dict)
async def get_user(user_name: str, db: Session = Depends(get_db)):
    try:
        result = db.execute(text("SELECT * FROM users WHERE user_name = :user_name"), {"user_name": user_name}).fetchone()
        if not result:
            raise HTTPException(status_code=404, detail="User not found")
        return dict(result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching user: {str(e)}")

@router.post("/users", response_model=dict)
async def create_user(user: dict, db: Session = Depends(get_db)):
    try:
        query = text("""
            INSERT INTO users (user_name, password_hash, full_name, is_super_admin)
            VALUES (:user_name, :password_hash, :full_name, :is_super_admin)
            RETURNING *
        """)
        result = db.execute(query, user).fetchone()
        db.commit()
        return dict(result)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating user: {str(e)}")

@router.put("/users/{user_name}", response_model=dict)
async def update_user(user_name: str, user_update: dict, db: Session = Depends(get_db)):
    try:
        query = text("""
            UPDATE users
            SET password_hash = :password_hash,
                full_name = :full_name,
                is_super_admin = :is_super_admin
            WHERE user_name = :user_name
            RETURNING *
        """)
        user_update["user_name"] = user_name
        result = db.execute(query, user_update).fetchone()
        db.commit()
        if not result:
            raise HTTPException(status_code=404, detail="User not found")
        return dict(result)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating user: {str(e)}")

@router.delete("/users/{user_name}", response_model=dict)
async def delete_user(user_name: str, db: Session = Depends(get_db)):
    try:
        result = db.execute(text("DELETE FROM users WHERE user_name = :user_name RETURNING *"), {"user_name": user_name}).fetchone()
        db.commit()
        if not result:
            raise HTTPException(status_code=404, detail="User not found")
        return dict(result)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting user: {str(e)}")


# ----------------------------------------------------------------------
# Tenants Management Endpoints
@router.get("/tenants", response_model=list)
async def get_all_tenants(db: Session = Depends(get_db)):
    try:
        result = db.execute(text("SELECT * FROM tenants")).fetchall()
        return [dict(row) for row in result]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching tenants: {str(e)}")

@router.get("/tenants/{tenant_name}", response_model=dict)
async def get_tenants_by_id(tenant_name: str, db: Session = Depends(get_db)):
    try:
        result = db.execute(text("SELECT * FROM tenants WHERE tenant_name = :tenant_name"), { "tenant_name": tenant_name }).fetchone()
        if not result:
            raise HTTPException(status_code=404, detail="tenants not found")
        return dict(result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching tenants: {str(e)}")

@router.post("/tenants", response_model=dict)
async def create_tenants(payload: dict, db: Session = Depends(get_db)):
    try:
        keys = payload.keys()
        query = text(f"INSERT INTO tenants ({', '.join(keys)}) VALUES ({', '.join([f':{k}' for k in keys])}) RETURNING *")
        result = db.execute(query, payload).fetchone()
        db.commit()
        return dict(result)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating tenants: {str(e)}")

@router.put("/tenants/{tenant_name}", response_model=dict)
async def update_tenants(tenant_name: str, payload: dict, db: Session = Depends(get_db)):
    try:
        set_clause = ', '.join([f"{k} = :{k}" for k in payload.keys()])
        query = text(f"UPDATE tenants SET {set_clause} WHERE tenant_name = :tenant_name RETURNING *")
        payload.update({ "tenant_name": tenant_name })
        result = db.execute(query, payload).fetchone()
        db.commit()
        if not result:
            raise HTTPException(status_code=404, detail="tenants not found")
        return dict(result)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating tenants: {str(e)}")

@router.delete("/tenants/{tenant_name}", response_model=dict)
async def delete_tenants(tenant_name: str, db: Session = Depends(get_db)):
    try:
        result = db.execute(text("DELETE FROM tenants WHERE tenant_name = :tenant_name RETURNING *"), { "tenant_name": tenant_name }).fetchone()
        db.commit()
        if not result:
            raise HTTPException(status_code=404, detail="tenants not found")
        return dict(result)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting tenants: {str(e)}")


# ----------------------------------------------------------------------
# User-Tenant Roles Management Endpoints
@router.get("/user-tenant-roles", response_model=list)
async def get_all_user_tenant_roles(db: Session = Depends(get_db)):
    try:
        result = db.execute(text("SELECT * FROM user_tenant_roles")).fetchall()
        return [dict(row) for row in result]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching user_tenant_roles: {str(e)}")

@router.get("/user-tenant-roles/{username}/{tenant_name}", response_model=dict)
async def get_user_tenant_roles_by_id(username: str, tenant_name: str, db: Session = Depends(get_db)):
    try:
        result = db.execute(
            text("SELECT * FROM user_tenant_roles WHERE username = :username AND tenant_name = :tenant_name"),
            {"username": username, "tenant_name": tenant_name}
        ).fetchone()
        if not result:
            raise HTTPException(status_code=404, detail="user_tenant_roles not found")
        return dict(result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching user_tenant_roles: {str(e)}")

@router.post("/user-tenant-roles", response_model=dict)
async def create_user_tenant_roles(payload: dict, db: Session = Depends(get_db)):
    try:
        keys = payload.keys()
        query = text(f"INSERT INTO user_tenant_roles ({', '.join(keys)}) VALUES ({', '.join([f':{k}' for k in keys])}) RETURNING *")
        result = db.execute(query, payload).fetchone()
        db.commit()
        return dict(result)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating user_tenant_roles: {str(e)}")

@router.put("/user-tenant-roles/{username}/{tenant_name}", response_model=dict)
async def update_user_tenant_roles(username: str, tenant_name: str, payload: dict, db: Session = Depends(get_db)):
    try:
        set_clause = ', '.join([f"{k} = :{k}" for k in payload.keys()])
        query = text(f"UPDATE user_tenant_roles SET {set_clause} WHERE username = :username AND tenant_name = :tenant_name RETURNING *")
        payload.update({"username": username, "tenant_name": tenant_name})
        result = db.execute(query, payload).fetchone()
        db.commit()
        if not result:
            raise HTTPException(status_code=404, detail="user_tenant_roles not found")
        return dict(result)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating user_tenant_roles: {str(e)}")

@router.delete("/user-tenant-roles/{username}/{tenant_name}", response_model=dict)
async def delete_user_tenant_roles(username: str, tenant_name: str, db: Session = Depends(get_db)):
    try:
        result = db.execute(
            text("DELETE FROM user_tenant_roles WHERE username = :username AND tenant_name = :tenant_name RETURNING *"),
            {"username": username, "tenant_name": tenant_name}
        ).fetchone()
        db.commit()
        if not result:
            raise HTTPException(status_code=404, detail="user_tenant_roles not found")
        return dict(result)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting user_tenant_roles: {str(e)}")


# ----------------------------------------------------------------------
# Offers Management Endpoints
@router.get("/offers", response_model=list)
async def get_all_offers(db: Session = Depends(get_db)):
    try:
        result = db.execute(text("SELECT * FROM offers")).fetchall()
        return [dict(row) for row in result]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching offers: {str(e)}")

@router.get("/offers/{offer_id}", response_model=dict)
async def get_offers_by_id(offer_id: int, db: Session = Depends(get_db)):
    try:
        result = db.execute(text("SELECT * FROM offers WHERE offer_id = :offer_id"), {"offer_id": offer_id}).fetchone()
        if not result:
            raise HTTPException(status_code=404, detail="offers not found")
        return dict(result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching offers: {str(e)}")

@router.post("/offers", response_model=dict)
async def create_offers(payload: dict, db: Session = Depends(get_db)):
    try:
        keys = payload.keys()
        query = text(f"INSERT INTO offers ({', '.join(keys)}) VALUES ({', '.join([f':{k}' for k in keys])}) RETURNING *")
        result = db.execute(query, payload).fetchone()
        db.commit()
        return dict(result)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating offers: {str(e)}")

@router.put("/offers/{offer_id}", response_model=dict)
async def update_offers(offer_id: int, payload: dict, db: Session = Depends(get_db)):
    try:
        set_clause = ', '.join([f"{k} = :{k}" for k in payload.keys()])
        query = text(f"UPDATE offers SET {set_clause} WHERE offer_id = :offer_id RETURNING *")
        payload.update({"offer_id": offer_id})
        result = db.execute(query, payload).fetchone()
        db.commit()
        if not result:
            raise HTTPException(status_code=404, detail="offers not found")
        return dict(result)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating offers: {str(e)}")

@router.delete("/offers/{offer_id}", response_model=dict)
async def delete_offers(offer_id: int, db: Session = Depends(get_db)):
    try:
        result = db.execute(text("DELETE FROM offers WHERE offer_id = :offer_id RETURNING *"), {"offer_id": offer_id}).fetchone()
        db.commit()
        if not result:
            raise HTTPException(status_code=404, detail="offers not found")
        return dict(result)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting offers: {str(e)}")


# ----------------------------------------------------------------------
# Offer Audit Logs Management Endpoints
@router.get("/offer-audit-logs", response_model=list)
async def get_all_offer_audit_logs(db: Session = Depends(get_db)):
    try:
        result = db.execute(text("SELECT * FROM offer_audit_logs")).fetchall()
        return [dict(row) for row in result]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching offer_audit_logs: {str(e)}")

@router.get("/offer-audit-logs/{audit_id}", response_model=dict)
async def get_offer_audit_log_by_id(audit_id: int, db: Session = Depends(get_db)):
    try:
        result = db.execute(
            text("SELECT * FROM offer_audit_logs WHERE audit_id = :audit_id"),
            {"audit_id": audit_id}
        ).fetchone()
        if not result:
            raise HTTPException(status_code=404, detail="offer_audit_log not found")
        return dict(result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching offer_audit_log: {str(e)}")

@router.post("/offer-audit-logs", response_model=dict)
async def create_offer_audit_log(payload: dict, db: Session = Depends(get_db)):
    try:
        keys = payload.keys()
        query = text(f"INSERT INTO offer_audit_logs ({', '.join(keys)}) VALUES ({', '.join([f':{k}' for k in keys])}) RETURNING *")
        result = db.execute(query, payload).fetchone()
        db.commit()
        return dict(result)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating offer_audit_log: {str(e)}")

@router.put("/offer-audit-logs/{audit_id}", response_model=dict)
async def update_offer_audit_log(audit_id: int, payload: dict, db: Session = Depends(get_db)):
    try:
        set_clause = ', '.join([f"{k} = :{k}" for k in payload.keys()])
        query = text(f"UPDATE offer_audit_logs SET {set_clause} WHERE audit_id = :audit_id RETURNING *")
        payload.update({"audit_id": audit_id})
        result = db.execute(query, payload).fetchone()
        db.commit()
        if not result:
            raise HTTPException(status_code=404, detail="offer_audit_log not found")
        return dict(result)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating offer_audit_log: {str(e)}")

@router.delete("/offer-audit-logs/{audit_id}", response_model=dict)
async def delete_offer_audit_log(audit_id: int, db: Session = Depends(get_db)):
    try:
        result = db.execute(
            text("DELETE FROM offer_audit_logs WHERE audit_id = :audit_id RETURNING *"),
            {"audit_id": audit_id}
        ).fetchone()
        db.commit()
        if not result:
            raise HTTPException(status_code=404, detail="offer_audit_log not found")
        return dict(result)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting offer_audit_log: {str(e)}")


# ----------------------------------------------------------------------
# Customer Management Endpoints
@router.get("/customers", response_model=list)
async def get_all_customers(db: Session = Depends(get_db)):
    try:
        result = db.execute(text("SELECT * FROM customers")).fetchall()
        return [dict(row) for row in result]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching customers: {str(e)}")

@router.get("/customers/{customer_id}", response_model=dict)
async def get_customer_by_id(customer_id: str, db: Session = Depends(get_db)):
    try:
        result = db.execute(
            text("SELECT * FROM customers WHERE customer_id = :customer_id"),
            {"customer_id": customer_id}
        ).fetchone()
        if not result:
            raise HTTPException(status_code=404, detail="Customer not found")
        return dict(result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching customer: {str(e)}")

@router.post("/customers", response_model=dict)
async def create_customer(payload: dict, db: Session = Depends(get_db)):
    try:
        keys = payload.keys()
        query = text(f"INSERT INTO customers ({', '.join(keys)}) VALUES ({', '.join([f':{k}' for k in keys])}) RETURNING *")
        result = db.execute(query, payload).fetchone()
        db.commit()
        return dict(result)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating customer: {str(e)}")

@router.put("/customers/{customer_id}", response_model=dict)
async def update_customer(customer_id: str, payload: dict, db: Session = Depends(get_db)):
    try:
        set_clause = ', '.join([f"{k} = :{k}" for k in payload.keys()])
        query = text(f"UPDATE customers SET {set_clause} WHERE customer_id = :customer_id RETURNING *")
        payload.update({"customer_id": customer_id})
        result = db.execute(query, payload).fetchone()
        db.commit()
        if not result:
            raise HTTPException(status_code=404, detail="Customer not found")
        return dict(result)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating customer: {str(e)}")

@router.delete("/customers/{customer_id}", response_model=dict)
async def delete_customer(customer_id: str, db: Session = Depends(get_db)):
    try:
        result = db.execute(
            text("DELETE FROM customers WHERE customer_id = :customer_id RETURNING *"),
            {"customer_id": customer_id}
        ).fetchone()
        db.commit()
        if not result:
            raise HTTPException(status_code=404, detail="Customer not found")
        return dict(result)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting customer: {str(e)}")


# ----------------------------------------------------------------------
# Campaigns Management Endpoints
@router.get("/campaigns", response_model=list)
async def get_all_campaigns(db: Session = Depends(get_db)):
    try:
        result = db.execute(text("SELECT * FROM campaigns")).fetchall()
        return [dict(row) for row in result]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching campaigns: {str(e)}")

@router.get("/campaigns/{campaign_id}", response_model=dict)
async def get_campaign_by_id(campaign_id: int, db: Session = Depends(get_db)):
    try:
        result = db.execute(
            text("SELECT * FROM campaigns WHERE campaign_id = :campaign_id"),
            {"campaign_id": campaign_id}
        ).fetchone()
        if not result:
            raise HTTPException(status_code=404, detail="Campaign not found")
        return dict(result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching campaign: {str(e)}")

@router.post("/campaigns", response_model=dict)
async def create_campaign(payload: dict, db: Session = Depends(get_db)):
    try:
        keys = payload.keys()
        query = text(f"INSERT INTO campaigns ({', '.join(keys)}) VALUES ({', '.join([f':{k}' for k in keys])}) RETURNING *")
        result = db.execute(query, payload).fetchone()
        db.commit()
        return dict(result)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating campaign: {str(e)}")

@router.put("/campaigns/{campaign_id}", response_model=dict)
async def update_campaign(campaign_id: int, payload: dict, db: Session = Depends(get_db)):
    try:
        set_clause = ', '.join([f"{k} = :{k}" for k in payload.keys()])
        query = text(f"UPDATE campaigns SET {set_clause} WHERE campaign_id = :campaign_id RETURNING *")
        payload.update({"campaign_id": campaign_id})
        result = db.execute(query, payload).fetchone()
        db.commit()
        if not result:
            raise HTTPException(status_code=404, detail="Campaign not found")
        return dict(result)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating campaign: {str(e)}")

@router.delete("/campaigns/{campaign_id}", response_model=dict)
async def delete_campaign(campaign_id: int, db: Session = Depends(get_db)):
    try:
        result = db.execute(
            text("DELETE FROM campaigns WHERE campaign_id = :campaign_id RETURNING *"),
            {"campaign_id": campaign_id}
        ).fetchone()
        db.commit()
        if not result:
            raise HTTPException(status_code=404, detail="Campaign not found")
        return dict(result)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting campaign: {str(e)}")


# ----------------------------------------------------------------------
# Campaign Customers Management Endpoints
@router.get("/campaign-customers", response_model=list)
async def get_all_campaign_customers(db: Session = Depends(get_db)):
    try:
        result = db.execute(text("SELECT * FROM campaign_customers")).fetchall()
        return [dict(row) for row in result]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching campaign_customers: {str(e)}")

@router.get("/campaign-customers/{campaign_id}/{customer_id}", response_model=dict)
async def get_campaign_customer(campaign_id: int, customer_id: str, db: Session = Depends(get_db)):
    try:
        result = db.execute(
            text("""
                SELECT * FROM campaign_customers 
                WHERE campaign_id = :campaign_id AND customer_id = :customer_id
            """),
            {"campaign_id": campaign_id, "customer_id": customer_id}
        ).fetchone()
        if not result:
            raise HTTPException(status_code=404, detail="Campaign customer record not found")
        return dict(result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching campaign_customer: {str(e)}")

@router.post("/campaign-customers", response_model=dict)
async def create_campaign_customer(payload: dict, db: Session = Depends(get_db)):
    try:
        keys = payload.keys()
        query = text(f"""
            INSERT INTO campaign_customers ({', '.join(keys)}) 
            VALUES ({', '.join([f':{k}' for k in keys])}) RETURNING *
        """)
        result = db.execute(query, payload).fetchone()
        db.commit()
        return dict(result)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating campaign_customer: {str(e)}")

@router.put("/campaign-customers/{campaign_id}/{customer_id}", response_model=dict)
async def update_campaign_customer(campaign_id: int, customer_id: str, payload: dict, db: Session = Depends(get_db)):
    try:
        set_clause = ', '.join([f"{k} = :{k}" for k in payload.keys()])
        query = text(f"""
            UPDATE campaign_customers 
            SET {set_clause}
            WHERE campaign_id = :campaign_id AND customer_id = :customer_id
            RETURNING *
        """)
        payload.update({"campaign_id": campaign_id, "customer_id": customer_id})
        result = db.execute(query, payload).fetchone()
        db.commit()
        if not result:
            raise HTTPException(status_code=404, detail="Campaign customer record not found")
        return dict(result)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating campaign_customer: {str(e)}")

@router.delete("/campaign-customers/{campaign_id}/{customer_id}", response_model=dict)
async def delete_campaign_customer(campaign_id: int, customer_id: str, db: Session = Depends(get_db)):
    try:
        result = db.execute(
            text("""
                DELETE FROM campaign_customers 
                WHERE campaign_id = :campaign_id AND customer_id = :customer_id 
                RETURNING *
            """),
            {"campaign_id": campaign_id, "customer_id": customer_id}
        ).fetchone()
        db.commit()
        if not result:
            raise HTTPException(status_code=404, detail="Campaign customer record not found")
        return dict(result)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting campaign_customer: {str(e)}")

# ---------------------------------------------------------------------
You task is to understand my goal and help me to do auth for my application 
Your output should be file path and required in that file 
The Code should be working so check thought everything
Make sure to check my example campaign code to follow similar style of creating and using function and apis 



🧱 My Goal
You want each tenant to be like a financial product (e.g., “Credit Card”, “Loan”).
Each tenant has user groups (roles) like cc_admin, cc_approver, etc.
Users can belong to one or more groups per tenant.
A Super Admin can create tenants and manage users/groups.
All API access should be scoped by tenant + group permissions.

✅ Step-by-Step Plan to Implement Auth + Multi-Tenancy
1️⃣ Update Your Database Schema
You’ll need to extend your DB with tenant, user_group, and user_group_assignment.
I have updated the schema Already so this is done 

2️⃣ Create Models (models/tenant.py, models/user_group.py)
Example: models/tenant.py

python
class Tenant(Base):
    __tablename__ = "tenant"
    tenant_id = Column(Integer, primary_key=True)
    name = Column(String, unique=True)
Same for UserGroup and UserGroupAssignment.

3️⃣ Update Schemas (schemas/tenant_schema.py, etc.)
Create pydantic schemas like:

python
class TenantCreate(BaseModel):
    name: str

class UserGroupCreate(BaseModel):
    tenant_id: int
    group_name: str
4️⃣ Add CRUD for Tenants, UserGroups, Assignments
In crud/tenant_crud.py, user_group_crud.py, etc., create functions like:

python
def create_tenant(db: Session, tenant: TenantCreate):
    new_tenant = Tenant(**tenant.dict())
    db.add(new_tenant)
    db.commit()
    db.refresh(new_tenant)
    return new_tenant
5️⃣ Add Role and Tenant Info to JWTs
Update auth_handler.py to include tenant_id, group_names in the JWT.

python
def encode_token(user_id, tenant_id, group_names):
    payload = {
        "sub": user_id,
        "tenant_id": tenant_id,
        "groups": group_names,
        "exp": datetime.utcnow() + timedelta(hours=1)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")
6️⃣ Create Auth Utilities to Enforce Access
Create a file like auth/tenant_guard.py:

python
from fastapi import Depends, HTTPException
from app.auth.auth_bearer import JWTBearer
from jose import jwt

def require_group(group_name: str):
    def wrapper(user=Depends(JWTBearer())):
        if group_name not in user["groups"]:
            raise HTTPException(status_code=403, detail="Unauthorized")
        return user
    return wrapper
Then use in views:

python
@router.post("/create-offer")
def create_offer(..., user=Depends(require_group("cc_createOffer"))):
    ...
7️⃣ Add Super Admin Support
Add a role column to users table (e.g., "super_admin", "tenant_user")

Update token to include this

Enforce global access only for super admins when managing tenants

8️⃣ Scoping All Data by Tenant
In every DB query, ensure you filter by tenant_id from the JWT. Example in offer_crud.py:

python
def get_offers_by_tenant(db: Session, tenant_id: int):
    return db.query(Offer).filter_by(tenant_id=tenant_id).all()
You’ll need to:

Add tenant_id to all relevant tables (offer, campaign, etc.)

Add it to your models and schemas

Extract tenant_id from token on each request

9️⃣ Optional: Seed Initial Groups per Tenant Automatically
When a tenant is created, insert groups like cc_admin, cc_read_only, etc., automatically.

python
def create_default_groups(tenant_id):
    groups = ["cc_admin", "cc_read_only", "cc_createOffer", "cc_approver"]
    for name in groups:
        db.add(UserGroup(tenant_id=tenant_id, group_name=name))
🔟 Build the Views
Add endpoints in auth_view.py, tenant_view.py, etc.:

POST /tenants/ – for super admin to create a tenant

POST /tenants/{tenant_id}/groups – create user groups

POST /users/{user_id}/assign-group – assign users to groups

🧪 Example Token Payload After Login
json
{
  "sub": 12,
  "tenant_id": 3,
  "groups": ["cc_admin", "cc_createOffer"],
  "exp": 1716926820
}



database schema
```
-- Create customer table
CREATE TABLE customer (
    customer_id INT PRIMARY KEY,
    name VARCHAR(100),
    age INT,
    income DECIMAL(10,2),
    credit_score INT
);

-- Create transaction table
CREATE TABLE transaction (
    transaction_id INT PRIMARY KEY,
    customer_id INT,
    transaction_date DATE,
    amount DECIMAL(10,2),
    spend_category VARCHAR(100),
    FOREIGN KEY (customer_id) REFERENCES customer(customer_id)
);

-- Create offer table
CREATE TABLE offer (
    offer_id INT PRIMARY KEY,
    offer_name VARCHAR(100),
    offer_type VARCHAR(50),
    cashback_percentage DECIMAL(5,2),
    discount_amount DECIMAL(10,2),
    reward_points DECIMAL(10,2),
    interest_rate DECIMAL(5,2),
    fee_waiver BOOLEAN,
    miles_earned DECIMAL(10,2),
    category VARCHAR(50),
    valid_from DATE,
    valid_to DATE,
    status VARCHAR(50)
);

-- Create campaign table
CREATE TABLE campaign (
    campaign_id INT PRIMARY KEY,
    campaign_name VARCHAR(100),
    start_date DATE,
    end_date DATE,
    budget DECIMAL(15,2),
    status VARCHAR(50)
);

-- Create offer_campaign table (junction table)
CREATE TABLE offer_campaign (
    offer_id INT,
    campaign_id INT,
    PRIMARY KEY (offer_id, campaign_id),
    FOREIGN KEY (offer_id) REFERENCES offer(offer_id),
    FOREIGN KEY (campaign_id) REFERENCES campaign(campaign_id)
);

-- Create selection_criteria table
CREATE TABLE selection_criteria (
    criteria_id INT PRIMARY KEY,
    campaign_id INT,
    table_reference VARCHAR(100),
    field_name VARCHAR(100),
    condition_operator VARCHAR(20),
    value VARCHAR(100),
    FOREIGN KEY (campaign_id) REFERENCES campaign(campaign_id)
);

-- Create selection_field_master table
CREATE TABLE selection_field_master (
    field_id SERIAL PRIMARY KEY,
    table_reference VARCHAR(100),
    field_name VARCHAR(100),
    allowed_operators TEXT
);

-- Create target_customers table
CREATE TABLE target_customers (
    target_id INT PRIMARY KEY,
    customer_id INT,
    offer_id INT,
    status VARCHAR(50),
    FOREIGN KEY (customer_id) REFERENCES customer(customer_id),
    FOREIGN KEY (offer_id) REFERENCES offer(offer_id)
);

-- Create users table for authentication
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    hashed_password TEXT NOT NULL
);

-- Tenants
CREATE TABLE tenant (
    tenant_id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

-- User groups per tenant (e.g., cc_admin, cc_read_only)
CREATE TABLE user_group (
    group_id SERIAL PRIMARY KEY,
    tenant_id INT NOT NULL,
    group_name VARCHAR(100),
    FOREIGN KEY (tenant_id) REFERENCES tenant(tenant_id)
);

-- User group assignment (many-to-many)
CREATE TABLE user_group_assignment (
    assignment_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    group_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (group_id) REFERENCES user_group(group_id)
);

```


App stracture
```
app\
├── auth
│   ├── auth_bearer.py
│   ├── auth_handler.py
│   └── auth_utils.py
├── controllers
│   ├── auth_controller.py
│   ├── campaign_controller.py
│   ├── customer_controller.py
│   ├── offer_campaign_controller.py
│   ├── offer_controller.py
│   ├── selection_criteria_controller.py
│   ├── target_customers_controller.py
│   └── transaction_controller.py
├── crud
│   ├── campaign_crud.py
│   ├── customer_crud.py
│   ├── offer_campaign_crud.py
│   ├── offer_crud.py
│   ├── selection_criteria_crud.py
│   ├── target_customers_crud.py
│   ├── transaction_crud.py
│   └── user_crud.py
├── database
│   └── connection.py
├── middlewares
│   └── logging_middleware.py
├── models
│   ├── campaign.py
│   ├── customer.py
│   ├── offer.py
│   ├── offer_campaign.py
│   ├── selection_criteria.py
│   ├── target_customers.py
│   ├── transaction.py
│   └── user.py
├── schemas
│   ├── campaign_schema.py
│   ├── customer_schema.py
│   ├── offer_campaign_schema.py
│   ├── offer_schema.py
│   ├── selection_criteria_schema.py
│   ├── target_customers_schema.py
│   ├── transaction_schema.py
│   └── user_schema.py
├── utils
│   └── password_utils.py
├── views
│   ├── auth_view.py
│   ├── campaign_view.py
│   ├── customer_view.py
│   ├── offer_view.py
│   ├── selection_criteria_view.py
│   ├── target_customers_view.py
│   └── transaction_view.py
├── __init__.py
└── main.py
```


Example campaign api code below for context of writing code 
1. **models/campaign.py:**

   ```python
   from sqlalchemy import Column, Integer, String, DECIMAL, Date
   from database.connection import Base

   class Campaign(Base):
       __tablename__ = "campaign"

       campaign_id = Column(Integer, primary_key=True, index=True)
       campaign_name = Column(String(100))
       start_date = Column(Date)
       end_date = Column(Date)
       budget = Column(DECIMAL(15, 2))
       status = Column(String(50))
   ```


2. **schemas/campaign\_schema.py:**

   ```python
   from pydantic import BaseModel
   from datetime import date

   class CampaignCreate(BaseModel):
       campaign_id: int
       campaign_name: str
       start_date: date
       end_date: date
       budget: float
       status: str

   class CampaignRead(CampaignCreate):
       class Config:
           orm_mode = True
   ```

3. **crud/campaign\_crud.py:**

   ```python
   from sqlalchemy.orm import Session
   from models.campaign import Campaign
   from schemas.campaign_schema import CampaignCreate

   def get_all_campaigns(db: Session):
       return db.query(Campaign).all()

   def get_campaign_by_id(db: Session, campaign_id: int):
       return db.query(Campaign).filter(Campaign.campaign_id == campaign_id).first()

   def create_campaign(db: Session, campaign: CampaignCreate):
       db_campaign = Campaign(**campaign.dict())
       db.add(db_campaign)
       db.commit()
       db.refresh(db_campaign)
       return db_campaign

   def update_campaign(db: Session, campaign_id: int, updated_data: CampaignCreate):
       db_campaign = db.query(Campaign).filter(Campaign.campaign_id == campaign_id).first()
       if db_campaign:
           for key, value in updated_data.dict().items():
               setattr(db_campaign, key, value)
           db.commit()
           db.refresh(db_campaign)
       return db_campaign

   def delete_campaign(db: Session, campaign_id: int):
       db_campaign = db.query(Campaign).filter(Campaign.campaign_id == campaign_id).first()
       if db_campaign:
           db.delete(db_campaign)
           db.commit()
       return db_campaign
   ```
4. **controllers/campaign\_controller.py:**

   ```python
   from sqlalchemy.orm import Session
   from schemas.campaign_schema import CampaignCreate
   from crud import campaign_crud

   def get_all_campaigns(db: Session):
       return campaign_crud.get_all_campaigns(db)

   def get_campaign(db: Session, campaign_id: int):
       return campaign_crud.get_campaign_by_id(db, campaign_id)

   def create_campaign(db: Session, campaign: CampaignCreate):
       return campaign_crud.create_campaign(db, campaign)

   def update_campaign(db: Session, campaign_id: int, campaign_data: CampaignCreate):
       return campaign_crud.update_campaign(db, campaign_id, campaign_data)

   def delete_campaign(db: Session, campaign_id: int):
       return campaign_crud.delete_campaign(db, campaign_id)
   ```
5. **views/campaign\_view\.py:**

   ```python
   from fastapi import APIRouter, Depends, HTTPException
   from sqlalchemy.orm import Session
   from database.connection import get_db
   from schemas.campaign_schema import CampaignCreate, CampaignRead
   from controllers import campaign_controller

   router = APIRouter(prefix="/campaigns", tags=["Campaigns"])

   @router.get("/", response_model=list[CampaignRead])
   def get_campaigns(db: Session = Depends(get_db)):
       return campaign_controller.get_all_campaigns(db)

   @router.get("/{campaign_id}", response_model=CampaignRead)
   def get_campaign(campaign_id: int, db: Session = Depends(get_db)):
       campaign = campaign_controller.get_campaign(db, campaign_id)
       if not campaign:
           raise HTTPException(status_code=404, detail="Campaign not found")
       return campaign

   @router.post("/", response_model=CampaignRead)
   def create_campaign(campaign: CampaignCreate, db: Session = Depends(get_db)):
       return campaign_controller.create_campaign(db, campaign)

   @router.put("/{campaign_id}", response_model=CampaignRead)
   def update_campaign(campaign_id: int, campaign_data: CampaignCreate, db: Session = Depends(get_db)):
       updated = campaign_controller.update_campaign(db, campaign_id, campaign_data)
       if not updated:
           raise HTTPException(status_code=404, detail="Campaign not found")
       return updated

   @router.delete("/{campaign_id}")
   def delete_campaign(campaign_id: int, db: Session = Depends(get_db)):
       deleted = campaign_controller.delete_campaign(db, campaign_id)
       if not deleted:
           raise HTTPException(status_code=404, detail="Campaign not found")
       return {"detail": "Campaign deleted successfully"}
   ```



6. **main.py:**

   ```python
   from fastapi import FastAPI
   from views import offer_view, customer_view, campaign_view

   app = FastAPI()

   app.include_router(offer_view.router)
   app.include_router(customer_view.router)
   app.include_router(campaign_view.router)

   @app.get("/")
   def root():
       return {"message": "Offer API is running"}
   ```
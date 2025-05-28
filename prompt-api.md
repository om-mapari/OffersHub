**Instruction:**

*Generate the complete API code for the `{{table_name}}` table with the following fields:*
*The Final Output should be creating just 1 single shell script which is creating required files and putting all required code in that file*

Target Customer APIs
Tables involved: target_customers

Endpoints:

GET /target-customers – Get all targets

GET /target-customers/by-customer/{customer_id} – Filter by customer

POST /target-customers – Assign offer to customer

GET /target-customers/by-offer/{offer_id} – Filter by offer

```sql
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

```



**Requirements:**

1. **SQL Schema (`init.sql`):** Read the SQL `CREATE TABLE` statement for `{{table_name}}` carefully.

2. **Model (`models/{{table_name}}.py`):** Create a SQLAlchemy model class for `{{table_name}}`, ensuring it inherits from `Base` and includes all specified fields with appropriate data types.([Stack Overflow][1])

3. **Schema (`schemas/{{table_name}}_schema.py`):** Define Pydantic models for request and response validation, including `{{TableName}}Create` and `{{TableName}}Read` classes.

4. **CRUD Operations (`crud/{{table_name}}_crud.py`):** Implement functions for Create, Read, Update, and Delete operations for `{{table_name}}`.

5. **Controller (`controllers/{{table_name}}_controller.py`):** Develop controller functions that interface between the API routes and CRUD operations.

6. **View (`views/{{table_name}}_view.py`):** Set up API routes using FastAPI's `APIRouter`, connecting endpoints to the corresponding controller functions.

7. **Main Application (`main.py`):** Ensure the new router is included in the FastAPI application instance.

**Conventions:**

* **Folder Structure:** Maintain the existing directory hierarchy:

```
  app/
  ├── controllers/
  ├── crud/
  ├── database/
  ├── middlewares/
  ├── models/
  ├── schemas/
  ├── services/
  ├── views/
  └── main.py
```



* **Import Patterns:** Use relative imports consistent with the current codebase.

* **Naming Conventions:** Follow the existing naming patterns, such as `{{table_name}}_controller.py` for controllers and `{{table_name}}_schema.py` for schemas.

* **Code Style:** Adhere to the coding style demonstrated in the provided codebase, including function definitions, error handling, and response models.

---

### 🧾 Example Usage

**Input:**

*Generate the complete API code for the `campaign` table with the following fields:*

```sql
CREATE TABLE campaign (
    campaign_id INT PRIMARY KEY,
    campaign_name VARCHAR(100),
    start_date DATE,
    end_date DATE,
    budget DECIMAL(15,2),
    status VARCHAR(50)
);
```


**Expected Output:**

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
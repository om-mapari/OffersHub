I'm building an offer management platform using **FastAPI** and **PostgreSQL** with a **multi-tenant architecture**.

🔧 **Each tenant** represents a financial product like “Credit Card”, “Loan”, etc.

🔐 **User Access Model**:

* Users can belong to multiple user groups **per tenant**.
* Default user groups: `admin`, `read_only`, `create`, `approver`.
* A **Super Admin** can create tenants and manage users and their roles.

🏗️ **Platform Flow**:
1️⃣ Super Admin creates a tenant → this auto-creates default user groups and prepares offer configuration.
2️⃣ Tenants have offer data stored in a **common `offers` table** with a flexible `data JSONB` field for custom attributes.

🧑‍💼 **Permissions by Role**:

* **All users**: login, change their own password, view their tenants and groups.
* **Super Admin**:

  * Create/update tenants, users, groups.
  * View all tenants/users and change passwords.
* **Tenant Admin (`admin`)**:

  * Full CRUD on offer data for that tenant.
  * Can alter/delete unapproved entries.
* **Tenant Creator (`create`)**:

  * Can create/edit offers (if not yet approved).
  * Add comments.
* **Tenant Approver (`approver`)**:

  * Review and approve offers.
* **Tenant Read-only (`read_only`)**:

  * View offers only.

⚙️ **How Campaigns Will Work**:
✅ Offer is created by a tenant user.

📄 A campaign is created with:

* An attached `offer_id`.
* A flexible `selection_criteria` (stored as JSONB), e.g., `{"segment": "premium", "kyc_status": "verified"}`.

🧮 A background job/Lambda/script will:

* Parse the `selection_criteria`.
* Query the `customers` table for matching records.
* Populate the `campaign_customers` table.

📤 Offers are then delivered (via email, SMS, push, etc.) and `delivery_status` fields are updated accordingly.

🧱 **Tech Choices**:

* Using `UUID` as primary keys for scalability and uniqueness.
* Offers use a `JSONB` `data` field to support flexible, tenant-specific schemas.


```sql

-- EXTENSION FOR UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- USERS
CREATE TABLE users (
    username TEXT PRIMARY KEY,
    password_hash TEXT NOT NULL,
    full_name TEXT,
    is_super_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- TENANTS
CREATE TABLE tenants (
    name TEXT PRIMARY KEY, -- e.g., 'credit_card', 'loan'
    description TEXT,
    created_by TEXT REFERENCES users(username),
    created_at TIMESTAMP DEFAULT NOW()
);

-- USER TENANT ROLES
-- role: 'admin', 'create', 'approver', 'read_only'
CREATE TABLE user_tenant_roles (
    username TEXT REFERENCES users(username) ON DELETE CASCADE,
    tenant_name TEXT REFERENCES tenants(name) ON DELETE CASCADE,
    role TEXT NOT NULL,
    PRIMARY KEY (username, tenant_name, role)
);

-- OFFERS
CREATE TABLE offers (
    id SERIAL PRIMARY KEY,
    tenant_name TEXT REFERENCES tenants(name) ON DELETE CASCADE,
    created_by TEXT REFERENCES users(username),
    status TEXT CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')) NOT NULL DEFAULT 'draft',
    comments TEXT,
    data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Trigger function to update updated_at timestamp on offers table
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call function before update on offers
CREATE TRIGGER trg_update_offers_updated_at
BEFORE UPDATE ON offers
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- OFFER AUDIT LOGS
CREATE TABLE offer_audit_logs (
    id SERIAL PRIMARY KEY,
    offer_id INT REFERENCES offers(id) ON DELETE CASCADE,
    action TEXT NOT NULL, -- 'create', 'update', 'status_change', 'comment'
    performed_by TEXT REFERENCES users(username),
    old_data JSONB,
    new_data JSONB,
    comment TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- CUSTOMERS
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    dob DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    kyc_status TEXT CHECK (kyc_status IN ('verified', 'pending', 'rejected')),
    segment TEXT, -- e.g., 'premium', 'regular', 'corporate'
    occupation TEXT, -- e.g., 'salaried', 'self-employed', 'student', 'retired'
    annual_income NUMERIC, -- income in INR/USD
    credit_score INT, -- e.g., 300–900
    state TEXT,
    city TEXT,
    pin_code TEXT,
    marital_status TEXT CHECK (marital_status IN ('single', 'married', 'divorced', 'widowed')),
    account_age_months INT,
    preferred_language TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- CAMPAIGNS
CREATE TABLE campaigns (
    id SERIAL PRIMARY KEY,
    tenant_name TEXT REFERENCES tenants(name) ON DELETE CASCADE,
    offer_id INT REFERENCES offers(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    selection_criteria JSONB,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_by TEXT REFERENCES users(username),
    status TEXT CHECK (status IN ('draft', 'active', 'paused', 'completed')) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT NOW()
);

-- CAMPAIGN CUSTOMERS
CREATE TABLE campaign_customers (
    campaign_id INT REFERENCES campaigns(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    offer_id INT REFERENCES offers(id) ON DELETE CASCADE,
    delivery_status TEXT CHECK (delivery_status IN ('pending', 'sent', 'failed')) DEFAULT 'pending',
    sent_at TIMESTAMP,
    PRIMARY KEY (campaign_id, customer_id)
);

-- INDEXES FOR FK COLUMNS FOR PERFORMANCE
CREATE INDEX idx_offer_audit_logs_offer_id ON offer_audit_logs (offer_id);
CREATE INDEX idx_user_tenant_roles_username ON user_tenant_roles (username);
CREATE INDEX idx_user_tenant_roles_tenant_name ON user_tenant_roles (tenant_name);
CREATE INDEX idx_offers_tenant_name ON offers (tenant_name);
CREATE INDEX idx_offers_created_by ON offers (created_by);
CREATE INDEX idx_campaigns_tenant_name ON campaigns (tenant_name);
CREATE INDEX idx_campaigns_offer_id ON campaigns (offer_id);
CREATE INDEX idx_campaigns_created_by ON campaigns (created_by);
CREATE INDEX idx_campaign_customers_campaign_id ON campaign_customers (campaign_id);
CREATE INDEX idx_campaign_customers_customer_id ON campaign_customers (customer_id);
CREATE INDEX idx_campaign_customers_offer_id ON campaign_customers (offer_id);

```


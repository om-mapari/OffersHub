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
CREATE INDEX idx_users_full_name ON users(full_name);

-- TENANTS
CREATE TABLE tenants (
    name TEXT PRIMARY KEY, -- e.g., 'credit_card', 'loan'
    description TEXT,
    created_by_username TEXT REFERENCES users(username),
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
    tenant_name TEXT REFERENCES tenants(name) ON DELETE CASCADE NOT NULL,
    created_by_username TEXT REFERENCES users(username),
    offer_description TEXT,
    offer_type TEXT CHECK ( offer_type IN ( 'balance_transfer', 'pricing', 'cashback', 'reward_points', 'no_cost_emi', 'fee_waiver', 'partner_offer','milestone_offer' ) ) NOT NULL DEFAULT 'other',    offer_description TEXT,
    status TEXT CHECK (status IN ('draft', 'pending_review', 'approved', 'rejected', 'retired')) NOT NULL DEFAULT 'draft',
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
    offer_id INT REFERENCES offers(id) ON DELETE CASCADE NOT NULL,
    action TEXT NOT NULL, -- 'create', 'update', 'status_change', 'comment'
    performed_by_username TEXT REFERENCES users(username),
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
    mobile TEXT UNIQUE,
    dob DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    kyc_status TEXT CHECK (kyc_status IN ('verified', 'pending', 'rejected')),
    segment TEXT, -- e.g., 'premium', 'regular', 'corporate'
    occupation TEXT, -- e.g., 'salaried', 'self-employed', 'student', 'retired'
    annual_income NUMERIC, -- income in INR/USD
    credit_score INT, -- e.g., 300–900
    address TEXT,
    state TEXT,
    city TEXT,
    pin_code TEXT,
    marital_status TEXT CHECK (marital_status IN ('single', 'married', 'divorced', 'widowed')),
    account_age_months INT,
    coomunication_preference TEXT,
    deceased_marker TEXT,
    sanctions_marker TINYTEXT,
    preferred_language TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    account_id TEXT,
    account_status TEXT,
    account_openend_date TEXT,
    credit_limit NUMERIC,
    account_current_balance NUMERIC,
    available_credit NUMERIC,
    delinquency BOOLEAN DEFAULT FALSE
);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_mobile ON customers(mobile);

-- CAMPAIGNS
CREATE TABLE campaigns (
    id SERIAL PRIMARY KEY,
    tenant_name TEXT REFERENCES tenants(name) ON DELETE CASCADE NOT NULL,
    offer_id INT REFERENCES offers(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    selection_criteria JSONB,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_by_username TEXT REFERENCES users(username),
    status TEXT CHECK (status IN ('draft', 'active', 'paused', 'completed')) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT NOW()
);

-- CAMPAIGN CUSTOMERS
CREATE TABLE campaign_customers (
    campaign_id INT REFERENCES campaigns(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    offer_id INT REFERENCES offers(id) ON DELETE CASCADE NOT NULL,
    delivery_status TEXT CHECK (delivery_status IN ('pending', 'sent', 'declined', 'accepted')) DEFAULT 'pending',
    sent_at TIMESTAMP,
    PRIMARY KEY (campaign_id, customer_id)
);

-- INDEXES FOR FK COLUMNS FOR PERFORMANCE
CREATE INDEX idx_offer_audit_logs_offer_id ON offer_audit_logs (offer_id);
CREATE INDEX idx_user_tenant_roles_username ON user_tenant_roles (username);
CREATE INDEX idx_user_tenant_roles_tenant_name ON user_tenant_roles (tenant_name);
CREATE INDEX idx_offers_tenant_name ON offers (tenant_name);
CREATE INDEX idx_offers_created_by_username ON offers (created_by_username);
CREATE INDEX idx_campaigns_tenant_name ON campaigns (tenant_name);
CREATE INDEX idx_campaigns_offer_id ON campaigns (offer_id);
CREATE INDEX idx_campaigns_created_by_username ON campaigns (created_by_username);
CREATE INDEX idx_campaign_customers_campaign_id ON campaign_customers (campaign_id);
CREATE INDEX idx_campaign_customers_customer_id ON campaign_customers (customer_id);
CREATE INDEX idx_campaign_customers_offer_id ON campaign_customers (offer_id);

SELECT 'offer_management' AS schema_name;

BEGIN;
--Rollback on error
ROLLBACK;
-- Drop tables in dependency order (children first)
DROP TABLE IF EXISTS campaign_customers CASCADE;

DROP TABLE IF EXISTS campaigns CASCADE;

DROP TABLE IF EXISTS customer CASCADE;

DROP TABLE IF EXISTS offer_audit_logs CASCADE;

DROP TABLE IF EXISTS offers CASCADE;

DROP TABLE IF EXISTS user_tenant_roles CASCADE;

DROP TABLE IF EXISTS tenants CASCADE;

DROP TABLE IF EXISTS users CASCADE;
-- Create core tables first
CREATE TABLE users (
    user_name TEXT PRIMARY KEY,
    password_hash TEXT NOT NULL,
    full_name TEXT,
    is_super_admin BOOLEAN,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tenants (
    tenant_name TEXT PRIMARY KEY CHECK (
        tenant_name IN (
            'CREDIT_CARD',
            'LOAN',
            'CURRENT_ACCOUNT',
            'DEPOSIT'
        )
    ),
    description TEXT,
    created_by_username TEXT REFERENCES users (user_name),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_tenant_roles (
    username TEXT REFERENCES users (user_name),
    tenant_name TEXT REFERENCES tenants (tenant_name),
    role TEXT CHECK (
        role IN (
            'admin',
            'read_only',
            'creator',
            'approver'
        )
    ),
    PRIMARY KEY (username, tenant_name)
);

CREATE TABLE offers (
    offer_id SERIAL PRIMARY KEY,
    description TEXT,
    tenant_name TEXT REFERENCES tenants (tenant_name),
    created_by_username TEXT REFERENCES users (user_name),
    updated_by_username TEXT REFERENCES users (user_name),
    status TEXT CHECK (
        status IN (
            'draft',
            'submitted',
            'rejected',
            'active',
            'retired'
        )
    ),
    comments TEXT,
    offer_type TEXT CHECK (
        offer_type IN (
            'cashback',
            'discount',
            'rewards',
            'apr'
        )
    ),
    cashback_percentage NUMERIC CHECK (
        cashback_percentage IS NULL
        OR offer_type = 'cashback'
    ),
    discount_amount NUMERIC CHECK (
        discount_amount IS NULL
        OR offer_type = 'discount'
    ),
    rewards_points NUMERIC CHECK (
        rewards_points IS NULL
        OR offer_type = 'rewards'
    ),
    interest_rate NUMERIC CHECK (
        interest_rate IS NULL
        OR offer_type = 'apr'
    ),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE offer_audit_logs (
    audit_id SERIAL PRIMARY KEY,
    offer_id INTEGER REFERENCES offers (offer_id),
    description TEXT,
    tenant_name TEXT REFERENCES tenants (tenant_name),
    created_by_username TEXT REFERENCES users (user_name),
    updated_by_username TEXT REFERENCES users (user_name),
    status TEXT CHECK (
        status IN (
            'draft',
            'submitted',
            'rejected',
            'active',
            'retired'
        )
    ),
    comments TEXT,
    offer_type TEXT CHECK (
        offer_type IN (
            'cashback',
            'discount',
            'rewards',
            'apr'
        )
    ),
    cashback_percentage NUMERIC,
    discount_amount NUMERIC,
    rewards_points NUMERIC,
    interest_rate NUMERIC,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE customer (
    customer_id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    mobile TEXT NOT NULL,
    dob DATE,
    gender TEXT,
    kyc_status TEXT,
    segment TEXT CHECK (
        segment IN (
            'prime',
            'regular',
            'high_transactions',
            'high_spending'
        )
    ),
    occupation TEXT,
    annual_income NUMERIC,
    credit_score INTEGER,
    address TEXT,
    state TEXT,
    city TEXT,
    pin_code TEXT,
    marital_status TEXT,
    account_age_months INTEGER,
    communication_preference TEXT CHECK (
        communication_preference IN (
            'digital',
            'paper_only',
            'digital_paper',
            'braille',
            'audio'
        )
    ),
    deceased_marker BOOLEAN,
    sanctions_marker BOOLEAN,
    is_active BOOLEAN,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    account_id TEXT UNIQUE,
    account_status TEXT CHECK (
        account_status IN ('active', 'open', 'closed')
    ),
    account_opened_date DATE,
    credit_limit NUMERIC,
    account_current_balance NUMERIC,
    available_credit NUMERIC,
    delinquency_marker BOOLEAN
);

CREATE TABLE campaigns (
    campaign_id SERIAL PRIMARY KEY,
    tenant_name TEXT REFERENCES tenants (tenant_name),
    offer_id INTEGER REFERENCES offers (offer_id),
    campaign_name TEXT,
    campaign_description TEXT,
    selection_criteria TEXT [], -- PostgreSQL array of text
    start_date DATE,
    end_date DATE,
    created_by_username TEXT REFERENCES users (user_name),
    status TEXT CHECK (
        status IN (
            'draft',
            'submitted',
            'rejected',
            'active',
            'retired'
        )
    ),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE campaign_customers (
    campaign_id INTEGER REFERENCES campaigns (campaign_id),
    customer_id TEXT REFERENCES customer (customer_id),
    offer_id INTEGER REFERENCES offers (offer_id),
    acceptance_status TEXT CHECK (
        acceptance_status IN (
            'sent',
            'accepted',
            'rejected'
        )
    ),
    sent_at TIMESTAMP,
    PRIMARY KEY (campaign_id, customer_id)
);
-- Load and validate data
COPY users (
    user_name,
    password_hash,
    full_name,
    is_super_admin,
    created_at
)
FROM '/tmp/data/users.csv'
WITH (FORMAT csv, HEADER true);

SELECT COUNT(*) AS users_loaded FROM users;

COPY tenants (
    tenant_name,
    description,
    created_by_username,
    created_at
)
FROM '/tmp/data/tenants.csv'
WITH (FORMAT csv, HEADER true);

SELECT COUNT(*) AS tenants_loaded FROM tenants;

COPY user_tenant_roles (username, tenant_name, role)
FROM '/tmp/data/user_tenant_roles.csv'
WITH (FORMAT csv, HEADER true);

SELECT COUNT(*) AS user_tenant_roles_loaded FROM user_tenant_roles;

COPY offers (
    offer_id,
    description,
    tenant_name,
    created_by_username,
    updated_by_username,
    status,
    comments,
    offer_type,
    cashback_percentage,
    discount_amount,
    rewards_points,
    interest_rate,
    created_at,
    updated_at
)
FROM '/tmp/data/offers.csv'
WITH (FORMAT csv, HEADER true);

SELECT COUNT(*) AS offers_loaded FROM offers;

COPY offer_audit_logs (
    audit_id,
    offer_id,
    description,
    tenant_name,
    created_by_username,
    updated_by_username,
    status,
    comments,
    offer_type,
    cashback_percentage,
    discount_amount,
    rewards_points,
    interest_rate,
    created_at,
    updated_at
)
FROM '/tmp/data/offer_audit_logs.csv'
WITH (FORMAT csv, HEADER true);

SELECT COUNT(*) AS offer_audit_logs_loaded FROM offer_audit_logs;

COPY customer (
    customer_id,
    full_name,
    email,
    mobile,
    dob,
    gender,
    kyc_status,
    segment,
    occupation,
    annual_income,
    credit_score,
    address,
    state,
    city,
    pin_code,
    marital_status,
    account_age_months,
    communication_preference,
    deceased_marker,
    sanctions_marker,
    is_active,
    created_at,
    updated_at,
    account_id,
    account_status,
    account_opened_date,
    credit_limit,
    account_current_balance,
    available_credit,
    delinquency_marker
)
FROM '/tmp/data/customers.csv'
WITH (FORMAT csv, HEADER true);

SELECT COUNT(*) AS customers_loaded FROM customer;

COPY campaigns (
    campaign_id,
    tenant_name,
    offer_id,
    campaign_name,
    campaign_description,
    selection_criteria,
    start_date,
    end_date,
    created_by_username,
    status,
    created_at
)
FROM '/tmp/data/campaigns.csv'
WITH (FORMAT csv, HEADER true);

SELECT COUNT(*) AS campaigns_loaded FROM campaigns;

COPY campaign_customers (
    campaign_id,
    customer_id,
    offer_id,
    acceptance_status,
    sent_at
)
FROM '/tmp/data/campaign_customers.csv'
WITH (FORMAT csv, HEADER true);

SELECT COUNT(*) AS campaign_customers_loaded FROM campaign_customers;

COMMIT;
-- 1️⃣ USERS
INSERT INTO users (username, password_hash, full_name, is_super_admin, created_at)
VALUES 
('admin1', 'hashed_pw_admin1', 'Admin1 User', TRUE, '2023-06-24 17:47:41.721293'),
('user1', 'hashed_pw_user1', 'User1 User', FALSE, '2022-08-08 17:47:41.721293'),
('user2', 'hashed_pw_user2', 'User2 User', FALSE, '2022-12-22 17:47:41.721293');

-- 2️⃣ TENANTS
INSERT INTO tenants (name, description, created_by, created_at)
VALUES 
('credit_card', 'Credit_card product', 'admin1', '2022-11-02 17:47:41.721293'),
('loan', 'Loan product', 'admin1', '2021-11-29 17:47:41.721293');

-- 3️⃣ USER-TENANT ROLES
INSERT INTO user_tenant_roles (username, tenant_name, role)
VALUES 
('admin1', 'credit_card', 'approver'),
('admin1', 'loan', 'create'),
('user1', 'credit_card', 'approver'),
('user1', 'loan', 'read_only'),
('user2', 'credit_card', 'approver'),
('user2', 'loan', 'read_only');

-- 4️⃣ OFFERS
INSERT INTO offers (tenant_name, created_by, status, comments, data, created_at, updated_at)
VALUES 
('credit_card', 'admin1', 'draft', 'Initial offer', '{"offer_type": "cashback", "value": "7%"}', '2022-07-18 17:47:41.721293', '2023-08-23 17:47:41.721293'),
('loan', 'user2', 'approved', 'Initial offer', '{"offer_type": "cashback", "value": "6%"}', '2022-11-02 17:47:41.721293', '2022-08-25 17:47:41.721293');

-- 5️⃣ CUSTOMERS
INSERT INTO customers (
    id, full_name, email, phone, dob, gender, kyc_status, segment, occupation,
    annual_income, credit_score, state, city, pin_code, marital_status,
    account_age_months, preferred_language, is_active, created_at
)
VALUES 
('cbc27d0c-75c3-4df5-9d9e-f8abf1a5bc59', 'Customer 1', 'cust1@bank.com', '1234567890', '1990-01-01', 'female', 'verified', 'corporate', 'self-employed', 1224526, 411, 'State0', 'City0', '40000', 'single', 78, 'english', TRUE, '2021-01-12 17:47:41.721293'),
('c6b161cb-38f1-4cce-9c2b-c2dc0f1d3912', 'Customer 2', 'cust2@bank.com', '1234567891', '1990-01-02', 'female', 'pending', 'regular', 'retired', 1119644, 751, 'State1', 'City1', '40001', 'single', 18, 'marathi', TRUE, '2024-02-08 17:47:41.721293'),
('40315cf5-0572-4f11-83a4-5479b1ceae2d', 'Customer 3', 'cust3@bank.com', '1234567892', '1990-01-03', 'male', 'pending', 'corporate', 'self-employed', 1619100, 614, 'State2', 'City2', '40002', 'divorced', 103, 'hindi', FALSE, '2024-05-08 17:47:41.721293'),
('aee48ef1-014f-4723-99da-cf7d1d02044d', 'Customer 4', 'cust4@bank.com', '1234567893', '1990-01-04', 'female', 'verified', 'corporate', 'retired', 1467750, 753, 'State3', 'City3', '40003', 'single', 106, 'english', FALSE, '2022-06-20 17:47:41.721293'),
('70e3511a-902c-4ae5-8949-f7ec2f512a0a', 'Customer 5', 'cust5@bank.com', '1234567894', '1990-01-05', 'male', 'verified', 'corporate', 'retired', 363676, 478, 'State4', 'City4', '40004', 'single', 47, 'english', TRUE, '2023-05-12 17:47:41.721293');

-- 6️⃣ CAMPAIGNS
INSERT INTO campaigns (
    id, tenant_name, offer_id, name, description, selection_criteria, start_date, end_date,
    created_by, status, created_at
)
VALUES 
('96870967-038c-4f90-a804-750d279e2a48', 'credit_card', 1, 'Campaign 1', 'Testing Campaign', '{"segment": "premium", "kyc_status": "verified"}', '2025-07-07', '2025-07-28', 'admin1', 'paused', '2022-09-10 17:47:41.721293'),
('2b4ec7fd-0225-43c6-91f2-9c1437cc89b5', 'loan', 2, 'Campaign 2', 'Testing Campaign', '{"segment": "premium", "kyc_status": "verified"}', '2025-06-19', '2025-07-25', 'user2', 'completed', '2022-07-23 17:47:41.721293');

-- 7️⃣ CAMPAIGN CUSTOMERS
INSERT INTO campaign_customers (campaign_id, customer_id, offer_id, delivery_status, sent_at)
VALUES 
('96870967-038c-4f90-a804-750d279e2a48', '70e3511a-902c-4ae5-8949-f7ec2f512a0a', 1, 'failed', '2023-05-16 17:47:41.721293'),
('96870967-038c-4f90-a804-750d279e2a48', 'c6b161cb-38f1-4cce-9c2b-c2dc0f1d3912', 1, 'sent', '2023-01-04 17:47:41.721293'),
('2b4ec7fd-0225-43c6-91f2-9c1437cc89b5', '40315cf5-0572-4f11-83a4-5479b1ceae2d', 1, 'pending', '2021-08-27 17:47:41.721293'),
('2b4ec7fd-0225-43c6-91f2-9c1437cc89b5', 'aee48ef1-014f-4723-99da-cf7d1d02044d', 1, 'pending', '2024-08-17 17:47:41.721293');

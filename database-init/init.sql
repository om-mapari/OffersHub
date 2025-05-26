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

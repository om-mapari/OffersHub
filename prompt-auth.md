Requirement I want to create jwt based auth for below backend application 
Tell me things that will be required for it ?


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
``` bash
Directory structure:
└── OffersHub/
     ├── backend-apis/
     │    ├── app/
     │    │    ├── controllers/
     │    │    │    ├── campaign_controller.py
     │    │    │    ├── customer_controller.py
     │    │    │    ├── offer_campaign_controller.py
     │    │    │    ├── offer_controller.py
     │    │    │    ├── selection_criteria_controller.py
     │    │    │    ├── target_customers_controller.py
     │    │    │    └── transaction_controller.py
     │    │    ├── crud/
     │    │    │    ├── campaign_crud.py
     │    │    │    ├── customer_crud.py
     │    │    │    ├── offer_campaign_crud.py
     │    │    │    ├── offer_crud.py
     │    │    │    ├── selection_criteria_crud.py
     │    │    │    ├── target_customers_crud.py
     │    │    │    └── transaction_crud.py
     │    │    ├── database/
     │    │    │    └── connection.py
     │    │    ├── main.py
     │    │    ├── middlewares/
     │    │    │    └── logging_middleware.py
     │    │    ├── models/
     │    │    │    ├── campaign.py
     │    │    │    ├── customer.py
     │    │    │    ├── offer.py
     │    │    │    ├── offer_campaign.py
     │    │    │    ├── selection_criteria.py
     │    │    │    ├── target_customers.py
     │    │    │    └── transaction.py
     │    │    ├── schemas/
     │    │    │    ├── campaign_schema.py
     │    │    │    ├── customer_schema.py
     │    │    │    ├── offer_campaign_schema.py
     │    │    │    ├── offer_schema.py
     │    │    │    ├── selection_criteria_schema.py
     │    │    │    ├── target_customers_schema.py
     │    │    │    └── transaction_schema.py
     │    │    ├── services/
     │    │    │    ├── admin_service.py
     │    │    │    └── auth_service.py
     │    │    ├── views/
     │    │    │    ├── campaign_view.py
     │    │    │    ├── customer_view.py
     │    │    │    ├── offer_view.py
     │    │    │    ├── selection_criteria_view.py
     │    │    │    ├── target_customers_view.py
     │    │    │    └── transaction_view.py
     │    │    └── __init__.py
     │    ├── Dockerfile
     │    ├── README.md
     │    └── requirements.txt
     ├── database-init/
     │    └── init.sql
     ├── docker-compose.yml
     ├── frontend-app/
     │    ├── compose.yml
     │    ├── dockerfile
     │    ├── index.html
     │    ├── LICENSE
     │    ├── package-lock.json
     │    ├── package.json
     │    ├── postcss.config.js
     │    ├── src/
     │    │    ├── App.tsx
     │    │    ├── assets/
     │    │    ├── components/
     │    │    ├── features/
     │    │    ├── hooks/
     │    │    ├── index.css
     │    │    ├── main.tsx
     │    │    ├── pages/
     │    │    ├── store.ts
     │    │    ├── utils/
     │    │    │    └── data.ts
     │    │    └── vite-env.d.ts
     │    ├── tailwind.config.js
     │    ├── tsconfig.json
     │    ├── tsconfig.node.json
     │    └── vite.config.ts
     ├── prompt.md
     └── README.md
``` 

## Contribution
*Guidelines on contributing to the project if applicable.*

## License
*Include license details if open source.*

---

*For more information or demo requests, contact [contributers].*

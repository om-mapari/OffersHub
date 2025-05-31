#!/usr/bin/env python3
"""
Data Generator for OffersHub Database
This script generates random data for all tables in the OffersHub database,
respecting foreign key constraints.
"""

import random
import string
import uuid
import json
import datetime
from typing import List, Dict, Any, Optional
import argparse
from faker import Faker
import psycopg2
from psycopg2.extras import execute_values
# Modified to use a simpler password hashing method to avoid bcrypt issues
import hashlib


from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# Initialize Faker for generating realistic data
fake = Faker()

# Database connection parameters - modify as needed
DB_PARAMS = {
    "dbname": "offer_management",
    "user": "postgres",
    "password": "postgres",
    "host": "localhost",
    "port": "5432"
}

# Constants for data generation
OFFER_TYPES = [
    'balance_transfer', 'pricing', 'cashback', 'reward_points', 
    'no_cost_emi', 'fee_waiver', 'partner_offer', 'milestone_offer'
]
OFFER_STATUSES = ['draft', 'pending_review', 'approved', 'rejected', 'retired']
CAMPAIGN_STATUSES = ['draft', 'active', 'paused', 'completed']
DELIVERY_STATUSES = ['pending', 'sent', 'declined', 'accepted']
GENDERS = ['male', 'female', 'other']
KYC_STATUSES = ['verified', 'pending', 'rejected']
SEGMENTS = ['premium', 'regular', 'corporate']
OCCUPATIONS = ['salaried', 'self-employed', 'student', 'retired']
MARITAL_STATUSES = ['single', 'married', 'divorced', 'widowed']
USER_ROLES = ['admin', 'create', 'approver', 'read_only']
LANGUAGES = ['English', 'Hindi', 'Spanish', 'French', 'German']
STATES = ['Maharashtra', 'Karnataka', 'Tamil Nadu', 'Delhi', 'Gujarat']
AUDIT_ACTIONS = ['create', 'update', 'status_change', 'comment']

def simple_hash(password):
    """Simple password hashing function to avoid bcrypt issues"""
    return hashlib.sha256(password.encode()).hexdigest()

def connect_to_db():
    """Connect to the PostgreSQL database"""
    try:
        conn = psycopg2.connect(**DB_PARAMS)
        return conn
    except Exception as e:
        print(f"Error connecting to database: {e}")
        exit(1)

def generate_users(conn, count: int = 10) -> List[str]:
    """Generate random users"""
    users = []
    # Example usage
   
    # Create one super admin
    super_admin = {
        "username": "coderom",
        "password_hash": pwd_context.hash("coderom"),
        "full_name": "System Administrator",
        "is_super_admin": True
    }
    users.append(super_admin)
    
    # Create regular users
    for _ in range(count - 1):
        username = fake.user_name()
        users.append({
            "username": username,
            "password_hash": pwd_context.hash(fake.password()),
            "full_name": fake.name(),
            "is_super_admin": False
        })
        print("username: ", username, "password: ", pwd_context.hash(fake.password()))
    
    cursor = conn.cursor()
    insert_query = """
        INSERT INTO users (username, password_hash, full_name, is_super_admin)
        VALUES %s
        ON CONFLICT (username) DO NOTHING
        RETURNING username
    """
    user_data = [(u["username"], u["password_hash"], u["full_name"], u["is_super_admin"]) for u in users]
    
    try:
        execute_values(cursor, insert_query, user_data)
        conn.commit()
        print(f"Successfully inserted {cursor.rowcount} users")
    except Exception as e:
        conn.rollback()
        print(f"Error inserting users: {e}")
    
    # Fetch all usernames for reference in other tables
    cursor.execute("SELECT username FROM users")
    usernames = [row[0] for row in cursor.fetchall()]
    
    return usernames

def generate_tenants(conn, usernames: List[str], count: int = 5) -> List[str]:
    """Generate random tenants"""
    tenants = []
    tenant_types = ["credit_card", "loan", "savings", "mortgage", "insurance", "investment"]
    
    for i in range(min(count, len(tenant_types))):
        tenants.append({
            "name": tenant_types[i],
            "description": f"Tenant for {tenant_types[i]} products",
            "created_by_username": random.choice(usernames)
        })
    
    cursor = conn.cursor()
    
    # Check if tenants table exists and has expected structure
    try:
        cursor.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'tenants'")
        columns = [row[0] for row in cursor.fetchall()]
        print(f"Existing columns in tenants table: {columns}")
    except Exception as e:
        print(f"Error checking tenants table structure: {e}")
    
    insert_query = """
        INSERT INTO tenants (name, description, created_by_username)
        VALUES %s
        ON CONFLICT (name) DO NOTHING
        RETURNING name
    """
    tenant_data = [(t["name"], t["description"], t["created_by_username"]) for t in tenants]
    
    try:
        print(f"Attempting to insert tenants: {tenant_data}")
        execute_values(cursor, insert_query, tenant_data, fetch=True)
        tenant_names = [row[0] for row in cursor.fetchall()]
        conn.commit()
        print(f"Successfully inserted {len(tenant_names)} tenants")
    except Exception as e:
        conn.rollback()
        print(f"Error inserting tenants: {e}")
        
        # Try to check if tenants table exists
        try:
            cursor.execute("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tenants')")
            table_exists = cursor.fetchone()[0]
            if not table_exists:
                print("Tenants table does not exist! Creating it...")
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS tenants (
                        name TEXT PRIMARY KEY,
                        description TEXT,
                        created_by_username TEXT REFERENCES users(username),
                        created_at TIMESTAMP DEFAULT NOW()
                    )
                """)
                conn.commit()
                # Try insert again
                execute_values(cursor, insert_query, tenant_data, fetch=True)
                tenant_names = [row[0] for row in cursor.fetchall()]
                conn.commit()
                print(f"Successfully inserted {len(tenant_names)} tenants after creating table")
        except Exception as e2:
            conn.rollback()
            print(f"Failed to fix tenants table: {e2}")
    
    # Fetch all tenant names for reference in other tables
    cursor.execute("SELECT name FROM tenants")
    tenant_names = [row[0] for row in cursor.fetchall()]
    print(f"Retrieved tenant names: {tenant_names}")
    
    return tenant_names

def generate_user_tenant_roles(conn, usernames: List[str], tenant_names: List[str], count: int = 20):
    """Generate random user tenant roles"""
    user_tenant_roles = []
    
    # Ensure each user has at least one role
    for username in usernames:
        tenant_name = random.choice(tenant_names)
        role = random.choice(USER_ROLES)
        user_tenant_roles.append({
            "username": username,
            "tenant_name": tenant_name,
            "role": role
        })
    
    # Add more random roles up to count
    for _ in range(count - len(usernames)):
        user_tenant_roles.append({
            "username": random.choice(usernames),
            "tenant_name": random.choice(tenant_names),
            "role": random.choice(USER_ROLES)
        })
    
    cursor = conn.cursor()
    insert_query = """
        INSERT INTO user_tenant_roles (username, tenant_name, role)
        VALUES %s
        ON CONFLICT (username, tenant_name, role) DO NOTHING
    """
    role_data = [(r["username"], r["tenant_name"], r["role"]) for r in user_tenant_roles]
    
    try:
        execute_values(cursor, insert_query, role_data)
        conn.commit()
        print(f"Successfully inserted {cursor.rowcount} user tenant roles")
    except Exception as e:
        conn.rollback()
        print(f"Error inserting user tenant roles: {e}")

def generate_offers(conn, usernames: List[str], tenant_names: List[str], count: int = 30) -> List[int]:
    """Generate random offers"""
    if not tenant_names:
        print("No tenants available. Cannot generate offers.")
        return []
        
    offers = []
    
    for _ in range(count):
        offer_type = random.choice(OFFER_TYPES)
        status = random.choice(OFFER_STATUSES)
        
        # Generate different data based on offer type
        data = {}
        if offer_type == 'balance_transfer':
            data = {
                "interest_rate": round(random.uniform(0, 15), 2),
                "processing_fee": round(random.uniform(0, 5), 2),
                "min_amount": random.randint(5000, 50000),
                "max_amount": random.randint(50001, 1000000),
                "tenure_months": random.choice([3, 6, 9, 12, 18, 24])
            }
        elif offer_type == 'cashback':
            data = {
                "percentage": round(random.uniform(1, 10), 2),
                "max_amount": random.randint(500, 10000),
                "min_spend": random.randint(1000, 5000),
                "categories": random.sample(["travel", "dining", "shopping", "groceries", "entertainment"], 
                                          k=random.randint(1, 3))
            }
        else:
            # Generic data for other offer types
            data = {
                "value": random.randint(100, 10000),
                "validity_days": random.randint(30, 365),
                "terms_conditions": fake.paragraph()
            }
        
        offers.append({
            "tenant_name": random.choice(tenant_names),
            "created_by_username": random.choice(usernames),
            "offer_description": fake.sentence(),
            "offer_type": offer_type,
            "status": status,
            "comments": fake.text() if random.random() > 0.5 else None,
            "data": json.dumps(data)
        })
    
    cursor = conn.cursor()
    
    # Check if the offers table exists and has the expected structure
    try:
        cursor.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'offers'")
        columns = [row[0] for row in cursor.fetchall()]
        print(f"Existing columns in offers table: {columns}")
        
        # Make sure offer_description column exists
        if 'offer_description' not in columns:
            print("Adding missing offer_description column")
            cursor.execute("ALTER TABLE offers ADD COLUMN offer_description TEXT")
            conn.commit()
    except Exception as e:
        conn.rollback()
        print(f"Error checking offers table structure: {e}")
    
    # Fixed SQL query to remove the duplicate offer_description column
    insert_query = """
        INSERT INTO offers (
            tenant_name, created_by_username, offer_description, 
            offer_type, status, comments, data
        )
        VALUES %s
        RETURNING id
    """
    offer_data = [
        (o["tenant_name"], o["created_by_username"], o["offer_description"],
         o["offer_type"], o["status"], o["comments"], o["data"])
        for o in offers
    ]
    
    print(f"Attempting to insert {len(offer_data)} offers")
    print(f"Sample offer data: {offer_data[0] if offer_data else 'No offers'}")
    
    offer_ids = []
    try:
        execute_values(cursor, insert_query, offer_data, fetch=True)
        offer_ids = [row[0] for row in cursor.fetchall()]
        conn.commit()
        print(f"Successfully inserted {len(offer_ids)} offers")
    except Exception as e:
        conn.rollback()
        print(f"Error inserting offers: {e}")
        # If we get an error, try to fix the schema issue
        try:
            print("Attempting to fix schema issue with offers table...")
            cursor.execute("ALTER TABLE offers DROP COLUMN IF EXISTS offer_description CASCADE;")
            cursor.execute("ALTER TABLE offers ADD COLUMN IF NOT EXISTS offer_description TEXT;")
            conn.commit()
            print("Schema fixed. Retrying offer insertion...")
            
            # Try inserting again
            execute_values(cursor, insert_query, offer_data, fetch=True)
            offer_ids = [row[0] for row in cursor.fetchall()]
            conn.commit()
            print(f"Successfully inserted {len(offer_ids)} offers after schema fix")
        except Exception as e2:
            conn.rollback()
            print(f"Failed to fix schema and insert offers: {e2}")
    
    # If no offers were inserted, try to get existing ones
    if not offer_ids:
        try:
            cursor.execute("SELECT id FROM offers LIMIT %s", (count,))
            offer_ids = [row[0] for row in cursor.fetchall()]
            print(f"Retrieved {len(offer_ids)} existing offer IDs")
        except Exception as e:
            print(f"Error retrieving existing offers: {e}")
    
    return offer_ids

def generate_offer_audit_logs(conn, offer_ids: List[int], usernames: List[str], count: int = 50):
    """Generate random offer audit logs"""
    if not offer_ids:
        print("No offers to create audit logs for. Skipping audit log generation.")
        return
        
    audit_logs = []
    
    for _ in range(count):
        offer_id = random.choice(offer_ids)
        action = random.choice(AUDIT_ACTIONS)
        
        old_data = None
        new_data = None
        
        if action == 'create':
            new_data = json.dumps({"status": "draft"})
        elif action == 'update':
            old_data = json.dumps({"description": fake.sentence()})
            new_data = json.dumps({"description": fake.sentence()})
        elif action == 'status_change':
            old_status = random.choice(OFFER_STATUSES)
            new_status = random.choice([s for s in OFFER_STATUSES if s != old_status])
            old_data = json.dumps({"status": old_status})
            new_data = json.dumps({"status": new_status})
        elif action == 'comment':
            new_data = json.dumps({"comment": fake.paragraph()})
        
        audit_logs.append({
            "offer_id": offer_id,
            "action": action,
            "performed_by_username": random.choice(usernames),
            "old_data": old_data,
            "new_data": new_data,
            "comment": fake.text() if random.random() > 0.7 else None
        })
    
    cursor = conn.cursor()
    insert_query = """
        INSERT INTO offer_audit_logs (offer_id, action, performed_by_username, 
                                    old_data, new_data, comment)
        VALUES %s
    """
    log_data = [
        (l["offer_id"], l["action"], l["performed_by_username"],
         l["old_data"], l["new_data"], l["comment"])
        for l in audit_logs
    ]
    
    try:
        execute_values(cursor, insert_query, log_data)
        conn.commit()
        print(f"Successfully inserted {cursor.rowcount} offer audit logs")
    except Exception as e:
        conn.rollback()
        print(f"Error inserting offer audit logs: {e}")

def generate_customers(conn, count: int = 100) -> List[str]:
    """Generate random customers"""
    customers = []
    
    for _ in range(count):
        dob = fake.date_of_birth(minimum_age=18, maximum_age=80)
        account_opened_date = fake.date_between(start_date="-10y", end_date="today")
        credit_limit = random.randint(50000, 1000000)
        current_balance = random.randint(0, int(credit_limit * 0.9))
        
        customers.append({
            "full_name": fake.name(),
            "email": fake.email(),
            "mobile": fake.phone_number(),
            "dob": dob,
            "gender": random.choice(GENDERS),
            "kyc_status": random.choice(KYC_STATUSES),
            "segment": random.choice(SEGMENTS),
            "occupation": random.choice(OCCUPATIONS),
            "annual_income": random.randint(300000, 5000000),
            "credit_score": random.randint(300, 900),
            "address": fake.address(),
            "state": random.choice(STATES),
            "city": fake.city(),
            "pin_code": fake.zipcode(),
            "marital_status": random.choice(MARITAL_STATUSES),
            "account_age_months": random.randint(1, 120),
            "coomunication_preference": random.choice(["email", "sms", "both", "none"]),
            "deceased_marker": None if random.random() > 0.02 else "Y",
            "sanctions_marker": None if random.random() > 0.01 else "Y",
            "preferred_language": random.choice(LANGUAGES),
            "is_active": random.random() > 0.1,
            "account_id": ''.join(random.choices(string.ascii_uppercase + string.digits, k=10)),
            "account_status": random.choice(["active", "inactive", "blocked"]),
            "account_openend_date": account_opened_date.strftime("%Y-%m-%d"),
            "credit_limit": credit_limit,
            "account_current_balance": current_balance,
            "available_credit": credit_limit - current_balance,
            "delinquency": random.random() < 0.05
        })
    
    cursor = conn.cursor()
    
    # Check if customers table exists and has expected structure
    try:
        cursor.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'customers'")
        columns = [row[0] for row in cursor.fetchall()]
        print(f"Existing columns in customers table: {columns}")
    except Exception as e:
        print(f"Error checking customers table structure: {e}")
    
    # Check if the sanctions_marker column has the correct data type
    try:
        cursor.execute("SELECT data_type FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'sanctions_marker'")
        data_type = cursor.fetchone()
        if data_type and data_type[0] == 'tinytext':
            # Fix the data type if it's tinytext (not supported in PostgreSQL)
            cursor.execute("ALTER TABLE customers ALTER COLUMN sanctions_marker TYPE TEXT")
            conn.commit()
            print("Fixed sanctions_marker column type from TINYTEXT to TEXT")
    except Exception as e:
        conn.rollback()
        print(f"Error checking/fixing sanctions_marker column: {e}")
    
    insert_query = """
        INSERT INTO customers (
            full_name, email, mobile, dob, gender, kyc_status, segment, occupation,
            annual_income, credit_score, address, state, city, pin_code, marital_status,
            account_age_months, coomunication_preference, deceased_marker, sanctions_marker,
            preferred_language, is_active, account_id, account_status, account_openend_date,
            credit_limit, account_current_balance, available_credit, delinquency
        )
        VALUES %s
        ON CONFLICT (email) DO NOTHING
        RETURNING id
    """
    customer_data = [
        (
            c["full_name"], c["email"], c["mobile"], c["dob"], c["gender"], c["kyc_status"],
            c["segment"], c["occupation"], c["annual_income"], c["credit_score"], c["address"],
            c["state"], c["city"], c["pin_code"], c["marital_status"], c["account_age_months"],
            c["coomunication_preference"], c["deceased_marker"], c["sanctions_marker"],
            c["preferred_language"], c["is_active"], c["account_id"], c["account_status"],
            c["account_openend_date"], c["credit_limit"], c["account_current_balance"],
            c["available_credit"], c["delinquency"]
        )
        for c in customers
    ]
    
    print(f"Attempting to insert {len(customer_data)} customers")
    
    customer_ids = []
    try:
        execute_values(cursor, insert_query, customer_data, fetch=True)
        customer_ids = [row[0] for row in cursor.fetchall()]
        conn.commit()
        print(f"Successfully inserted {len(customer_ids)} customers")
    except Exception as e:
        conn.rollback()
        print(f"Error inserting customers: {e}")
        
        # Try to check if customers table exists
        try:
            cursor.execute("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'customers')")
            table_exists = cursor.fetchone()[0]
            if not table_exists:
                print("Customers table does not exist! Creating it...")
                # Create the customers table based on the schema in init.sql
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS customers (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        full_name TEXT NOT NULL,
                        email TEXT UNIQUE,
                        mobile TEXT UNIQUE,
                        dob DATE,
                        gender TEXT CHECK (gender IN ('male', 'female', 'other')),
                        kyc_status TEXT CHECK (kyc_status IN ('verified', 'pending', 'rejected')),
                        segment TEXT,
                        occupation TEXT,
                        annual_income NUMERIC,
                        credit_score INT,
                        address TEXT,
                        state TEXT,
                        city TEXT,
                        pin_code TEXT,
                        marital_status TEXT CHECK (marital_status IN ('single', 'married', 'divorced', 'widowed')),
                        account_age_months INT,
                        coomunication_preference TEXT,
                        deceased_marker TEXT,
                        sanctions_marker TEXT,
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
                    )
                """)
                conn.commit()
                print("Created customers table")
                
                # Try inserting again
                execute_values(cursor, insert_query, customer_data, fetch=True)
                customer_ids = [row[0] for row in cursor.fetchall()]
                conn.commit()
                print(f"Successfully inserted {len(customer_ids)} customers after creating table")
        except Exception as e2:
            conn.rollback()
            print(f"Failed to fix customers table: {e2}")
    
    # Fetch all customer IDs if we didn't get enough from the insert
    if len(customer_ids) < count / 2:
        try:
            cursor.execute("SELECT id FROM customers LIMIT %s", (count,))
            customer_ids = [str(row[0]) for row in cursor.fetchall()]
            print(f"Retrieved {len(customer_ids)} existing customer IDs")
        except Exception as e:
            print(f"Error retrieving existing customers: {e}")
    
    return customer_ids

def generate_campaigns(conn, tenant_names: List[str], offer_ids: List[int], 
                      usernames: List[str], count: int = 15) -> List[int]:
    """Generate random campaigns"""
    if not offer_ids:
        print("No offers to create campaigns for. Skipping campaign generation.")
        return []
        
    campaigns = []
    
    for _ in range(count):
        start_date = fake.date_between(start_date="-30d", end_date="+30d")
        end_date = fake.date_between(start_date=start_date, end_date=start_date + datetime.timedelta(days=90))
        
        # Generate selection criteria
        criteria = {
            "min_credit_score": random.randint(600, 850),
            "min_income": random.randint(300000, 1000000),
            "segments": random.sample(SEGMENTS, k=random.randint(1, len(SEGMENTS))),
            "is_active": True
        }
        
        if random.random() > 0.5:
            criteria["states"] = random.sample(STATES, k=random.randint(1, len(STATES)))
        
        campaigns.append({
            "tenant_name": random.choice(tenant_names),
            "offer_id": random.choice(offer_ids),
            "name": fake.catch_phrase(),
            "description": fake.paragraph(),
            "selection_criteria": json.dumps(criteria),
            "start_date": start_date,
            "end_date": end_date,
            "created_by_username": random.choice(usernames),
            "status": random.choice(CAMPAIGN_STATUSES)
        })
    
    cursor = conn.cursor()
    
    # Check if campaigns table exists and has expected structure
    try:
        cursor.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'campaigns'")
        columns = [row[0] for row in cursor.fetchall()]
        print(f"Existing columns in campaigns table: {columns}")
    except Exception as e:
        print(f"Error checking campaigns table structure: {e}")
    
    insert_query = """
        INSERT INTO campaigns (
            tenant_name, offer_id, name, description, selection_criteria,
            start_date, end_date, created_by_username, status
        )
        VALUES %s
        RETURNING id
    """
    campaign_data = [
        (
            c["tenant_name"], c["offer_id"], c["name"], c["description"],
            c["selection_criteria"], c["start_date"], c["end_date"],
            c["created_by_username"], c["status"]
        )
        for c in campaigns
    ]
    
    print(f"Attempting to insert {len(campaign_data)} campaigns")
    if campaign_data:
        print(f"Sample campaign data: {campaign_data[0]}")
    
    campaign_ids = []
    try:
        execute_values(cursor, insert_query, campaign_data, fetch=True)
        campaign_ids = [row[0] for row in cursor.fetchall()]
        conn.commit()
        print(f"Successfully inserted {len(campaign_ids)} campaigns")
    except Exception as e:
        conn.rollback()
        print(f"Error inserting campaigns: {e}")
        
        # Try to check if campaigns table exists
        try:
            cursor.execute("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'campaigns')")
            table_exists = cursor.fetchone()[0]
            if not table_exists:
                print("Campaigns table does not exist! Creating it...")
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS campaigns (
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
                    )
                """)
                conn.commit()
                print("Created campaigns table")
                
                # Try inserting again
                execute_values(cursor, insert_query, campaign_data, fetch=True)
                campaign_ids = [row[0] for row in cursor.fetchall()]
                conn.commit()
                print(f"Successfully inserted {len(campaign_ids)} campaigns after creating table")
        except Exception as e2:
            conn.rollback()
            print(f"Failed to fix campaigns table: {e2}")
    
    # If no campaigns were inserted, try to get existing ones
    if not campaign_ids:
        try:
            cursor.execute("SELECT id FROM campaigns LIMIT %s", (count,))
            campaign_ids = [row[0] for row in cursor.fetchall()]
            print(f"Retrieved {len(campaign_ids)} existing campaign IDs")
        except Exception as e:
            print(f"Error retrieving existing campaigns: {e}")
    
    return campaign_ids

def generate_campaign_customers(conn, campaign_ids: List[int], customer_ids: List[str], 
                               offer_ids: List[int], count: int = 200):
    """Generate random campaign customers"""
    if not campaign_ids:
        print("No campaigns available. Cannot generate campaign customers.")
        return
        
    if not customer_ids:
        print("No customers available. Cannot generate campaign customers.")
        return
        
    if not offer_ids:
        print("No offers available. Cannot generate campaign customers.")
        return
        
    campaign_customers = []
    
    # Create a set to track unique campaign-customer pairs
    unique_pairs = set()
    
    for _ in range(count):
        campaign_id = random.choice(campaign_ids)
        customer_id = random.choice(customer_ids)
        
        # Ensure we don't have duplicate campaign-customer pairs
        pair = (campaign_id, customer_id)
        if pair in unique_pairs:
            continue
        
        unique_pairs.add(pair)
        
        # Get a valid offer ID for the campaign
        cursor = conn.cursor()
        try:
            cursor.execute("SELECT offer_id FROM campaigns WHERE id = %s", (campaign_id,))
            result = cursor.fetchone()
            offer_id = result[0] if result else random.choice(offer_ids)
        except Exception as e:
            print(f"Error getting offer_id for campaign {campaign_id}: {e}")
            offer_id = random.choice(offer_ids)
        
        delivery_status = random.choice(DELIVERY_STATUSES)
        sent_at = fake.date_time_between(start_date="-30d", end_date="now") if delivery_status != 'pending' else None
        
        campaign_customers.append({
            "campaign_id": campaign_id,
            "customer_id": customer_id,
            "offer_id": offer_id,
            "delivery_status": delivery_status,
            "sent_at": sent_at
        })
    
    cursor = conn.cursor()
    
    # Check if campaign_customers table exists and has expected structure
    try:
        cursor.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'campaign_customers'")
        columns = [row[0] for row in cursor.fetchall()]
        print(f"Existing columns in campaign_customers table: {columns}")
    except Exception as e:
        print(f"Error checking campaign_customers table structure: {e}")
    
    insert_query = """
        INSERT INTO campaign_customers (
            campaign_id, customer_id, offer_id, delivery_status, sent_at
        )
        VALUES %s
        ON CONFLICT (campaign_id, customer_id) DO NOTHING
    """
    cc_data = [
        (
            cc["campaign_id"], cc["customer_id"], cc["offer_id"],
            cc["delivery_status"], cc["sent_at"]
        )
        for cc in campaign_customers
    ]
    
    print(f"Attempting to insert {len(cc_data)} campaign customers")
    if cc_data:
        print(f"Sample campaign customer data: {cc_data[0]}")
    
    try:
        execute_values(cursor, insert_query, cc_data)
        conn.commit()
        print(f"Successfully inserted {cursor.rowcount} campaign customers")
    except Exception as e:
        conn.rollback()
        print(f"Error inserting campaign customers: {e}")
        
        # Try to check if campaign_customers table exists
        try:
            cursor.execute("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'campaign_customers')")
            table_exists = cursor.fetchone()[0]
            if not table_exists:
                print("Campaign_customers table does not exist! Creating it...")
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS campaign_customers (
                        campaign_id INT REFERENCES campaigns(id) ON DELETE CASCADE,
                        customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
                        offer_id INT REFERENCES offers(id) ON DELETE CASCADE NOT NULL,
                        delivery_status TEXT CHECK (delivery_status IN ('pending', 'sent', 'declined', 'accepted')) DEFAULT 'pending',
                        sent_at TIMESTAMP,
                        PRIMARY KEY (campaign_id, customer_id)
                    )
                """)
                conn.commit()
                print("Created campaign_customers table")
                
                # Try inserting again
                execute_values(cursor, insert_query, cc_data)
                conn.commit()
                print(f"Successfully inserted {cursor.rowcount} campaign customers after creating table")
        except Exception as e2:
            conn.rollback()
            print(f"Failed to fix campaign_customers table: {e2}")
            
    # Check how many campaign customers exist
    try:
        cursor.execute("SELECT COUNT(*) FROM campaign_customers")
        count = cursor.fetchone()[0]
        print(f"Total campaign customers in database: {count}")
    except Exception as e:
        print(f"Error counting campaign customers: {e}")

def main():
    parser = argparse.ArgumentParser(description="Generate random data for OffersHub database")
    parser.add_argument("--users", type=int, default=10, help="Number of users to generate")
    parser.add_argument("--tenants", type=int, default=5, help="Number of tenants to generate")
    parser.add_argument("--roles", type=int, default=20, help="Number of user tenant roles to generate")
    parser.add_argument("--offers", type=int, default=30, help="Number of offers to generate")
    parser.add_argument("--audit-logs", type=int, default=50, help="Number of offer audit logs to generate")
    parser.add_argument("--customers", type=int, default=100, help="Number of customers to generate")
    parser.add_argument("--campaigns", type=int, default=15, help="Number of campaigns to generate")
    parser.add_argument("--campaign-customers", type=int, default=200, help="Number of campaign customers to generate")
    parser.add_argument("--fix-schema", action="store_true", help="Attempt to fix schema issues before generating data")
    
    args = parser.parse_args()
    
    conn = connect_to_db()
    
    # Fix schema issues if requested
    if args.fix_schema:
        cursor = conn.cursor()
        try:
            print("Attempting to fix schema issues...")
            # Fix duplicate offer_description column
            cursor.execute("""
                DO $$
                BEGIN
                    BEGIN
                        ALTER TABLE offers DROP COLUMN offer_description;
                        ALTER TABLE offers ADD COLUMN offer_description TEXT;
                    EXCEPTION WHEN OTHERS THEN
                        RAISE NOTICE 'Error fixing offer_description column: %', SQLERRM;
                    END;
                    
                    BEGIN
                        ALTER TABLE customers ALTER COLUMN sanctions_marker TYPE TEXT;
                    EXCEPTION WHEN OTHERS THEN
                        RAISE NOTICE 'Error fixing sanctions_marker column: %', SQLERRM;
                    END;
                END $$;
            """)
            conn.commit()
            print("Schema fixes attempted.")
        except Exception as e:
            conn.rollback()
            print(f"Error fixing schema: {e}")
    
    print("Starting data generation...")
    
    # Generate data in order to respect foreign key constraints
    usernames = generate_users(conn, args.users)
    tenant_names = generate_tenants(conn, usernames, args.tenants)
    generate_user_tenant_roles(conn, usernames, tenant_names, args.roles)
    offer_ids = generate_offers(conn, usernames, tenant_names, args.offers)
    generate_offer_audit_logs(conn, offer_ids, usernames, args.audit_logs)
    customer_ids = generate_customers(conn, args.customers)
    campaign_ids = generate_campaigns(conn, tenant_names, offer_ids, usernames, args.campaigns)
    generate_campaign_customers(conn, campaign_ids, customer_ids, offer_ids, args.campaign_customers)
    
    conn.close()
    print("Data generation completed successfully!")

if __name__ == "__main__":
    main() 
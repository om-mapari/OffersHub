#!/usr/bin/env python3
"""
Check data in OffersHub database
This script checks the number of records in each table in the OffersHub database.
"""

import psycopg2

# Database connection parameters - modify as needed
DB_PARAMS = {
    "dbname": "offer_management",
    "user": "postgres",
    "password": "postgres",
    "host": "localhost",
    "port": "5432"
}

def main():
    try:
        conn = psycopg2.connect(**DB_PARAMS)
        cursor = conn.cursor()
        
        tables = [
            'users', 
            'tenants', 
            'user_tenant_roles', 
            'offers', 
            'offer_audit_logs', 
            'customers', 
            'campaigns', 
            'campaign_customers'
        ]
        
        print("Table counts:")
        for table in tables:
            try:
                cursor.execute(f"SELECT COUNT(*) FROM {table}")
                count = cursor.fetchone()[0]
                print(f"{table}: {count}")
            except Exception as e:
                print(f"Error counting {table}: {e}")
        
        conn.close()
        
    except Exception as e:
        print(f"Error connecting to database: {e}")

if __name__ == "__main__":
    main() 
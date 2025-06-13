import psycopg2
import os
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from app import crud, models
from app.models.campaign import CampaignStatus
from app.models.campaign_customer import DeliveryStatus
from urllib.parse import urlparse

class CampaignProcessingService:
    @staticmethod
    def process_approved_campaign(db: Session, campaign_id: int) -> List[str]:
        """
        Process a campaign that has just been approved.
        1. Get the campaign and its selection criteria
        2. Build and execute SQL query to find matching customers
        3. Add customers to campaign_customers table
        
        Returns a list of customer IDs that were matched and added to the campaign
        """
        print(f"Processing approved campaign with ID: {campaign_id}")
        
        # Get campaign from database
        campaign = crud.campaign.get(db, id=campaign_id)
        if not campaign or not campaign.selection_criteria:
            print(f"Campaign not found or has no selection criteria: {campaign_id}")
            return []
        
        # Extract and format selection criteria
        formatted_criteria = CampaignProcessingService._format_selection_criteria(campaign.selection_criteria)
        
        # Generate and execute SQL query
        query = CampaignProcessingService._generate_select_query(where_criteria=formatted_criteria)
        print(f"Generated SQL query: {query}")
        
        # Execute query and get customer IDs
        customer_ids = CampaignProcessingService._execute_sql_query(query)
        print(f"Found {len(customer_ids)} matching customers")
        
        # Add customers to campaign_customers table
        CampaignProcessingService._add_customers_to_campaign(
            db=db,
            customer_ids=customer_ids,
            campaign_id=campaign.id,
            offer_id=campaign.offer_id,
            tenant_name=campaign.tenant_name
        )
        
        return customer_ids
    
    @staticmethod
    def _format_selection_criteria(selection_criteria: Dict[str, Any]) -> List[str]:
        """
        Format the selection criteria from the JSON format to a list of SQL-compatible conditions
        Example input: {"kyc_status": "=pending", "gender": "!female", "credit_score": "<388"}
        """
        formatted_criteria = []
        
        for key, value in selection_criteria.items():
            print(f"Processing criteria: {key}={value}")
            
            # Handle equals with multiple values (IN clause)
            if value.startswith('='):
                value_without_prefix = value[1:]
                
                # Check if it's a comma-separated list
                if ',' in value_without_prefix:
                    values_list = value_without_prefix.split(",")
                    quoted_values = [f"'{s.strip()}'" for s in values_list]
                    joined_values = ','.join(quoted_values)
                    formatted_criteria.append(f"{key} IN({joined_values})")
                else:
                    # Handle boolean values
                    if value_without_prefix.lower() in ('true', 'false'):
                        formatted_criteria.append(f"{key} = {value_without_prefix.lower()}")
                    else:
                        # Handle single string value
                        formatted_criteria.append(f"{key} = '{value_without_prefix}'")
            
            # Handle not equals
            elif value.startswith('!'):
                value_without_prefix = value[1:]
                if value_without_prefix.lower() in ('true', 'false'):
                    formatted_criteria.append(f"{key} != {value_without_prefix.lower()}")
                else:
                    formatted_criteria.append(f"{key} != '{value_without_prefix}'")
            
            # Handle greater than or less than
            elif value.startswith('>') or value.startswith('<'):
                operator = value[0]
                value_without_prefix = value[1:]
                
                # Check if it's a numeric value (don't quote)
                if value_without_prefix.strip().isdigit() or (
                    value_without_prefix.strip().replace('.', '', 1).isdigit() and value_without_prefix.count('.') <= 1
                ):
                    formatted_criteria.append(f"{key} {operator} {value_without_prefix}")
                else:
                    formatted_criteria.append(f"{key} {operator} '{value_without_prefix}'")
            
            # Handle other cases
            else:
                formatted_criteria.append(f"{key} = '{value}'")
        
        return formatted_criteria
    
    @staticmethod
    def _generate_select_query(
        schema: str = 'public',
        table_name: str = 'customers',
        columns: List[str] = ['id'],
        where_criteria: Optional[List[str]] = None
    ) -> str:
        """
        Generate a SQL SELECT query based on the provided criteria
        """
        # Create the SELECT part of the query
        column_names = ', '.join(columns)
        select_query = f"SELECT {column_names} FROM {schema}.{table_name}"
        
        # Add WHERE clause if criteria are provided
        if where_criteria and len(where_criteria) > 0:
            select_query += " WHERE " + " AND ".join(where_criteria)
        
        return select_query
    
    @staticmethod
    def _execute_sql_query(query: str) -> List[str]:
        """
        Execute the SQL query directly against the database and return results
        """
        # Get database connection parameters from environment variables
        database_url = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@127.0.0.1:5432/offer_management")
        
        # Parse the database URL
        parsed_url = urlparse(database_url)
        
        # Extract connection parameters
        DB_PARAMS = {
            "dbname": parsed_url.path[1:],  # Remove leading slash
            "user": parsed_url.username or "postgres",
            "password": parsed_url.password or "postgres",
            "host": parsed_url.hostname or "127.0.0.1",
            "port": parsed_url.port or "5432"
        }
        
        print(f"Connecting to database: {DB_PARAMS['host']}:{DB_PARAMS['port']}/{DB_PARAMS['dbname']}")
        
        list_of_string_ids = []
        conn = None
        
        try:
            conn = psycopg2.connect(**DB_PARAMS)
            cursor = conn.cursor()
            
            cursor.execute(query)
            
            if query.strip().upper().startswith('SELECT'):
                results = cursor.fetchall()
                for row in results:
                    list_of_string_ids.append(str(row[0]))  # Convert UUID to string
            
            cursor.close()
            conn.close()
            
            return list_of_string_ids
            
        except Exception as e:
            print(f"Database error: {e}")
            if conn:
                conn.close()
            return []
    
    @staticmethod
    def _add_customers_to_campaign(
        db: Session,
        customer_ids: List[str],
        campaign_id: int,
        offer_id: int,
        tenant_name: str
    ) -> None:
        """
        Add all matching customers to the campaign_customers table
        """
        added_count = 0
        
        print(f"Adding customers to campaign {campaign_id} for tenant {tenant_name} and offer {offer_id}")
        
        for customer_id in customer_ids:
            # Check if entry already exists to prevent duplicates
            existing = db.query(models.CampaignCustomer).filter(
                models.CampaignCustomer.campaign_id == campaign_id,
                models.CampaignCustomer.customer_id == customer_id
            ).first()
            
            if not existing:
                campaign_customer = models.CampaignCustomer(
                    campaign_id=campaign_id,
                    customer_id=customer_id,
                    offer_id=offer_id,
                    tenant_name=tenant_name,
                    delivery_status=DeliveryStatus.pending
                )
                
                db.add(campaign_customer)
                added_count += 1
        
        if added_count > 0:
            print(f"Added {added_count} new customers to campaign {campaign_id}")
            db.commit()
        else:
            print(f"No new customers added to campaign {campaign_id}")

# Singleton instance
campaign_service = CampaignProcessingService()

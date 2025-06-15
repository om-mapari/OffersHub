import os
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from app import crud, models
from app.models.campaign import CampaignStatus
from app.models.campaign_customer import DeliveryStatus
from app import email_sender
import logging
from datetime import datetime

class CampaignActivationService:
    @staticmethod
    def process_activated_campaign(db: Session, campaign_id: int) -> List[str]:
        """
        Process a campaign that has just been activated.
        1. Get the campaign and its associated customers
        2. Send emails to all eligible customers
        3. Update the delivery status to 'sent'
        
        Returns a list of customer IDs that were notified
        """
        print(f"Processing activated campaign with ID: {campaign_id}")
        
        # Get campaign from database
        campaign = crud.campaign.get(db, id=campaign_id)
        if not campaign:
            print(f"Campaign not found: {campaign_id}")
            return []
        
        # Get offer details
        offer = db.query(models.Offer).filter(models.Offer.id == campaign.offer_id).first()
        if not offer:
            print(f"Offer not found for campaign: {campaign_id}")
            return []
        # Get all eligible customers for this campaign
        eligible_customers = CampaignActivationService._get_eligible_customers(db, campaign_id)
        print(f"Found {len(eligible_customers)} eligible customers for campaign {campaign_id}")
        
        # Send emails to all eligible customers
        notified_customers = CampaignActivationService._send_campaign_emails(
            db=db,
            campaign=campaign,
            offer=offer,
            eligible_customers=eligible_customers
        )
        
        return notified_customers
    
    @staticmethod
    def _get_eligible_customers(db: Session, campaign_id: int) -> List[Dict[str, Any]]:
        """
        Get all eligible customers for a campaign with their email addresses
        """
        # Join campaign_customers with customers to get email addresses
        eligible_customers_query = (
            db.query(
                models.CampaignCustomer,
                models.Customer.email,
                models.Customer.full_name
            )
            .join(
                models.Customer,
                models.CampaignCustomer.customer_id == models.Customer.id
            )
            .filter(
                models.CampaignCustomer.campaign_id == campaign_id,
                models.CampaignCustomer.delivery_status == DeliveryStatus.pending,
                models.Customer.email.isnot(None)  # Ensure email is not null
            )
        )
        
        results = eligible_customers_query.all()
        print("results :", results)
        
        # Format results as list of dictionaries
        eligible_customers = []
        for campaign_customer, email, full_name in results:
            eligible_customers.append({
                "campaign_customer": campaign_customer,
                "email": email,
                "full_name": full_name
            })
        
        return eligible_customers
    
    @staticmethod
    def _send_campaign_emails(
        db: Session,
        campaign: models.Campaign,
        offer: models.Offer,
        eligible_customers: List[Dict[str, Any]]
    ) -> List[str]:
        """
        Send emails to all eligible customers and update their delivery status
        """
        notified_customer_ids = []
        
        # Get offer details
        offer_data = offer.data
        
        for customer in eligible_customers:
            campaign_customer = customer["campaign_customer"]
            email_address = customer["email"]
            full_name = customer["full_name"]
            print("customer :", customer)
            try:
                # Send email to customer
                print(f"Sending email to {full_name} at {email_address} for campaign {campaign.name}")
                
                # Use the enhanced email_sender module to send the email
                email_sender.send_email(
                    recipient_email=email_address,
                    campaign_name=campaign.name,
                    customer_name=full_name,
                    offer_details=offer_data
                )
                
                # Update delivery status to 'sent'
                campaign_customer.delivery_status = DeliveryStatus.sent
                campaign_customer.sent_at = datetime.now()
                
                # Add to list of notified customers
                notified_customer_ids.append(str(campaign_customer.customer_id))
                
            except Exception as e:
                print(f"Failed to send email to {email_address}: {str(e)}")
        
        # Commit all changes to the database
        if notified_customer_ids:
            db.commit()
            print(f"Successfully sent {len(notified_customer_ids)} emails for campaign {campaign.id}")
        
        return notified_customer_ids

# Singleton instance
campaign_activation_service = CampaignActivationService() 
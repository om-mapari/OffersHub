from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.sql import text
from app.db.session import get_db  # Assuming you have a database.py file for session management

router = APIRouter()

# Endpoint to get the number of active customers
@router.get("/active-customers", response_model=int)
async def get_active_customers(db: Session = Depends(get_db)):
    try:
        # SQL query to count active customers
        query = text("SELECT COUNT(*) FROM customers WHERE is_active = true")
        result = db.execute(query).scalar() 
        if result is None:
            raise HTTPException(status_code=404, detail="No active customers found")
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


# Endpoint to get the Current Offers Definition
@router.get("/offers-metrics", response_model=dict)
async def get_offers_metrics(db: Session = Depends(get_db)):
    try:
        # SQL query to count offers
        query = text("SELECT status, COUNT(*) AS offer_count FROM offers GROUP BY status")
        result = db.execute(query).fetchall() # fetchall() returns a list of tuples
        if result is None:
            raise HTTPException(status_code=404, detail="No offers found")
        offers_summary = {row[0]: row[1] for row in result }
        return offers_summary

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# Endpoint to get the number of campaigns
@router.get("/campaigns-metrics", response_model=dict)
async def get_campaigns_metrics(db: Session = Depends(get_db)):
    try:
        # SQL query to count active campaigns
        query = text("SELECT status, COUNT(*) AS campaigns_count FROM campaigns GROUP BY status")
        result = db.execute(query).fetchall() # fetchall() returns a list of tuples
        if result is None:
            raise HTTPException(status_code=404, detail="No campaigns found")
        campaigns_summary = {row[0]: row[1] for row in result }
        return campaigns_summary
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


# Endpoint to get the Campaign customers: Sent, Accepted, and Percentage of Accepted Campaigns
@router.get("/campaign-customers", response_model=dict)
async def get_campaign_customers(db: Session = Depends(get_db)):
    try:
        # Updated SQL query to group by campaign and join with campaigns table
        query = text(""" 
            SELECT 
                cc.campaign_id,
                c.name,
                COUNT(*) FILTER (WHERE cc.delivery_status = 'sent') AS total_sent,
                COUNT(*) FILTER (WHERE cc.delivery_status = 'accepted') AS total_accepted
            FROM campaign_customers cc
            JOIN campaigns c ON cc.campaign_id = c.id WHERE c.status = 'active'
            GROUP BY cc.campaign_id, c.name
            ORDER BY cc.campaign_id
        """)

        results = db.execute(query).fetchall()

        if not results:
            raise HTTPException(status_code=404, detail="No campaign data found")

        campaigns_summary = []
        for row in results:
            campaign_id = row[0]
            campaign_name = row[1]
            total_sent = row[2]
            total_accepted = row[3]
            total_customers = total_sent + total_accepted

            if total_customers == 0:
                percentage_accepted = 0.0
            else:
                percentage_accepted = (total_accepted / total_customers) * 100

            campaigns_summary.append({
                "campaign_id": campaign_id,
                "campaign_name": campaign_name,
                "sent_campaigns_customers": total_customers,
                "accepted_campaigns": total_accepted,
                "percentage_accepted": percentage_accepted
            })

        return {"campaigns": campaigns_summary}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
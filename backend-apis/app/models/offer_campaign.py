from sqlalchemy import Column, Integer, ForeignKey
from database.base import Base

class OfferCampaign(Base):
    __tablename__ = "offer_campaign"

    offer_id = Column(Integer, ForeignKey("offer.offer_id"), primary_key=True)
    campaign_id = Column(Integer, ForeignKey("campaign.campaign_id"), primary_key=True)

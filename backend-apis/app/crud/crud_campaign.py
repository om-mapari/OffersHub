from app.crud.base import CRUDBase
from app.models.campaign import Campaign
from app.schemas.campaign import CampaignCreate, CampaignUpdate

class CRUDCampaign(CRUDBase[Campaign, CampaignCreate, CampaignUpdate]):
    pass

campaign = CRUDCampaign(Campaign)

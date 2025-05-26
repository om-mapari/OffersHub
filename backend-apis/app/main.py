from fastapi import FastAPI
from views import offer_view, customer_view, campaign_view 

app = FastAPI()

app.include_router(offer_view.router)
app.include_router(customer_view.router)
app.include_router(campaign_view.router)

@app.get("/")
def root():
    return {"message": "Offer API is running"}

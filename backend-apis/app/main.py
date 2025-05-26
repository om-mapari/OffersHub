from fastapi import FastAPI
from views import offer_view, customer_view, campaign_view , target_customers_view, selection_criteria_view, transaction_view, auth_view

app = FastAPI()
app.include_router(selection_criteria_view.router)

app.include_router(offer_view.router)
app.include_router(customer_view.router)
app.include_router(campaign_view.router)
app.include_router(target_customers_view.router)
app.include_router(transaction_view.router)
app.include_router(auth_view.router)

@app.get("/")
def root():
    return {"message": "Offer API is running"}

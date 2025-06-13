#!/bin/bash

# Set variables
TENANT_NAME="test_tenant"
SERVER="http://localhost:8000"

# Get token
echo "Authenticating as coderom..."
TOKEN_RESPONSE=$(curl --location "$SERVER/api/v1/auth/token" \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --header 'Accept: application/json' \
  --data-urlencode 'username=coderom' \
  --data-urlencode 'password=coderom' \
  --data-urlencode 'grant_type=password')

TOKEN=$(echo $TOKEN_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

echo "Got access token"

# 1. First check if tenant exists, if not create it
TENANT_RESPONSE=$(curl --location "$SERVER/api/v1/sa/tenants/$TENANT_NAME" \
  --header "Authorization: Bearer $TOKEN")

if [[ $TENANT_RESPONSE == *"not found"* ]]; then
    echo "Creating tenant $TENANT_NAME..."
    curl --location "$SERVER/api/v1/sa/tenants/" \
      --header "Authorization: Bearer $TOKEN" \
      --header 'Content-Type: application/json' \
      --data "{\"name\": \"$TENANT_NAME\"}"
else
    echo "Tenant $TENANT_NAME already exists"
fi

# 2. Create an offer
echo -e "\nCreating test offer..."
OFFER_RESPONSE=$(curl --location "$SERVER/api/v1/tenants/$TENANT_NAME/offers/" \
  --header "Authorization: Bearer $TOKEN" \
  --header 'Content-Type: application/json' \
  --data '{
    "data": {
        "product_name": "Test Offer for Campaign Approval",
        "interest_rate": 8.5,
        "term_months": 12
    }
}')

OFFER_ID=$(echo $OFFER_RESPONSE | grep -o '"id":[0-9]*' | cut -d':' -f2)
echo "Created offer with ID: $OFFER_ID"

# 3. Create a campaign with the offer
echo -e "\nCreating test campaign..."
CAMPAIGN_RESPONSE=$(curl --location "$SERVER/api/v1/tenants/$TENANT_NAME/campaigns/" \
  --header "Authorization: Bearer $TOKEN" \
  --header 'Content-Type: application/json' \
  --data "{
    \"name\": \"Test Campaign for Approval\",
    \"offer_id\": $OFFER_ID,
    \"description\": \"Testing campaign approval flow\",
    \"selection_criteria\": {
        \"kyc_status\": \"=pending\", 
        \"occupation\": \"=self-employed\", 
        \"gender\": \"!female\",
        \"delinquency\": \"=false\",
        \"segment\": \"!premium\",
        \"credit_score\": \"<388\",
        \"is_active\": \"=true\"
    },
    \"start_date\": \"2023-07-01\",
    \"end_date\": \"2023-12-31\"
}")

CAMPAIGN_ID=$(echo $CAMPAIGN_RESPONSE | grep -o '"id":[0-9]*' | cut -d':' -f2)
echo "Created campaign with ID: $CAMPAIGN_ID"

# 4. Update campaign status to approved
echo -e "\nApproving campaign..."
APPROVAL_RESPONSE=$(curl --location --request PATCH "$SERVER/api/v1/tenants/$TENANT_NAME/campaigns/$CAMPAIGN_ID" \
  --header "Authorization: Bearer $TOKEN" \
  --header 'Content-Type: application/json' \
  --data '{
    "status": "approved"
}')

echo -e "\nCampaign approval response:"
echo $APPROVAL_RESPONSE | python -m json.tool

echo -e "\nTest complete!" 
# OffersHub Dashboard Documentation

## Overview

The OffersHub dashboard provides real-time metrics and visualizations for tenant-specific data. It allows users to monitor offers, campaigns, customer segments, and delivery statuses for their specific tenant.

## Dashboard Components

### 1. Metrics Cards

The top section displays key performance indicators:
- **Active Offers**: Number of currently approved offers
- **Active Campaigns**: Number of currently running campaigns
- **Campaign Acceptance**: Percentage of customers who accepted campaign offers
- **Total Customers**: Number of customers involved in campaigns

### 2. Offers Overview

A bar chart visualization showing the distribution of offers by status:
- Draft
- Pending Review
- Approved
- Rejected
- Retired

### 3. Campaign Performance

Displays the top-performing campaigns by acceptance rate, including:
- Campaign name
- Number of customers who received the offer
- Number of customers who accepted the offer
- Acceptance rate percentage

### 4. Campaign Status Distribution

A pie chart showing the distribution of campaigns by status:
- Draft
- Approved
- Active
- Paused
- Completed

### 5. Customer Segments

A pie chart displaying the distribution of customers by segment:
- Premium
- Regular
- Corporate
- Unknown

### 6. Delivery Status

A horizontal bar chart showing the number of customers in each delivery status:
- Pending
- Sent
- Declined
- Accepted

## Technical Implementation

The dashboard is tenant-aware, meaning all data is filtered based on the currently selected tenant. The implementation includes:

1. **API Integration**: All components connect to tenant-specific API endpoints
2. **Authentication**: Requests include the current user's authentication token
3. **Error Handling**: Components display appropriate error states when data cannot be fetched
4. **Loading States**: Components show loading indicators while data is being fetched
5. **Responsive Design**: The dashboard is fully responsive and works on various screen sizes

## Data Flow

1. The tenant context is accessed using the `useTenant` hook
2. The authentication token is retrieved using the `useAuth` hook
3. API requests include the tenant name and authentication token
4. Data is processed and formatted for visualization
5. Components update automatically when the tenant selection changes

## Backend API Endpoints

The dashboard consumes the following API endpoints:

- `/metrics/delivery-status`: Statistics on offer delivery status
- `/metrics/offers-metrics`: Distribution of offers by status
- `/metrics/campaigns-metrics`: Distribution of campaigns by status
- `/metrics/campaign-customers`: Campaign performance metrics
- `/metrics/customer-segments`: Customer distribution by segment

Each endpoint is secured and requires proper authentication and tenant context to access. 



# Azure OpenAI Integration for OffersHub

This document provides instructions for setting up Azure OpenAI integration for the AI Fill feature in OffersHub.

## Environment Variables Setup

Create or modify your `.env` file in the `frontend-app` directory with the following Azure OpenAI configuration:

```env
# Azure OpenAI Configuration
VITE_AZURE_ENDPOINT=your-azure-endpoint
VITE_AZURE_API_KEY=your-azure-api-key
VITE_AZURE_API_VERSION=2023-05-15
VITE_AZURE_DEPLOYMENT=your-azure-deployment-name
```

Replace the placeholder values with your actual Azure OpenAI credentials:

- `VITE_AZURE_ENDPOINT`: Your Azure OpenAI service endpoint URL
- `VITE_AZURE_API_KEY`: Your Azure OpenAI API key
- `VITE_AZURE_API_VERSION`: The API version to use (e.g., 2023-05-15)
- `VITE_AZURE_DEPLOYMENT`: Your Azure OpenAI model deployment name

## How It Works

The AI Fill feature uses Azure OpenAI to automatically generate offer data based on the selected offer type. When a user clicks the "AI Fill" button:

1. The application sends the tenant name, offer type, and default attributes to Azure OpenAI
2. Azure OpenAI generates relevant and realistic values for the offer attributes
3. The generated values are used to populate the form fields

## Troubleshooting

If you encounter errors with the AI Fill feature:

1. Check your browser console for error messages
2. Verify that your Azure OpenAI credentials are correctly configured
3. Ensure your Azure OpenAI model has the necessary permissions and rate limits
4. Check that your Azure OpenAI deployment is running and accessible 

# AI Fill Feature for OffersHub

This document explains how to set up and use the AI Fill feature in OffersHub, which automatically generates offer and campaign data using Azure OpenAI.

## Setup Instructions

### 1. Environment Variables

Create or modify the `.env` file in the `frontend-app` directory with the following Azure OpenAI configuration:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8000/api/v1

# Azure OpenAI Configuration
VITE_AZURE_ENDPOINT=your-azure-endpoint
VITE_AZURE_API_KEY=your-azure-api-key
VITE_AZURE_API_VERSION=2023-05-15
VITE_AZURE_DEPLOYMENT=your-azure-deployment-name
```

Replace the placeholder values with your actual Azure OpenAI credentials:

- `VITE_AZURE_ENDPOINT`: Your Azure OpenAI service endpoint URL (e.g., https://your-resource-name.openai.azure.com/)
- `VITE_AZURE_API_KEY`: Your Azure OpenAI API key
- `VITE_AZURE_API_VERSION`: The API version to use (e.g., 2023-05-15)
- `VITE_AZURE_DEPLOYMENT`: Your Azure OpenAI model deployment name (e.g., gpt-4o-3)

### 2. Restart the Development Server

After updating the environment variables, restart the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

## Using the AI Fill Feature

### For Offers

1. Navigate to the Offers page in OffersHub
2. Click on "Create Offer" or edit an existing offer
3. Select an offer type from the dropdown menu
4. Click the "AI Fill" button next to the offer type selector
5. The form will automatically be populated with AI-generated:
   - Offer description
   - Comments
   - Attribute values based on the offer type
   - Custom attributes relevant to the offer type

### For Campaigns

1. Navigate to the Campaigns page in OffersHub
2. Click on "Create Campaign"
3. Select an offer from the dropdown menu
4. Click the "AI Fill" button next to the offer selector
5. The form will automatically be populated with AI-generated:
   - Campaign name
   - Campaign description based on the selected offer
   - Selection criteria relevant to the selected offer type

## How It Works

### Offer AI Fill

The AI Fill feature uses Azure OpenAI to automatically generate offer data based on the selected offer type:

1. The application sends the tenant name, offer type, and default attributes to Azure OpenAI
2. Azure OpenAI generates relevant and realistic values for the offer attributes
3. The generated values are used to populate the form fields

### Campaign AI Fill

The Campaign AI Fill feature uses Azure OpenAI to automatically generate campaign data based on the selected offer:

1. The application sends the selected offer details and tenant name to Azure OpenAI
2. Azure OpenAI analyzes the offer data and generates:
   - A campaign name related to the offer
   - A campaign description that highlights the offer benefits
   - 2-3 selection criteria appropriate for targeting customers for this specific offer
3. The generated values are used to populate the form fields

## Troubleshooting

If you encounter issues with the AI Fill feature:

### Configuration Issues

- If the AI Fill button shows a warning icon, hover over it to see which environment variables are missing
- Check that all required environment variables are correctly set in the `.env` file
- Verify that the values are correctly formatted (no extra spaces or quotes)
- Make sure that the environment variables are prefixed with `VITE_` to be accessible in the client code

### API Issues

- Check your browser console for error messages
- Verify that your Azure OpenAI service is active and the API key is valid
- Make sure your Azure OpenAI model deployment is running
- Check that you have sufficient quota and rate limits for the Azure OpenAI API

### JSON Parsing Issues

If the AI returns responses in an unexpected format, the application includes several fallback strategies to extract valid JSON data. If parsing consistently fails:

- Try using a different prompt by modifying the system message in `azure-openai.ts`
- Check if the Azure OpenAI model is returning markdown formatted responses
- Try changing the model parameters (temperature, max tokens, etc.)

## Feedback and Support

If you encounter issues with the AI Fill feature or have suggestions for improvement, please contact the development team. 



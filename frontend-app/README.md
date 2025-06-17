
---

# 📊 OffersHub Dashboard

## 📖 Overview  
The OffersHub dashboard provides real-time metrics and visualizations for tenant-specific data, helping users monitor offers, campaigns, customer segments, and delivery statuses.

---

## 🧩 Key Components  

1. **Metrics Cards**: Displays key stats like active offers, campaigns, customer counts, and acceptance rates.  
2. **Offers Overview**: Bar chart of offer statuses (Draft, Approved, Rejected, etc.).  
3. **Campaign Performance**: Top campaigns by acceptance rate with key details.  
4. **Campaign Status**: Pie chart showing campaign statuses (Draft, Active, Completed, etc.).  
5. **Customer Segments**: Pie chart showing customers by type (Premium, Regular, Corporate, etc.).  
6. **Delivery Status**: Horizontal bar chart of delivery progress (Pending, Sent, Accepted, etc.).  

---

## 🛠️ Features  

- **Tenant-Aware**: Displays data filtered by the selected tenant.  
- **API-Based**: Pulls data from authenticated tenant-specific endpoints.  
- **Responsive Design**: Works across all device sizes.  
- **Error & Loading States**: Shows clear loading or error messages when necessary.  

---

## 🔄 Data Flow  

1. Tenant and authentication data are retrieved using `useTenant` and `useAuth` hooks.  
2. API requests are made with this data and responses are formatted for display.  
3. Dashboard updates automatically when the tenant changes.  

---

# 🔮 AI Fill Feature  

## ⚙️ Setup  

1. Add the following to your `.env` file in the `frontend-app` directory:  
   ```env
   VITE_AZURE_ENDPOINT=your-azure-endpoint
   VITE_AZURE_API_KEY=your-azure-api-key
   VITE_AZURE_API_VERSION=2023-05-15
   VITE_AZURE_DEPLOYMENT=your-azure-deployment-name
   ```
2. Restart the development server after making changes:  
   ```bash
   pnpm dev
   ```

---

## 🚀 Using AI Fill  

### For Offers:  
1. Go to the **Offers** page and click **Create Offer**.  
2. Choose an offer type and click **AI Fill**.  
3. The form will auto-fill with AI-generated data like descriptions and attributes.  

### For Campaigns:  
1. Go to the **Campaigns** page and click **Create Campaign**.  
2. Select an offer and click **AI Fill**.  
3. The form will auto-fill with AI-generated names, descriptions, and targeting criteria.  

---

## 🔧 Troubleshooting  

1. Verify `.env` variables are set correctly.  
2. Check browser console for errors if AI Fill doesn't work.  
3. Ensure your Azure OpenAI deployment is active, has valid credentials, and has sufficient quota.  

---

## 💌 Support  

For questions or feedback, feel free to reach out to the development team. We're here to help! 🎉  

--- 

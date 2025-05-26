# 💼 OfferHub

## 📖 Overview

**OfferHub** is a purpose-built platform for financial services companies to create, manage, and optimize personalized offers. It enables banks and financial institutions to deliver targeted promotions that enhance customer engagement, drive retention, and fuel growth.

---

## ✨ Features

- 📊 Centralized dashboard for managing offers and promotions  
- 🧩 Personalized offer creation tailored to customer segments  
- 📈 Real-time monitoring of offer performance and conversion rates  
- 🧠 Actionable insights to refine marketing strategies and outreach  

---

## 🏦 Use Case

Financial institutions leverage **OfferHub** to craft and deliver highly relevant offers that resonate with individual customers. This improves the overall customer experience and increases customer lifetime value (CLTV).

---

## 🚀 Getting Started

This repository contains a full-stack web application with the following components:

- 🐘 **PostgreSQL** – Relational database for storing offer data  
- 🧠 **FastAPI** – Backend API service  
- 🌐 **Frontend App** – User interface for managing offers (e.g., React)

All services are containerized using **Docker Compose**.

---

## 🧰 Available Services

| Service        | Description           | Port |
|----------------|-----------------------|------|
| `postgres-db`  | PostgreSQL database   | 5432 |
| `backend-apis` | FastAPI backend APIs  | 8000 |
| `frontend-app` | Frontend web client   | 3000 |

---

## ⚙️ Usage

### ▶️ Start All Services

Build and run all containers in the background:

```bash
docker-compose up -d --build
docker-compose up --build
```

🛑 Stop All Services
```
docker-compose down
```
📄 View Live Logs

```
docker-compose logs -f
```

## Folder stracture

``` bash
Directory structure:
└── OffersHub/
     ├── backend-apis/
     │    ├── app/
     │    │    ├── controllers/
     │    │    │    ├── campaign_controller.py
     │    │    │    ├── customer_controller.py
     │    │    │    ├── offer_campaign_controller.py
     │    │    │    ├── offer_controller.py
     │    │    │    ├── selection_criteria_controller.py
     │    │    │    ├── target_customers_controller.py
     │    │    │    └── transaction_controller.py
     │    │    ├── crud/
     │    │    │    ├── campaign_crud.py
     │    │    │    ├── customer_crud.py
     │    │    │    ├── offer_campaign_crud.py
     │    │    │    ├── offer_crud.py
     │    │    │    ├── selection_criteria_crud.py
     │    │    │    ├── target_customers_crud.py
     │    │    │    └── transaction_crud.py
     │    │    ├── database/
     │    │    │    └── connection.py
     │    │    ├── main.py
     │    │    ├── middlewares/
     │    │    │    └── logging_middleware.py
     │    │    ├── models/
     │    │    │    ├── campaign.py
     │    │    │    ├── customer.py
     │    │    │    ├── offer.py
     │    │    │    ├── offer_campaign.py
     │    │    │    ├── selection_criteria.py
     │    │    │    ├── target_customers.py
     │    │    │    └── transaction.py
     │    │    ├── schemas/
     │    │    │    ├── campaign_schema.py
     │    │    │    ├── customer_schema.py
     │    │    │    ├── offer_campaign_schema.py
     │    │    │    ├── offer_schema.py
     │    │    │    ├── selection_criteria_schema.py
     │    │    │    ├── target_customers_schema.py
     │    │    │    └── transaction_schema.py
     │    │    ├── services/
     │    │    │    ├── admin_service.py
     │    │    │    └── auth_service.py
     │    │    ├── views/
     │    │    │    ├── campaign_view.py
     │    │    │    ├── customer_view.py
     │    │    │    ├── offer_view.py
     │    │    │    ├── selection_criteria_view.py
     │    │    │    ├── target_customers_view.py
     │    │    │    └── transaction_view.py
     │    │    └── __init__.py
     │    ├── Dockerfile
     │    ├── README.md
     │    └── requirements.txt
     ├── database-init/
     │    └── init.sql
     ├── docker-compose.yml
     ├── frontend-app/
     │    ├── compose.yml
     │    ├── dockerfile
     │    ├── index.html
     │    ├── LICENSE
     │    ├── package-lock.json
     │    ├── package.json
     │    ├── postcss.config.js
     │    ├── src/
     │    │    ├── App.tsx
     │    │    ├── assets/
     │    │    ├── components/
     │    │    ├── features/
     │    │    ├── hooks/
     │    │    ├── index.css
     │    │    ├── main.tsx
     │    │    ├── pages/
     │    │    ├── store.ts
     │    │    ├── utils/
     │    │    │    └── data.ts
     │    │    └── vite-env.d.ts
     │    ├── tailwind.config.js
     │    ├── tsconfig.json
     │    ├── tsconfig.node.json
     │    └── vite.config.ts
     ├── prompt.md
     └── README.md
``` 

## Contribution
*Guidelines on contributing to the project if applicable.*

## License
*Include license details if open source.*

---

*For more information or demo requests, contact [contributers].*

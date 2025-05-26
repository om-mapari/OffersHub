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
|-- backend-apis
  |-- .env
  |-- README.md
  |-- requirements.txt
  |-- setup_project.sh
  |-- app
    |-- main.py
    |-- __init__.py
    |-- auth
      |-- dependencies.py
      |-- token_handler.py
    |-- controllers
      |-- admin_controller.py
      |-- auth_controller.py
      |-- tenant_controller.py
      |-- user_controller.py
    |-- crud
      |-- user_crud.py
    |-- database
      |-- connection.py
    |-- db
      |-- base.py
      |-- session.py
    |-- middlewares
      |-- logging_middleware.py
    |-- models
      |-- tenant.py
      |-- user.py
    |-- schemas
      |-- tenant_schema.py
      |-- user_schema.py
    |-- services
      |-- admin_service.py
      |-- auth_service.py
      |-- tenant_service.py
      |-- user_service.py
    |-- utils
      |-- logger.py
    |-- views
      |-- user_view.py
  |-- myenv
|-- database-init
  |-- init.sql
|-- frontend-app
  |-- .eslintrc.cjs
  |-- .gitignore
  |-- compose.yml
  |-- dockerfile
  |-- index.html
  |-- LICENSE
  |-- package-lock.json
  |-- package.json
  |-- postcss.config.js
  |-- tailwind.config.js
  |-- tsconfig.json
  |-- tsconfig.node.json
  |-- vite.config.ts
  |-- src
    |-- App.tsx
    |-- index.css
    |-- main.tsx
    |-- store.ts
    |-- vite-env.d.ts
    |-- assets
    |-- pages
    |-- hooks
      |-- index.ts
    |-- utils
      |-- data.ts
    |-- components
    |-- features
``` 

## Contribution
*Guidelines on contributing to the project if applicable.*

## License
*Include license details if open source.*

---

*For more information or demo requests, contact [contributers].*

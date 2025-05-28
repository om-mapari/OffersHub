# 💼 OfferHub

## 📖 Overview

OfferHub is a purpose-built platform for financial services companies to create, manage, and optimize personalized offers. It enables banks and financial institutions to deliver targeted promotions that enhance customer engagement, drive retention, and fuel growth.

## ✨ Features

- 📊 Centralized dashboard for managing offers and promotions
- 🧩 Personalized offer creation tailored to customer segments
- 📈 Real-time monitoring of offer performance and conversion rates
- 🧠 Actionable insights to refine marketing strategies and outreach

## 🏦 Use Case

Financial institutions leverage OfferHub to craft and deliver highly relevant offers that resonate with individual customers. This improves the overall customer experience and increases customer lifetime value (CLTV).

## 🚀 Getting Started

This repository contains a full-stack web application with the following components:

- 🐘 PostgreSQL – Relational database for storing offer data
- 🧠 FastAPI – Backend API service
- 🌐 Frontend App – User interface for managing offers

All services are containerized using Docker Compose.

## 🧰 Available Services

| Service | Description | Port |
|---------|-------------|------|
| postgres-db | PostgreSQL database | 5432 |
| backend-apis | FastAPI backend APIs | 8000 |
| frontend-app | Frontend web client | 3000 |

## ⚙️ Usage

### ▶️ Start All Services

Build and run all containers in the background:

```bash
docker-compose up -d --build
```

Or in the foreground:

```bash
docker-compose up --build
```

### 🛑 Stop All Services

```bash
docker-compose down
```

### 📄 View Live Logs

```bash
docker-compose logs -f
```

## 🔧 Setup (Local Development)

1. Create a Python virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up your PostgreSQL database.

4. Create a `.env` file from `.env.example` and update the `DATABASE_URL` and `SECRET_KEY`.
   ```bash
   cp .env.example .env
   # Then edit .env
   ```

5. Initialize the database (if using Alembic, run migrations):
   ```bash
   # (Assuming Alembic is set up)
   # alembic upgrade head
   ```

## 🚀 Running the Application (Local)

```bash
uvicorn app.main:app --reload
```

The API will be available at `http://127.0.0.1:8000`.
- Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`

## 📚 API Documentation

The API follows RESTful principles and is organized into the following main sections:

### Authentication Endpoints

- `POST /api/v1/auth/token` - OAuth2 compatible token login
- `GET /api/v1/auth/me` - Get current authenticated user
- `POST /api/v1/auth/change-password` - Change user's password

### User Management

- `GET /api/v1/users/me` - Get current user profile
- `GET /api/v1/users/me/tenants` - Get tenants and roles for current user

### Super Admin - Tenant Management

- `POST /api/v1/sa/tenants/` - Create new tenant
- `GET /api/v1/sa/tenants/` - List all tenants
- `GET /api/v1/sa/tenants/{tenant_name}` - Get specific tenant
- `PUT /api/v1/sa/tenants/{tenant_name}` - Update tenant details
- `DELETE /api/v1/sa/tenants/{tenant_name}` - Delete tenant

### Super Admin - User Management

- `POST /api/v1/sa/users/` - Create new user
- `GET /api/v1/sa/users/` - List all users
- `GET /api/v1/sa/users/{username}` - Get specific user
- `PUT /api/v1/sa/users/{username}` - Update user details
- `DELETE /api/v1/sa/users/{username}` - Delete user

For complete API documentation, visit the Swagger UI at `http://127.0.0.1:8000/docs` when the application is running.

## 🧪 Testing the API

A comprehensive test suite has been set up to test all API endpoints. Tests use pytest and are located in the `tests/api/v1/` directory.

### Running the tests

Run the tests directly with pytest:

```bash
pytest -xvs tests/api/v1/ --cov=app --cov-report=term-missing
```

This command will:
- Run all tests in the `tests/api/v1/` directory
- Show verbose output (-v)
- Show each test case as it executes (-x)
- Show stdout for failed tests (-s)
- Generate a coverage report for the app directory (--cov=app)
- Show missing lines in the coverage report (--cov-report=term-missing)

### Test Structure

The tests are organized by resource type:

- `test_auth.py` - Authentication endpoints (login, token verification)
- `test_users.py` - User profile management
- `test_tenants.py` - Tenant management and user-tenant relationships
- `test_offers.py` - Offer creation, approval workflows, and management

### Adding New Tests

When adding new API features, add corresponding tests by:

1. Create a new test file in `tests/api/v1/` if testing a new resource
2. Use the existing fixtures from `conftest.py` for database access, authentication, etc.
3. Follow the pattern of existing tests for consistency

### Test Environment

Tests use an in-memory SQLite database by default to keep tests isolated and fast.

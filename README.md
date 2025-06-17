---

# 💼 OfferHub

## 📖 Overview  
OffersHub is a platform designed for financial services companies to create, manage, and optimize personalized offers. It enables banks and financial institutions to deliver targeted promotions that enhance customer engagement, drive retention, and fuel growth.

---

## ✨ Features  
- 📊 Centralized dashboard for managing offers and promotions  
- 🧩 Personalized offer creation tailored to customer segments  
- 📈 Real-time monitoring of offer performance and conversion rates  
- 🧠 Actionable insights to refine marketing strategies and outreach  

---

## 🏦 Use Case  
Financial institutions can use OffersHub to craft and deliver highly relevant offers that resonate with individual customers, improving the overall customer experience and increasing customer lifetime value (CLTV).

---

## 🚀 Getting Started  

This repository contains a full-stack web application with the following components:  
- 🐘 PostgreSQL – Relational database for storing offer data  
- 🧠 FastAPI – Backend API service  
- 🌐 React – Frontend user interface for managing offers  

---

## 🛠️ Local Development Setup  

### 🔧 Backend Setup  
1. Navigate to the backend directory: `cd backend-apis`  
2. Create a Python virtual environment: `python -m venv venv`  
3. Activate the virtual environment:  
    - 🖥️ On Windows: `venv\Scripts\activate`  
    - 🍎 On macOS/Linux: `source venv/bin/activate`  
4. Install dependencies: `pip install -r requirements.txt`  
5. Create a `.env` file from the template: `cp .env.example .env`  
6. Edit `.env` with your configuration settings.  
7. Start the FastAPI server: `uvicorn app.main:app --reload`  

🚀 The API will be accessible at `http://localhost:8000`.  
📚 API Documentation: `http://localhost:8000/docs`  

---

### 🌐 Frontend Setup  
1. Navigate to the frontend directory: `cd frontend-app`  
2. Install dependencies using pnpm: `pnpm install`  
3. Start the development server: `pnpm run dev`  

🎉 The frontend will be accessible at `http://localhost:3000`.

---

## 🐳 Docker Development Setup  

To set up a local development environment using Docker:  
1. Start the services:  
   `docker-compose -f docker-compose.dev.yml up -d --build`  


🎯 Services will be available at:  
   - 🧠 Backend: `http://localhost:8000`  
   - 🌐 Frontend: `http://localhost:3000`  

---

## 🚢 Production Deployment  

### 🌍 Setting Up Environment Variables  
1. Make the `set_env_variables.sh` script executable:  
   `chmod +x set_env_variables.sh`  
2. Run the script:  
   `./set_env_variables.sh`  

### 🏭 Starting Production Services  
1. Build and start production services:  
   `docker-compose up -d --build`  


⚠️ **Important:**  
For Windows users, ensure shell scripts like `database-init/00-init-db.sh` are converted to Unix format:  
`dos2unix ./database-init/00-init-db.sh`

---

## 🧪 Testing  

A comprehensive test suite has been set up to validate all API endpoints. To run the tests:  

1. Navigate to the backend directory:  
   `cd backend-apis`  
2. Activate the virtual environment:  
    - 🍎 On macOS/Linux: `source venv/bin/activate`  
    - 🖥️ On Windows: `venv\Scripts\activate`  
3. Run the tests:  
   `pytest -xvs tests/api/v1/ --cov=app --cov-report=term-missing`  

🛠️ This will:  
   - Run all tests in the `tests/api/v1/` directory  
   - Output verbose test results  
   - Display test coverage and highlight missing lines from the code.  

---

## 📌 Available Services  

| 🛠️ Service      | 📝 Description                 | 🌐 Local Port    | 🌍 Production Port |  
|------------------|--------------------------------|------------------|--------------------|  
| 📋 postgres-db   | PostgreSQL database           | 5432             | 5432               |  
| 🧠 backend-apis  | FastAPI backend APIs          | 8000             | 8000               |  
| 🌐 frontend-app  | Frontend web client           | 3000             | 3000               |  

---

## 👤 Contact & Contributions  

We would love to hear from you! Whether it's feedback, ideas, or contributions, feel free to reach out:  

- 💼 **LinkedIn:** [Om Mapari](https://www.linkedin.com/in/om-mapari/)  
- 💻 **GitHub:** [Om Mapari](https://www.github.com/om-mapari/)  

🤝 **Contributions**:  
We welcome contributions to make OffersHub even better! If you'd like to contribute:  
1. Fork the repository.  
2. Make your desired updates or feature additions.  
3. Create a pull request with a detailed explanation of your changes.  

For discussions or suggestions, feel free to connect with me on LinkedIn or open an issue on GitHub. Let's collaborate and build something amazing together!  

---



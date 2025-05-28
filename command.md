## ROLE & PRIMARY GOAL:
You are a "Robotic Senior Software Engineer AI". Your mission is to meticulously analyze the user's coding request (`User Task`), strictly adhere to `Guiding Principles` and `User Rules`, comprehend the existing `File Structure`, and then generate a precise set of code changes. Your *sole and exclusive output* must be a single `git diff` formatted text. Zero tolerance for any deviation from the specified output format.

---

## INPUT SECTIONS OVERVIEW:
1.  `User Task`: The user's coding problem or feature request.
2.  `Guiding Principles`: Your core operational directives as a senior developer.
3.  `User Rules`: Task-specific constraints from the user, overriding `Guiding Principles` in case of conflict.
4.  `Output Format & Constraints`: Strict rules for your *only* output: the `git diff` text.
5.  `File Structure Format Description`: How the provided project files are structured in this prompt.
6.  `File Structure`: The current state of the project's files.

---

## 1. User Task
Your Task to Build This backend using planning.md

---

## 2. Guiding Principles (Your Senior Developer Logic)

### A. Analysis & Planning (Internal Thought Process - Do NOT output this part):
1.  **Deconstruct Request:** Deeply understand the `User Task` – its explicit requirements, implicit goals, and success criteria.
2.  **Identify Impact Zone:** Determine precisely which files/modules/functions will be affected.
3.  **Risk Assessment:** Anticipate edge cases, potential errors, performance impacts, and security considerations.
4.  **Assume with Reason:** If ambiguities exist in `User Task`, make well-founded assumptions based on best practices and existing code context. Document these assumptions internally if complex.
5.  **Optimal Solution Path:** Briefly evaluate alternative solutions, selecting the one that best balances simplicity, maintainability, readability, and consistency with existing project patterns.
6.  **Plan Changes:** Before generating diffs, mentally (or internally) outline the specific changes needed for each affected file.

### B. Code Generation & Standards:
*   **Simplicity & Idiomatic Code:** Prioritize the simplest, most direct solution. Write code that is idiomatic for the language and aligns with project conventions (inferred from `File Structure`). Avoid over-engineering.
*   **Respect Existing Architecture:** Strictly follow the established project structure, naming conventions, and coding style.
*   **Type Safety:** Employ type hints/annotations as appropriate for the language.
*   **Modularity:** Design changes to be modular and reusable where sensible.
*   **Documentation:**
    *   Add concise docstrings/comments for new public APIs, complex logic, or non-obvious decisions.
    *   Update existing documentation if changes render it inaccurate.
*   **Logging:** Introduce logging for critical operations or error states if consistent with the project's logging strategy.
*   **No New Dependencies:** Do NOT introduce external libraries/dependencies unless explicitly stated in `User Task` or `User Rules`.
*   **Atomicity of Changes (Hunks):** Each distinct change block (hunk in the diff output) should represent a small, logically coherent modification.
*   **Testability:** Design changes to be testable. If a testing framework is evident in `File Structure` or mentioned in `User Rules`, ensure new code is compatible.

---

## 3. User Rules
no additional rules
*(These are user-provided, project-specific rules or task constraints. They take precedence over `Guiding Principles`.)*

---

## 4. Output Format & Constraints (MANDATORY & STRICT)



### General Constraints on Generated Code:
*   **Minimal & Precise Changes:** Generate the smallest, most targeted diff that correctly implements the `User Task` per all rules.
*   **Preserve Integrity:** Do not break existing functionality unless the `User Task` explicitly requires it. The codebase should remain buildable/runnable.


---

## 5. File Structure Format Description
* provided in planning.md. you can use that or you can modify it 

---

## 6. File Structure
Offer-Management-2\
└── planning.md

<file path="planning.md">
Offer Management Platform: API Endpoints & Folder Structure
This document outlines the required API endpoints and a suggested folder structure for the Offer Management Platform.
I. Required API Endpoints ⚙️
These endpoints are designed based on the user roles, permissions, and platform flow you've described.
A. Authentication & User Profile
These endpoints are for all users.
POST /auth/token: User Login.
Request Body: username, password
Response: Access Token (e.g., JWT)
Permissions: Any user.
POST /auth/change-password: Authenticated user changes their own password.
Request Body: current_password, new_password
Response: Success message.
Permissions: Authenticated user.
GET /users/me: Get details of the currently authenticated user.
Response: User object (e.g., username, full_name, is_super_admin).
Permissions: Authenticated user.
GET /users/me/tenants: Get tenants and associated roles for the currently authenticated user.
Response: List of {"tenant_name": "...", "roles": ["role1", "role2"]}.
Permissions: Authenticated user.
B. Super Admin Management
These endpoints require Super Admin privileges. The suggested prefix is /sa/.
Tenants (/sa/tenants)
POST /sa/tenants: Create a new tenant. (This will also trigger the creation of default user groups for the tenant and prepare offer configuration conceptually).
Request Body: name (primary key, e.g., 'credit_card'), description.
Response: Created tenant object.
GET /sa/tenants: List all tenants.
GET /sa/tenants/{tenant_name}: Get details of a specific tenant.
PUT /sa/tenants/{tenant_name}: Update a tenant's details (e.g., description).
DELETE /sa/tenants/{tenant_name}: Delete a tenant.
Users (/sa/users)
POST /sa/users: Create a new user.
Request Body: username, password, full_name, is_super_admin (boolean, optional).
Response: Created user object.
GET /sa/users: List all users.
GET /sa/users/{username}: Get details of a specific user.
PUT /sa/users/{username}: Update a user's details (e.g., full_name, is_super_admin status).
POST /sa/users/{username}/change-password: Change any user's password.
Request Body: new_password.
DELETE /sa/users/{username}: Delete a user.
User Tenant Roles (/sa/user-tenant-roles)
POST /sa/user-tenant-roles: Assign a role (or multiple roles) to a user for a specific tenant.
Request Body: username, tenant_name, role (e.g., 'admin', 'create', 'approver', 'read_only').
Response: Success message or updated role assignment.
GET /sa/user-tenant-roles: List all user-tenant role assignments.
Query Params (Optional): username, tenant_name for filtering.
DELETE /sa/user-tenant-roles: Remove a specific role from a user for a tenant.
Request Body: username, tenant_name, role.
C. Tenant-Specific Operations
These endpoints are typically prefixed with /tenants/{tenant_name}/. Access is governed by the user's role within that specific tenant.
Offers (/tenants/{tenant_name}/offers)
POST /offers: Create a new offer.
Request Body: data (JSONB for custom attributes), comments (optional). status will default to 'draft'.
Response: Created offer object.
Permissions: Tenant admin, create.
GET /offers: List all offers for the tenant.
Query Params (Optional): status, created_by for filtering.
Permissions: Tenant admin, create, approver, read_only.
GET /offers/{offer_id:int}: Get details of a specific offer.
Permissions: Tenant admin, create, approver, read_only.
PUT /offers/{offer_id:int}: Update an existing offer.
Request Body: data (JSONB), comments (optional).
Permissions:
Tenant create: Can edit if offer status is 'draft'.
Tenant admin: Can edit (potentially more fields or regardless of status, except approved - though altering approved offers might need a new versioning flow not specified).
DELETE /offers/{offer_id:int}: Delete an offer.
Permissions: Tenant admin (only if offer is not yet approved or has no active campaigns).
POST /offers/{offer_id:int}/submit: Submit a 'draft' offer for approval. (Changes status to 'submitted').
Permissions: Tenant create, admin.
POST /offers/{offer_id:int}/approve: Approve a 'submitted' offer. (Changes status to 'approved').
Permissions: Tenant approver, admin.
POST /offers/{offer_id:int}/reject: Reject a 'submitted' offer. (Changes status to 'rejected').
Request Body (Optional): comments for rejection reason.
Permissions: Tenant approver, admin.
POST /offers/{offer_id:int}/comment: Add a comment to an offer. (This would likely update the offers.comments field or add an entry to offer_audit_logs).
Request Body: comment_text.
Permissions: Tenant create, admin.
GET /offers/{offer_id:int}/audit-logs: View audit logs for a specific offer.
Permissions: Tenant admin (or other roles if deemed necessary).
Campaigns (/tenants/{tenant_name}/campaigns)
POST /campaigns: Create a new campaign.
Request Body: offer_id, name, description, selection_criteria (JSONB), start_date, end_date.
Response: Created campaign object.
Permissions: Tenant admin, create.
GET /campaigns: List all campaigns for the tenant.
Query Params (Optional): status, offer_id for filtering.
Permissions: Tenant admin, create, approver, read_only.
GET /campaigns/{campaign_id:int}: Get details of a specific campaign.
Permissions: Tenant admin, create, approver, read_only.
PUT /campaigns/{campaign_id:int}: Update an existing campaign.
Request Body: name, description, selection_criteria, start_date, end_date, status (e.g., to pause).
Permissions: Tenant admin (or create if campaign is in 'draft' status).
DELETE /campaigns/{campaign_id:int}: Delete a campaign.
Permissions: Tenant admin (likely only if 'draft' or no active customers).
POST /campaigns/{campaign_id:int}/process-customers: (This might be an internal trigger rather than a direct user API) Manually trigger the background job to populate campaign_customers for this campaign.
Permissions: Tenant admin.
GET /campaigns/{campaign_id:int}/customers: View customers associated with a campaign and their delivery status.
Permissions: Tenant admin, create, approver, read_only.
D. Customer Data Management (General)
These might be more general or require specific, potentially Super Admin or a dedicated data management role, depending on how customer data is sourced and managed. For simplicity, assuming Super Admin or a trusted internal process.
Customers (/customers)
POST /customers: Add a new customer.
Request Body: Customer details (full_name, email, kyc_status, segment, etc.).
GET /customers: List customers (with pagination and filtering).
GET /customers/{customer_id:uuid}: Get a specific customer.
PUT /customers/{customer_id:uuid}: Update a customer.
DELETE /customers/{customer_id:uuid}: Delete a customer.
(Note: Direct CRUD on customers might be handled by separate systems or bulk uploads rather than frequent API calls, depending on your architecture).
E. Background Task / System Endpoints
These are less for direct user interaction and more for system processes.
(Internal/Webhook) /system/campaigns/update-delivery-status: Endpoint that external delivery systems (email, SMS) might call to update the delivery_status in campaign_customers.
Request Body: Array of {"campaign_id", "customer_id", "status", "sent_at"}.
Security: Requires secure authentication (e.g., API key, mutual TLS).
II. Simple Folder Structure 📂
This is a common and scalable structure for FastAPI projects.
offer_management_platform/
├── app/                     # Main application source code
│   ├── api/                 # API specific modules
│   │   └── v1/              # Version 1 of the API
│   │       ├── endpoints/   # Individual route modules
│   │       │   ├── auth.py
│   │       │   ├── sa_tenants.py
│   │       │   ├── sa_users.py
│   │       │   ├── sa_user_roles.py
│   │       │   ├── offers.py
│   │       │   ├── campaigns.py
│   │       │   └── customers.py
│   │       ├── deps.py      # Dependency injections (e.g., get_current_user, role checks)
│   │       └── api.py       # Main router for API v1 (aggregates endpoint routers)
│   │
│   ├── core/                # Core application logic and configuration
│   │   ├── config.py      # Application settings (e.g., from .env files)
│   │   └── security.py    # Password hashing, JWT generation/validation
│   │
│   ├── crud/                # Database interaction functions (Create, Read, Update, Delete)
│   │   ├── base.py          # (Optional) Base CRUD class with common methods
│   │   ├── crud_user.py
│   │   ├── crud_tenant.py
│   │   ├── crud_offer.py
│   │   ├── crud_campaign.py
│   │   ├── crud_customer.py
│   │   └── crud_user_tenant_role.py
│   │
│   ├── db/                  # Database connection and session management
│   │   ├── session.py     # Database engine, session creation (e.g., for SQLAlchemy or raw asyncpg)
│   │   └── init_db.py     # (Optional) Script to initialize DB, create superuser
│   │
│   ├── models/              # Pydantic models for data validation & serialization (request/response schemas)
│   │   ├── token.py
│   │   ├── user.py
│   │   ├── tenant.py
│   │   ├── offer.py
│   │   ├── campaign.py
│   │   ├── customer.py
│   │   └── common.py        # Common response models (e.g., Msg for messages)
│   │
│   ├── schemas/             # (Alternative to models/ or for more complex separation if needed)
│   │   └── ...
│   │
│   ├── services/            # Business logic layer (if logic is too complex for CRUD or API endpoints)
│   │   ├── tenant_service.py  # e.g., logic for creating default groups on tenant creation
│   │   └── campaign_processing_service.py # Logic for the background job
│   │
│   ├── utils/               # General utility functions
│   │   └── permissions.py   # Helper functions for permission checks
│   │
│   └── main.py              # FastAPI application instance, middleware, global event handlers
│
├── scripts/                 # Standalone scripts (e.g., for background jobs, data migration)
│   └── process_campaign_customers.py # The script for your background job
│
├── tests/                   # Unit and integration tests
│   ├── api/
│   │   └── v1/
│   │       └── test_offers.py
│   ├── crud/
│   │   └── test_crud_user.py
│   └── utils/
│
├── .env                     # Environment variables (DB_URL, SECRET_KEY, etc.) - DO NOT COMMIT
├── .env.example             # Example environment variables
├── .gitignore
├── Dockerfile               # For containerizing the application
├── docker-compose.yml       # For local development with Docker (app + DB)
├── requirements.txt         # Python dependencies
└── README.md                # Project documentation



Explanation of Key Directories:
app/api/v1/endpoints/: Each file here will contain APIRouter instances for a specific resource or group of related endpoints.
app/api/v1/deps.py: This is crucial for FastAPI's dependency injection system. You'll define functions here to:
Get the current authenticated user from a token.
Check if the user has required roles for a specific tenant context.
app/core/: config.py loads settings (like database URL, secret keys) from environment variables. security.py handles password hashing and JWT token operations.
app/crud/: These modules will contain functions that directly interact with your PostgreSQL database to perform CRUD operations. If you're not using an ORM like SQLAlchemy, these functions will execute raw SQL queries (preferably using an async library like asyncpg).
app/db/: Manages the database connection pool and session handling.
app/models/: Pydantic models define the expected structure of your API request and response bodies. They are also used for data validation. For JSONB fields, you can use Dict[str, Any] or define more specific Pydantic models if there's a common structure.
app/services/: If your business logic becomes complex (e.g., the tenant creation flow that also sets up default groups), it's good to abstract it into service functions. The campaign customer processing logic would also fit well here or in the scripts/ directory if run as a separate process.
scripts/: For tasks that run outside the main API application flow, like your background job for populating campaign_customers.
This structure provides a good separation of concerns and should scale well as your application grows. Remember to implement robust error handling, logging, and security measures (like input validation and proper authentication/authorization) throughout your API.

</file>
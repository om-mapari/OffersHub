#!/bin/bash

# Root folder
mkdir -p app

# Create main.py
touch app/main.py

# Create subdirectories
mkdir -p app/controllers
mkdir -p app/services
mkdir -p app/models
mkdir -p app/schemas
mkdir -p app/db
mkdir -p app/middlewares
mkdir -p app/auth
mkdir -p app/crud
mkdir -p app/utils

# Create controller files
touch app/controllers/auth_controller.py
touch app/controllers/user_controller.py
touch app/controllers/admin_controller.py
touch app/controllers/tenant_controller.py

# Create service files
touch app/services/auth_service.py
touch app/services/user_service.py
touch app/services/admin_service.py
touch app/services/tenant_service.py

# Create model files
touch app/models/user.py
touch app/models/tenant.py

# Create schema files
touch app/schemas/user_schema.py
touch app/schemas/tenant_schema.py

# Create db files
touch app/db/base.py
touch app/db/session.py

# Create middleware file
touch app/middlewares/logging_middleware.py

# Create auth files
touch app/auth/dependencies.py
touch app/auth/token_handler.py

# Create crud file
touch app/crud/user_crud.py

# Create utils file
touch app/utils/logger.py

echo "✅ Folder structure and files created successfully."

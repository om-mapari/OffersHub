#!/bin/bash
set -e

# Create the 'pgcrypto' extension
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<EOSQL
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
EOSQL

# Check if the users table already exists to avoid duplicate initialization
USER_TABLE_EXISTS=$(psql -t --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users')")

if [[ $USER_TABLE_EXISTS == *"f"* ]]; then
    echo "Initializing database schema..."

    # Run the initialization SQL
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -f /docker-entrypoint-initdb.d/init.sql

    # Create a default admin user and initial tenant setup
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<EOSQL
INSERT INTO users (user_name, password_hash, full_name, is_super_admin) 
VALUES ('admin', '\$2b\$12\$07G.lvOLA/QMFd1WL/PfNOay0.Z3Q6mcHebZs/ZIzTSOw7FsLgHtK', 'System Administrator', true)
ON CONFLICT (user_name) DO NOTHING;

INSERT INTO tenants (tenant_name, description, created_by_username)
VALUES ('credit_card', 'Credit Card Offers', 'admin')
ON CONFLICT (tenant_name) DO NOTHING;

INSERT INTO user_tenant_roles (username, tenant_name, role)
VALUES ('admin', 'credit_card', 'admin')
ON CONFLICT (username, tenant_name, role) DO NOTHING;
EOSQL

    echo "Database initialization completed!"
else
    echo "Database already initialized, skipping initialization"
fi

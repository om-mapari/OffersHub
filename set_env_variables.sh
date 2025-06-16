#!/bin/bash

# Prompt user for AZURE_API_KEY
read -p "Enter AZURE_API_KEY: " AZURE_API_KEY

# Prompt user for VITE_API_BASE_URL
read -p "Enter VITE_API_BASE_URL: " VITE_API_BASE_URL

# Set AZURE_API_KEY in docker-compose.yml
sed -i "s/\${AZURE_API_KEY:-.*}/\${AZURE_API_KEY:-$AZURE_API_KEY}/" docker-compose.yml

# Overwrite VITE_API_BASE_URL in frontend-app/Dockerfile.prod
sed -i "s|ENV VITE_API_BASE_URL=.*|ENV VITE_API_BASE_URL=$VITE_API_BASE_URL|" frontend-app/Dockerfile.prod

# Create or update frontend-app/.env.production
cat > frontend-app/.env.production <<EOL
# API Configuration
# In production, we use the server IP address for the API
VITE_API_BASE_URL=$VITE_API_BASE_URL
EOL

echo "Environment variables updated successfully and .env.production file created/updated."

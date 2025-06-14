#!/bin/bash

# Setup environment variables for OffersHub deployment
echo "Setting up environment variables for OffersHub deployment..."

# Check if .env already exists in frontend-app
if [ -f "frontend-app/.env" ]; then
  echo "Warning: frontend-app/.env already exists."
  read -p "Do you want to overwrite it? (y/n): " overwrite
  if [ "$overwrite" != "y" ]; then
    echo "Setup cancelled. Using existing .env file."
    exit 0
  fi
fi

# Copy the example file
cp frontend-app/.env.example frontend-app/.env

# Prompt for values
echo "Please provide Azure OpenAI configuration values:"
read -p "Azure OpenAI Endpoint: " azure_endpoint
read -p "Azure OpenAI API Key: " azure_api_key
read -p "Azure OpenAI API Version [2024-12-01-preview]: " azure_api_version
azure_api_version=${azure_api_version:-2024-12-01-preview}
read -p "Azure OpenAI Deployment Model [gpt-4o-3]: " azure_deployment
azure_deployment=${azure_deployment:-gpt-4o-3}

# Ask if user wants to update API base URL
read -p "API Base URL [http://localhost:8000/api/v1]: " api_base_url
api_base_url=${api_base_url:-http://localhost:8000/api/v1}

# Update the .env file
if [ "$(uname)" = "Darwin" ]; then
  # macOS
  sed -i '' "s|VITE_AZURE_ENDPOINT=.*|VITE_AZURE_ENDPOINT=${azure_endpoint}|" frontend-app/.env
  sed -i '' "s|VITE_AZURE_API_KEY=.*|VITE_AZURE_API_KEY=${azure_api_key}|" frontend-app/.env
  sed -i '' "s|VITE_AZURE_API_VERSION=.*|VITE_AZURE_API_VERSION=${azure_api_version}|" frontend-app/.env
  sed -i '' "s|VITE_AZURE_DEPLOYMENT=.*|VITE_AZURE_DEPLOYMENT=${azure_deployment}|" frontend-app/.env
  sed -i '' "s|VITE_API_BASE_URL=.*|VITE_API_BASE_URL=${api_base_url}|" frontend-app/.env
  
  # Update docker-compose.yml
  sed -i '' "s|- VITE_API_BASE_URL=.*|- VITE_API_BASE_URL=${api_base_url}|" docker-compose.yml
  sed -i '' "s|- VITE_AZURE_ENDPOINT=\${VITE_AZURE_ENDPOINT}|- VITE_AZURE_ENDPOINT=${azure_endpoint}|" docker-compose.yml
  sed -i '' "s|- VITE_AZURE_API_KEY=\${VITE_AZURE_API_KEY}|- VITE_AZURE_API_KEY=${azure_api_key}|" docker-compose.yml
  sed -i '' "s|- VITE_AZURE_API_VERSION=\${VITE_AZURE_API_VERSION}|- VITE_AZURE_API_VERSION=${azure_api_version}|" docker-compose.yml
  sed -i '' "s|- VITE_AZURE_DEPLOYMENT=\${VITE_AZURE_DEPLOYMENT}|- VITE_AZURE_DEPLOYMENT=${azure_deployment}|" docker-compose.yml
else
  # Linux
  sed -i "s|VITE_AZURE_ENDPOINT=.*|VITE_AZURE_ENDPOINT=${azure_endpoint}|" frontend-app/.env
  sed -i "s|VITE_AZURE_API_KEY=.*|VITE_AZURE_API_KEY=${azure_api_key}|" frontend-app/.env
  sed -i "s|VITE_AZURE_API_VERSION=.*|VITE_AZURE_API_VERSION=${azure_api_version}|" frontend-app/.env
  sed -i "s|VITE_AZURE_DEPLOYMENT=.*|VITE_AZURE_DEPLOYMENT=${azure_deployment}|" frontend-app/.env
  sed -i "s|VITE_API_BASE_URL=.*|VITE_API_BASE_URL=${api_base_url}|" frontend-app/.env
  
  # Update docker-compose.yml
  sed -i "s|- VITE_API_BASE_URL=.*|- VITE_API_BASE_URL=${api_base_url}|" docker-compose.yml
  sed -i "s|- VITE_AZURE_ENDPOINT=\${VITE_AZURE_ENDPOINT}|- VITE_AZURE_ENDPOINT=${azure_endpoint}|" docker-compose.yml
  sed -i "s|- VITE_AZURE_API_KEY=\${VITE_AZURE_API_KEY}|- VITE_AZURE_API_KEY=${azure_api_key}|" docker-compose.yml
  sed -i "s|- VITE_AZURE_API_VERSION=\${VITE_AZURE_API_VERSION}|- VITE_AZURE_API_VERSION=${azure_api_version}|" docker-compose.yml
  sed -i "s|- VITE_AZURE_DEPLOYMENT=\${VITE_AZURE_DEPLOYMENT}|- VITE_AZURE_DEPLOYMENT=${azure_deployment}|" docker-compose.yml
fi

echo "Environment setup complete. Configuration has been updated in:"
echo "- frontend-app/.env"
echo "- docker-compose.yml"
echo ""
echo "Now you can run: docker compose up -d" 
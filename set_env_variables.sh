#!/bin/bash

# Helper function to get the default value for environment variables from docker-compose.yml
get_default_value() {
  local key=$1
  grep -Po "${key}:\s*\K.*" docker-compose.yml | sed 's/[ ]*//g; s/"//g'
}

# Prompt user with a default value
prompt_with_default() {
  local message=$1
  local default=$2
  local user_input
  read -p "${message} (${default}): " user_input
  echo "${user_input:-$default}"
}

# Retrieve current/default values from docker-compose.yml
DEFAULT_VITE_API_BASE_URL=$(get_default_value "VITE_API_BASE_URL")
DEFAULT_AZURE_API_KEY=$(get_default_value "AZURE_API_KEY")
DEFAULT_POSTGRES_USER=$(get_default_value "POSTGRES_USER")
DEFAULT_POSTGRES_PASSWORD=$(get_default_value "POSTGRES_PASSWORD")

# Ask for user input with default values
VITE_API_BASE_URL=$(prompt_with_default "Enter VITE_API_BASE_URL" "$DEFAULT_VITE_API_BASE_URL")
AZURE_API_KEY=$(prompt_with_default "Enter AZURE_API_KEY" "$DEFAULT_AZURE_API_KEY")
POSTGRES_USER=$(prompt_with_default "Enter POSTGRES_USER" "$DEFAULT_POSTGRES_USER")
POSTGRES_PASSWORD=$(prompt_with_default "Enter POSTGRES_PASSWORD" "$DEFAULT_POSTGRES_PASSWORD")

# Update Environment Variables in `docker-compose.yml`
sed -i "s|\${AZURE_API_KEY:-.*}|\${AZURE_API_KEY:-$AZURE_API_KEY}|" docker-compose.yml
sed -i "s|POSTGRES_USER: .*|POSTGRES_USER: $POSTGRES_USER|" docker-compose.yml
sed -i "s|POSTGRES_PASSWORD: .*|POSTGRES_PASSWORD: $POSTGRES_PASSWORD|" docker-compose.yml

# Ensure Frontend Configuration File (.env.production) is updated
cat > frontend-app/.env.production <<EOL
# API Configuration
# In production, we use the server IP address for the API
VITE_API_BASE_URL=$VITE_API_BASE_URL
EOL

echo "Environment variables updated successfully and .env.production file created/updated."
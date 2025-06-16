#!/bin/sh

# Find the main JavaScript file that contains the configuration
JS_FILE=$(find /usr/share/nginx/html/assets -name "index-*.js" | head -n 1)

if [ -z "$JS_FILE" ]; then
  echo "Error: Could not find main JavaScript file"
  exit 1
fi

echo "Found main JS file: $JS_FILE"

# Replace environment variables in the JavaScript file
echo "Replacing environment variables in $JS_FILE"

# Create a temporary file
TMP_FILE=$(mktemp)

# Replace the environment variables
if [ -n "$VITE_API_BASE_URL" ]; then
  echo "Setting API base URL to: $VITE_API_BASE_URL"
  
  # Replace both relative paths and hardcoded localhost URLs
  sed -e "s|/api/v1|$VITE_API_BASE_URL|g" \
      -e "s|http://localhost:8000/api/v1|$VITE_API_BASE_URL|g" \
      "$JS_FILE" > "$TMP_FILE"
  
  cat "$TMP_FILE" > "$JS_FILE"
  echo "API base URL replaced successfully"
fi

# Clean up
rm "$TMP_FILE"

echo "Environment variables have been replaced successfully" 
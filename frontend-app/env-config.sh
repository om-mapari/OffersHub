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
  sed "s|/api/v1|$VITE_API_BASE_URL|g" "$JS_FILE" > "$TMP_FILE"
  cat "$TMP_FILE" > "$JS_FILE"
fi

if [ -n "$VITE_AZURE_ENDPOINT" ]; then
  echo "Setting Azure OpenAI endpoint"
  # Use a placeholder pattern that won't match real content
  sed "s|\"endpoint\":\"[^\"]*\"|\"endpoint\":\"$VITE_AZURE_ENDPOINT\"|g" "$JS_FILE" > "$TMP_FILE"
  cat "$TMP_FILE" > "$JS_FILE"
fi

if [ -n "$VITE_AZURE_API_KEY" ]; then
  echo "Setting Azure OpenAI API key"
  # Use a placeholder pattern that won't match real content
  sed "s|\"apiKey\":\"[^\"]*\"|\"apiKey\":\"$VITE_AZURE_API_KEY\"|g" "$JS_FILE" > "$TMP_FILE"
  cat "$TMP_FILE" > "$JS_FILE"
fi

if [ -n "$VITE_AZURE_API_VERSION" ]; then
  echo "Setting Azure OpenAI API version"
  # Use a placeholder pattern that won't match real content
  sed "s|\"apiVersion\":\"[^\"]*\"|\"apiVersion\":\"$VITE_AZURE_API_VERSION\"|g" "$JS_FILE" > "$TMP_FILE"
  cat "$TMP_FILE" > "$JS_FILE"
fi

if [ -n "$VITE_AZURE_DEPLOYMENT" ]; then
  echo "Setting Azure OpenAI deployment"
  # Use a placeholder pattern that won't match real content
  sed "s|\"deployment\":\"[^\"]*\"|\"deployment\":\"$VITE_AZURE_DEPLOYMENT\"|g" "$JS_FILE" > "$TMP_FILE"
  cat "$TMP_FILE" > "$JS_FILE"
fi

# Clean up
rm "$TMP_FILE"

echo "Environment variables have been replaced successfully" 
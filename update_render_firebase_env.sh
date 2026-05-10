#!/bin/bash

# Script to update Render.com environment variables via API
# Usage: ./update_render_firebase_env.sh

SERVICE_ID="srv-d7rg9qugvqtc73bfq5i0"
RENDER_API_KEY="your_render_api_key_here"

# Firebase credentials from .env
FIREBASE_API_KEY="AIzaSyDilJciJIZWlZfzNBG95B8AyQpNCq9_SBQ"
FIREBASE_AUTH_DOMAIN="blobis.firebaseapp.com"
FIREBASE_PROJECT_ID="blobis"
FIREBASE_STORAGE_BUCKET="blobis.firebasestorage.app"
FIREBASE_MESSAGING_SENDER_ID="414925110586"
FIREBASE_APP_ID="1:414925110586:web:29f5c931542d554b722403"

echo "🔥 Adding Firebase environment variables to Render.com..."

# Add each variable
curl -X POST "https://api.render.com/v1/services/${SERVICE_ID}/env-vars" \
  -H "Authorization: Bearer ${RENDER_API_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"key\": \"VITE_FIREBASE_API_KEY\", \"value\": \"${FIREBASE_API_KEY}\"}"

curl -X POST "https://api.render.com/v1/services/${SERVICE_ID}/env-vars" \
  -H "Authorization: Bearer ${RENDER_API_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"key\": \"VITE_FIREBASE_AUTH_DOMAIN\", \"value\": \"${FIREBASE_AUTH_DOMAIN}\"}"

curl -X POST "https://api.render.com/v1/services/${SERVICE_ID}/env-vars" \
  -H "Authorization: Bearer ${RENDER_API_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"key\": \"VITE_FIREBASE_PROJECT_ID\", \"value\": \"${FIREBASE_PROJECT_ID}\"}"

curl -X POST "https://api.render.com/v1/services/${SERVICE_ID}/env-vars" \
  -H "Authorization: Bearer ${RENDER_API_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"key\": \"VITE_FIREBASE_STORAGE_BUCKET\", \"value\": \"${FIREBASE_STORAGE_BUCKET}\"}"

curl -X POST "https://api.render.com/v1/services/${SERVICE_ID}/env-vars" \
  -H "Authorization: Bearer ${RENDER_API_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"key\": \"VITE_FIREBASE_MESSAGING_SENDER_ID\", \"value\": \"${FIREBASE_MESSAGING_SENDER_ID}\"}"

curl -X POST "https://api.render.com/v1/services/${SERVICE_ID}/env-vars" \
  -H "Authorization: Bearer ${RENDER_API_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"key\": \"VITE_FIREBASE_APP_ID\", \"value\": \"${FIREBASE_APP_ID}\"}"

echo ""
echo "✅ Firebase environment variables added!"
echo "🚀 Trigger manual deploy in Render Dashboard to apply changes"

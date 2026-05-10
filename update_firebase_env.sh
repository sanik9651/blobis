#!/bin/bash

# Script to update Firebase environment variables on Render.com
# Usage: ./update_firebase_env.sh

echo "🔥 Firebase Environment Variables Update Script"
echo "================================================"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create .env file with Firebase configuration first."
    exit 1
fi

# Load variables from .env
source .env

echo "📋 Current Firebase Configuration:"
echo "-----------------------------------"
echo "API Key: ${VITE_FIREBASE_API_KEY:0:20}..."
echo "Project ID: $VITE_FIREBASE_PROJECT_ID"
echo "Auth Domain: $VITE_FIREBASE_AUTH_DOMAIN"
echo ""

# Render service ID
SERVICE_ID="srv-d7rg9qugvqtc73bfq5i0"

echo "🚀 To update on Render.com:"
echo "-----------------------------------"
echo "1. Go to: https://dashboard.render.com/web/$SERVICE_ID"
echo "2. Click 'Environment' tab"
echo "3. Add/Update these variables:"
echo ""
echo "VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY"
echo "VITE_FIREBASE_AUTH_DOMAIN=$VITE_FIREBASE_AUTH_DOMAIN"
echo "VITE_FIREBASE_PROJECT_ID=$VITE_FIREBASE_PROJECT_ID"
echo "VITE_FIREBASE_STORAGE_BUCKET=$VITE_FIREBASE_STORAGE_BUCKET"
echo "VITE_FIREBASE_MESSAGING_SENDER_ID=$VITE_FIREBASE_MESSAGING_SENDER_ID"
echo "VITE_FIREBASE_APP_ID=$VITE_FIREBASE_APP_ID"
echo ""
echo "4. Click 'Save Changes'"
echo "5. Render will automatically redeploy"
echo ""
echo "✅ Done! Wait for deployment to complete."

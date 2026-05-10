#!/bin/bash
set -e

echo "=== Installing Python dependencies ==="
pip install -r requirements.txt

echo "=== Installing Node.js dependencies ==="
npm install

echo "=== Building frontend ==="
npm run build

echo "=== Checking build output ==="
ls -la dist/
ls -la dist/assets/ || echo "No assets directory!"

echo "=== Build complete ==="

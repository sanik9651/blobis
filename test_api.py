#!/usr/bin/env python3
"""
Test all API endpoints
"""
import requests
import json

BASE_URL = "https://blobis-gqla.onrender.com"

def test_endpoint(path, method="GET", data=None):
    url = f"{BASE_URL}{path}"
    try:
        if method == "GET":
            response = requests.get(url, timeout=10)
        else:
            response = requests.post(url, json=data, timeout=10)

        print(f"\n{'='*60}")
        print(f"Endpoint: {method} {path}")
        print(f"Status: {response.status_code}")

        if response.status_code == 200:
            try:
                print(f"Response: {json.dumps(response.json(), indent=2)}")
            except:
                print(f"Response (text): {response.text[:200]}")
        else:
            print(f"Error: {response.text[:200]}")

    except Exception as e:
        print(f"\n{'='*60}")
        print(f"Endpoint: {method} {path}")
        print(f"ERROR: {e}")

# Test all endpoints
print("Testing Blobis API...")

test_endpoint("/api/health")
test_endpoint("/api/market/pool")
test_endpoint("/api/market/stats")
test_endpoint("/api/market/candles/1m?limit=5")
test_endpoint("/api/admin/users")

print(f"\n{'='*60}")
print("Testing complete!")

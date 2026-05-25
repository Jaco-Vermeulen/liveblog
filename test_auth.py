import requests
import json

r = requests.post(
    'http://localhost:5000/api/auth_db',
    json={"username": "admin", "password": "admin"},
    headers={"Content-Type": "application/json"}
)
print("status:", r.status_code)
print("body:", r.text[:300])

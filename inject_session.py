import requests, json

# Get fresh auth token
r = requests.post('http://localhost:5000/api/auth_db', json={"username": "admin", "password": "admin"}, headers={"Content-Type": "application/json"})
if r.status_code != 201:
    print("AUTH FAILED:", r.status_code, r.text[:200])
    exit(1)

data = r.json()
token = data.get("token")
session_id = data.get("_id")
print("token:", token[:20] if token else "NONE")
print("session_id:", session_id)

# Get user info
r2 = requests.get('http://localhost:5000/api/users/me', headers={"Authorization": token})
if r2.status_code == 200:
    user = r2.json()
    print("user:", user.get("username"), "id:", user.get("_id"))
    print("TOKEN_VALUE:", token)
    print("USER_ID:", user.get("_id"))
    print("SESSION_ID:", session_id)
else:
    print("USER FETCH FAILED:", r2.status_code)

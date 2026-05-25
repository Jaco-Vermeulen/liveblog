import requests, json

# Get fresh auth token
r = requests.post(
    'http://localhost:5000/api/auth_db',
    json={"username": "admin", "password": "admin"},
    headers={"Content-Type": "application/json"}
)
data = r.json()
token = data.get("token")
session_id = data.get("_id")
print("TOKEN:", token)
print("SESSION_ID:", session_id)

# Get user info using token
r2 = requests.get(
    'http://localhost:5000/api/users',
    headers={"Authorization": token}
)
if r2.status_code == 200:
    users = r2.json().get("_items", [])
    admin = next((u for u in users if u.get("username") == "admin"), users[0] if users else {})
    print("USER_ID:", admin.get("_id"))
    print("USERNAME:", admin.get("username"))
    print("DISPLAY_NAME:", admin.get("display_name", "Admin User"))
    print("FULL_USER_JSON:", json.dumps({
        "_id": admin.get("_id"),
        "username": admin.get("username"),
        "display_name": admin.get("display_name", "Admin User"),
        "UserName": admin.get("username"),
        "user_type": admin.get("user_type", "administrator")
    }))
else:
    print("USERS FAIL:", r2.status_code, r2.text[:100])

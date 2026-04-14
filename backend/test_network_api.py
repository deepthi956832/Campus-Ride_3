import urllib.request
import json

# Replace with current network IP
API_URL = "http://10.129.163.214:8000/api/users/register/"

payload = {
    "full_name": "Test User",
    "email": "test@example.com",
    "mobile": "1234567890",
    "password": "password123",
    "user_type": "student",
    "institution": "Test Inst",
    "department": "Test Dept",
    "id_number": "TEST123"
}

print(f"Testing connectivity to {API_URL}...")

data = json.dumps(payload).encode('utf-8')
req = urllib.request.Request(API_URL, data=data, headers={'Content-Type': 'application/json'})

try:
    with urllib.request.urlopen(req, timeout=10) as response:
        print(f"Status Code: {response.getcode()}")
        print(f"Response: {response.read().decode('utf-8')}")
except Exception as e:
    print(f"Error: {e}")

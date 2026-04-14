import requests
import json

url = "http://127.0.0.1:8000/api/users/register/"
data = {
    "full_name": "Tarun Manukonda",
    "email": "vamsikrishnamanukonda143@gmail.com",
    "mobile": "7893978256",
    "password": "password123",
    "user_type": "student",
    "institution": "ABC Engineering College"
}

try:
    response = requests.post(url, json=data)
    print(f"Status Code: {response.status_code}")
    print("Response Body:")
    print(json.dumps(response.json(), indent=2))
except Exception as e:
    print(f"Error: {e}")

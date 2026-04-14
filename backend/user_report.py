import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.models import User

users = User.objects.all()
print(f"--- Database User Report ---")
print(f"Total Users: {len(users)}\n")

for u in users:
    print(f"ID: {u.id}")
    print(f"Username: {u.username}")
    print(f"Full Name: '{u.full_name}'")
    print(f"Email: {u.email}")
    print(f"Mobile: {u.mobile}")
    print(f"User Type: {u.user_type}")
    print(f"Institution: {u.institution}")
    print(f"-" * 30)

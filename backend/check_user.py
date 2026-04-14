import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.models import User

# Check all users
users = User.objects.all()
print(f"Total Users: {len(users)}")
for u in users:
    print(f"ID: {u.id}, Username: {u.username}, Email: {u.email}, Mobile: {u.mobile}, Verified: {u.is_verified}")

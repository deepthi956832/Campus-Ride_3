import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.models import User

def debug_user(identifier):
    print(f"Checking user with identifier: {identifier}")
    # Search by email, username, or mobile
    users = User.objects.filter(models.Q(email=identifier) | models.Q(username=identifier) | models.Q(mobile=identifier))
    if not users.exists():
        print("User not found.")
        return

    for user in users:
        print(f"--- User Details for {user.username} ---")
        print(f"Email: {user.email}")
        print(f"Mobile: {user.mobile}")
        print(f"Is Active: {user.is_active}")
        print(f"Is Verified: {user.is_verified}")
        print(f"Password set: {user.has_usable_password()}")
        print(f"Username in DB: '{user.username}'")
        
if __name__ == "__main__":
    import sys
    from django.db import models
    if len(sys.argv) > 1:
        debug_user(sys.argv[1])
    else:
        # Check some recent users
        for user in User.objects.all().order_by('-id')[:5]:
            print(f"User: {user.username}, Email: {user.email}, Verified: {user.is_verified}, Active: {user.is_active}")

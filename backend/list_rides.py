import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.models import User, Ride

rides = Ride.objects.all()
print(f"{'ID':<5} | {'FROM':<15} | {'TO':<15} | {'POSTER':<15} | {'SEATS':<5}")
print("-" * 65)
for r in rides:
    try:
        poster_name = r.poster.full_name or r.poster.username
    except User.DoesNotExist:
        poster_name = "MISSING_USER"
    print(f"{r.id:<5} | {r.from_location[:15]:<15} | {r.to_location[:15]:<15} | {poster_name:<15} | {r.seats_available:<5}")

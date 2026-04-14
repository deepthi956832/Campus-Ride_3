import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib import admin
from django.apps import apps

print("Registered models in admin:")
for model, model_admin in admin.site._registry.items():
    print(f"- {model.__name__}: {model_admin.__class__.__name__}")

print("\nApp Configs:")
for app in apps.get_app_configs():
    print(f"- {app.name} ({app.label})")

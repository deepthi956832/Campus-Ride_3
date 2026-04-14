from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Vehicle, Ride, RideRequest, Notification, ChatMessage, EmailVerification

# Custom User admin for proper display
class CustomUserAdmin(UserAdmin):
    model = User
    list_display = ('username', 'email', 'mobile', 'user_type', 'is_verified', 'is_staff')
    list_filter = ('user_type', 'is_verified', 'is_staff')
    search_fields = ('username', 'email', 'mobile')
    
    fieldsets = UserAdmin.fieldsets + (
        ("Additional Info", {
            "fields": (
                "mobile",
                "full_name",
                "user_type",
                "institution",
                "year",
                "department",
                "id_number",
                "photo",
                "is_verified",
                "otp",
                "otp_created_at",
            )
        }),
    )

# Register the User model
admin.site.register(User, CustomUserAdmin)

# Register all other models
admin.site.register(Vehicle)
admin.site.register(Ride)
admin.site.register(RideRequest)
admin.site.register(Notification)
admin.site.register(ChatMessage)
admin.site.register(EmailVerification)
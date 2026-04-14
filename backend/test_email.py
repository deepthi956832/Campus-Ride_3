import os
import django
from django.core.mail import send_mail
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

def test_smtp():
    print(f"Testing SMTP with user: {settings.EMAIL_HOST_USER}")
    try:
        send_mail(
            'Campus Ride SMTP Test',
            'This is a test email to verify SMTP configuration.',
            settings.DEFAULT_FROM_EMAIL,
            ['vamsikrishnamanukonda143@gmail.com'],
            fail_silently=False,
        )
        print("✅ Email sent successfully!")
    except Exception as e:
        print(f"❌ SMTP Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_smtp()

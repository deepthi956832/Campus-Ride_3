import random
from django.core.mail import send_mail
from django.conf import settings
from django.utils.html import strip_tags
from django.utils import timezone

def generate_otp():
    """Generate a 6-digit numeric OTP."""
    return str(random.randint(100000, 999999))

def send_verification_email(email, full_name, otp):
    """Sends a verification email for new registration."""
    print(f"\n--- DEBUG OTP for {email}: {otp} ---\n")
    
    subject = 'Verify your Campus Ride account'
    html_message = f"""
    <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
        <h2 style="color: #4F46E5;">Welcome to Campus Ride, {full_name}!</h2>
        <p>Your 6-digit verification code is:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4F46E5; margin: 20px 0;">
            {otp}
        </div>
        <p style="color: #6B7280; font-size: 14px;">This code will expire in 10 minutes.</p>
        <p style="color: #6B7280; font-size: 12px;">If you did not create an account, please ignore this email.</p>
    </div>
    """
    plain_message = f"Your verification code is: {otp}. It expires in 10 minutes."
    
    send_mail(
        subject,
        plain_message,
        settings.DEFAULT_FROM_EMAIL,
        [email],
        html_message=html_message,
        fail_silently=False,
    )

def send_password_reset_email(user):
    otp = generate_otp()
    user.otp = otp
    user.otp_created_at = timezone.now()
    user.save()
    print(f"\n--- DEBUG OTP for {user.email} (RESET): {otp} ---\n")
    
    subject = 'Reset your Campus Ride password'
    html_message = f"""
    <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
        <h2 style="color: #4F46E5;">Password Reset Request</h2>
        <p>Hello {user.full_name or user.username},</p>
        <p>Your 6-digit password reset code is:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4F46E5; margin: 20px 0;">
            {otp}
        </div>
        <p style="color: #6B7280; font-size: 14px;">This code will expire in 10 minutes.</p>
        <p style="color: #6B7280; font-size: 12px;">If you did not request a password reset, please ignore this email.</p>
    </div>
    """
    plain_message = f"Your password reset code is: {otp}. It expires in 10 minutes."
    
    send_mail(
        subject,
        plain_message,
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        html_message=html_message,
        fail_silently=False,
    )

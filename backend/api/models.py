from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    USER_TYPE_CHOICES = (
        ('student', 'Student'),
        ('employee', 'Employee'),
    )
    mobile = models.CharField(max_length=15, unique=True, blank=True, null=True)
    full_name = models.CharField(max_length=255, blank=True, null=True)
    user_type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES)
    institution = models.CharField(max_length=255)
    year = models.CharField(max_length=50, blank=True, null=True)
    department = models.CharField(max_length=100, blank=True, null=True)
    id_number = models.CharField(max_length=100, blank=True, null=True)
    photo = models.TextField(blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    otp = models.CharField(max_length=6, blank=True, null=True)
    otp_created_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.username

class Vehicle(models.Model):
    VEHICLE_TYPE_CHOICES = (
        ('car', 'Car'),
        ('bike', 'Bike'),
    )
    model = models.CharField(max_length=100)
    number = models.CharField(max_length=100)
    vehicle_type = models.CharField(max_length=10, choices=VEHICLE_TYPE_CHOICES)

    def __str__(self):
        return f"{self.model} ({self.number})"

class Ride(models.Model):
    RIDE_STATUS_CHOICES = (
        ('open', 'Open'),
        ('confirmed', 'Confirmed'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    )
    poster = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posted_rides')
    from_location = models.CharField(max_length=255)
    to_location = models.CharField(max_length=255)
    vehicle_model = models.CharField(max_length=100)
    vehicle_number = models.CharField(max_length=100)
    vehicle_type = models.CharField(max_length=10, choices=(('car', 'Car'), ('bike', 'Bike')))
    total_seats = models.PositiveIntegerField()
    date = models.DateField()
    time = models.TimeField()
    status = models.CharField(max_length=10, choices=RIDE_STATUS_CHOICES, default='open')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Ride from {self.from_location} to {self.to_location} by {self.poster.username}"

class RideRequest(models.Model):
    REQUEST_STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    )
    ride = models.ForeignKey(Ride, on_delete=models.CASCADE, related_name='requests')
    requester = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ride_requests')
    status = models.CharField(max_length=10, choices=REQUEST_STATUS_CHOICES, default='pending')
    message = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Request for {self.ride} from {self.requester.username}"

class Notification(models.Model):
    NOTIFICATION_TYPE_CHOICES = (
        ('ride_request', 'Ride Request'),
        ('ride_accepted', 'Ride Accepted'),
        ('ride_rejected', 'Ride Rejected'),
        ('ride_reminder', 'Ride Reminder'),
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    type = models.CharField(max_length=20, choices=NOTIFICATION_TYPE_CHOICES)
    title = models.CharField(max_length=255)
    message = models.TextField()
    read = models.BooleanField(default=False)
    ride = models.ForeignKey(Ride, on_delete=models.SET_NULL, null=True, blank=True)
    request = models.ForeignKey(RideRequest, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notification for {self.user.username}: {self.title}"

class ChatMessage(models.Model):
    ride = models.ForeignKey(Ride, on_delete=models.CASCADE, related_name='chat_messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Message from {self.sender.username} to {self.receiver.username}"

class EmailVerification(models.Model):
    email = models.EmailField(unique=True)
    otp = models.CharField(max_length=6)
    user_data = models.JSONField() # Store all registration fields
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Registration OTP for {self.email}"

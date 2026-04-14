from django.db.models import Q
from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django.utils import timezone
from datetime import timedelta
from django.shortcuts import get_object_or_404
from .models import User, Ride, RideRequest, Notification, ChatMessage, EmailVerification
from .serializers import (
    UserSerializer, RideSerializer, RideRequestSerializer, 
    NotificationSerializer, ChatMessageSerializer,
    CustomTokenObtainPairSerializer
)
from .utils import send_verification_email, send_password_reset_email, generate_otp

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def register(self, request):
        data = request.data.copy()
        email = data.get('email')
        mobile = data.get('mobile')
        
        # Check if user already exists
        if email and User.objects.filter(email=email).exists():
            return Response({'error': 'A user with this email already exists.'}, status=status.HTTP_400_BAD_REQUEST)
        if mobile and User.objects.filter(mobile=mobile).exists():
            return Response({'error': 'A user with this mobile number already exists.'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not all([data.get('full_name'), data.get('user_type'), data.get('institution'), data.get('department'), data.get('id_number')]):
            return Response({'error': 'All mandatory fields must be filled.'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not email:
            return Response({'error': 'Email is required for registration.'}, status=status.HTTP_400_BAD_REQUEST)

        # Generate OTP
        otp = generate_otp()
        
        # Store registration data in EmailVerification (update if exists)
        EmailVerification.objects.update_or_create(
            email=email,
            defaults={
                'otp': otp,
                'user_data': data,
                'created_at': timezone.now()
            }
        )
        
        # Send verification email
        try:
            full_name = data.get('full_name', 'User')
            send_verification_email(email, full_name, otp)
        except Exception as e:
            print(f"Email sending failed: {e}")
            return Response({'error': 'Failed to send verification email. Please check your email configuration.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        return Response({
            'message': 'OTP sent successfully. Please check your email.',
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def resend_register_otp(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)
            
        verification = EmailVerification.objects.filter(email=email).first()
        if not verification:
            return Response({'error': 'No registration request found for this email.'}, status=status.HTTP_404_NOT_FOUND)
            
        # Generate new OTP
        otp = generate_otp()
        verification.otp = otp
        verification.created_at = timezone.now()
        verification.save()
        
        try:
            full_name = verification.user_data.get('full_name', 'User')
            send_verification_email(email, full_name, otp)
        except Exception as e:
            print(f"Email sending failed: {e}")
            return Response({'error': 'Failed to send email.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        return Response({'message': 'New OTP sent successfully.'}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def verify_otp(self, request):
        email = request.data.get('email')
        otp = request.data.get('otp')
        purpose = request.data.get('purpose')
        
        # Password reset verification
        if purpose == 'password_reset':
            user = User.objects.filter(email=email).first()
            if not user:
                return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
            if user.otp_created_at and timezone.now() > user.otp_created_at + timedelta(minutes=10):
                return Response({'error': 'OTP has expired.'}, status=status.HTTP_400_BAD_REQUEST)
            if user.otp == otp:
                return Response({'message': 'OTP verified successfully!'}, status=status.HTTP_200_OK)
            return Response({'error': 'Invalid OTP code.'}, status=status.HTTP_400_BAD_REQUEST)
            
        # Registration verification
        verification = EmailVerification.objects.filter(email=email).first()
        if not verification:
            return Response({'error': 'No registration request found for this email.'}, status=status.HTTP_404_NOT_FOUND)
            
        # Check expiry
        if timezone.now() > verification.created_at + timedelta(minutes=10):
            return Response({'error': 'OTP has expired. Please register again.'}, status=status.HTTP_400_BAD_REQUEST)
            
        if verification.otp == otp:
            # Create the actual user
            data = verification.user_data
            
            # Prepare username for AbstractUser
            if not data.get('username'):
                data['username'] = data.get('mobile') or data.get('email')
            
            # Standard cleanup
            if data.get('mobile') == "": data['mobile'] = None
            if data.get('email') == "": data['email'] = None
            
            serializer = self.get_serializer(data=data)
            if serializer.is_valid():
                user = serializer.save()
                user.is_verified = True
                user.save()
                
                # Delete verification entry
                verification.delete()
                
                return Response({
                    'message': 'Account verified and created successfully!',
                    'user': UserSerializer(user).data
                }, status=status.HTTP_201_CREATED)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'error': 'Invalid OTP code.'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def forgot_password(self, request):
        email = request.data.get('email', '').strip()
        user = User.objects.filter(email__iexact=email).first()
        if user:
            try:
                send_password_reset_email(user)
            except Exception as e:
                print(f"Password reset email failed: {e}")
                return Response({'error': 'Failed to send reset email. Please try again later.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        # Always return 200 for security to avoid email enumeration
        return Response({'message': 'If an account exists with this email, a reset link has been sent.'}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def reset_password_otp(self, request):
        email = request.data.get('email')
        otp = request.data.get('otp')
        new_password = request.data.get('password')
        
        user = User.objects.filter(email=email).first()
        if not user:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
            
        # Check expiry (10 minutes)
        if user.otp_created_at and timezone.now() > user.otp_created_at + timedelta(minutes=10):
            return Response({'error': 'OTP has expired. Please request a new one.'}, status=status.HTTP_400_BAD_REQUEST)
            
        if user.otp == otp:
            user.set_password(new_password)
            user.otp = None # Clear OTP after success
            user.save()
            return Response({'message': 'Password reset successful!'}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Invalid OTP code.'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

class RideViewSet(viewsets.ModelViewSet):
    queryset = Ride.objects.all()
    serializer_class = RideSerializer

    def get_queryset(self):
        # Lazy expiry logic: move past rides to 'completed'
        now = timezone.now()
        # Find rides that are still open/confirmed but are in the past
        # Filter by date then filter by time if the date is today
        past_rides = Ride.objects.filter(
            Q(status='open') | Q(status='confirmed')
        ).filter(
            Q(date__lt=now.date()) | Q(date=now.date(), time__lt=now.time())
        )
        
        if past_rides.exists():
            past_rides.update(status='completed')
            
        return Ride.objects.all().order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(poster=self.request.user)

    @action(detail=True, methods=['post'])
    def request_join(self, request, pk=None):
        ride = self.get_object()
        if ride.poster == request.user:
            return Response({'error': 'Cannot join your own ride'}, status=status.HTTP_400_BAD_REQUEST)
        
        ride_request, created = RideRequest.objects.get_or_create(
            ride=ride, 
            requester=request.user,
            defaults={'status': 'pending'}
        )
        
        if not created:
            return Response({'message': 'Request already exists'}, status=status.HTTP_200_OK)
        
        # Create notification for the poster
        Notification.objects.create(
            user=ride.poster,
            type='ride_request',
            title='New Ride Request!',
            message=f"{request.user.full_name} wants to join your ride from {ride.from_location} to {ride.to_location}.",
            ride=ride,
            request=ride_request
        )
        
        return Response(RideRequestSerializer(ride_request).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def cancel_ride(self, request, pk=None):
        ride = self.get_object()
        if ride.poster != request.user:
            return Response({'error': 'Only the poster can cancel the ride.'}, status=status.HTTP_403_FORBIDDEN)
        
        if ride.status == 'cancelled':
            return Response({'message': 'Ride already cancelled.'}, status=status.HTTP_200_OK)
        
        ride.status = 'cancelled'
        ride.save()
        
        # Get all requests for this ride
        active_requests = ride.requests.filter(status__in=['pending', 'accepted'])
        
        for ride_req in active_requests:
            # Create notification for each requester
            Notification.objects.create(
                user=ride_req.requester,
                type='ride_rejected',
                title='⚠️ Ride Cancelled',
                message=f"The ride from {ride.from_location} to {ride.to_location} has been cancelled by the poster.",
                ride=ride
            )
            
        return Response({'message': 'Ride cancelled successfully.'})

class RideRequestViewSet(viewsets.ModelViewSet):
    queryset = RideRequest.objects.all()
    serializer_class = RideRequestSerializer

    @action(detail=True, methods=['post'])
    def respond(self, request, pk=None):
        ride_request = self.get_object()
        if ride_request.ride.poster != request.user:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        
        status_val = request.data.get('status')
        if status_val not in ['accepted', 'rejected']:
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check availability BEFORE accepting
        if status_val == 'accepted':
            ride = ride_request.ride
            # Check if this request is already accepted to avoid double-counting
            if ride_request.status == 'accepted':
                return Response({'message': 'Already accepted'}, status=status.HTTP_200_OK)
                
            accepted_count = ride.requests.filter(status='accepted').count()
            if accepted_count >= ride.total_seats:
                return Response({'error': 'No seats available for this ride.'}, status=status.HTTP_400_BAD_REQUEST)
            
            # If this becomes the last seat, update ride status to confirmed
            if accepted_count + 1 == ride.total_seats:
                ride.status = 'confirmed'
                ride.save()
        
        ride_request.status = status_val
        ride_request.save()
        
        # Create notification for the requester
        Notification.objects.create(
            user=ride_request.requester,
            type='ride_accepted' if status_val == 'accepted' else 'ride_rejected',
            title='🎉 Ride Accepted!' if status_val == 'accepted' else '❌ Ride Rejected',
            message=f"{request.user.full_name} {'accepted' if status_val == 'accepted' else 'rejected'} your ride request from {ride_request.ride.from_location} to {ride_request.ride.to_location}.",
            ride=ride_request.ride,
            request=ride_request
        )
        
        return Response(RideRequestSerializer(ride_request).data)

class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        Notification.objects.filter(user=request.user, read=False).update(read=True)
        return Response({'status': 'ok'})

class ChatMessageViewSet(viewsets.ModelViewSet):
    queryset = ChatMessage.objects.all()
    serializer_class = ChatMessageSerializer

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)

    @action(detail=False, methods=['get'])
    def conversation(self, request):
        ride_id = request.query_params.get('ride_id')
        messages = ChatMessage.objects.filter(ride_id=ride_id).order_by('created_at')
        return Response(ChatMessageSerializer(messages, many=True).data)

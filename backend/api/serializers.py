from django.db.models import Q
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User, Ride, RideRequest, Notification, ChatMessage

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'full_name', 'email', 'mobile', 'password', 'user_type', 'institution', 'year', 'department', 'id_number', 'photo', 'created_at')

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        identifier = attrs.get("username", "").strip()
        password = attrs.get("password")

        # Robust lookup: Check username, email, or mobile (case-insensitive)
        user = User.objects.filter(
            Q(username__iexact=identifier) | 
            Q(email__iexact=identifier) | 
            Q(mobile__iexact=identifier)
        ).first()

        if user:
            # Standardize on the actual DB username for the authenticate() call
            attrs["username"] = user.username

        data = super().validate(attrs)
        
        if not self.user.is_verified:
            raise serializers.ValidationError('Your email is not verified. Please check your inbox.')
        return data

class RideSerializer(serializers.ModelSerializer):
    poster_name = serializers.ReadOnlyField(source='poster.full_name')
    poster_type = serializers.ReadOnlyField(source='poster.user_type')
    poster_institution = serializers.ReadOnlyField(source='poster.institution')
    poster_photo = serializers.ReadOnlyField(source='poster.photo')
    vehicle = serializers.JSONField(required=False)
    seats_available = serializers.SerializerMethodField()

    class Meta:
        model = Ride
        fields = ('id', 'poster', 'poster_name', 'poster_type', 'poster_institution', 'poster_photo', 'from_location', 'to_location', 'vehicle', 'total_seats', 'seats_available', 'date', 'time', 'status', 'created_at')
        read_only_fields = ('poster', 'created_at')

    def get_seats_available(self, obj):
        accepted_count = obj.requests.filter(status='accepted').count()
        return max(0, obj.total_seats - accepted_count)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['vehicle'] = {
            'model': instance.vehicle_model,
            'number': instance.vehicle_number,
            'type': instance.vehicle_type
        }
        return data

    def create(self, validated_data):
        vehicle = validated_data.pop('vehicle', {})
        if vehicle:
            validated_data['vehicle_model'] = vehicle.get('model')
            validated_data['vehicle_number'] = vehicle.get('number')
            validated_data['vehicle_type'] = vehicle.get('type')
        return super().create(validated_data)

    def update(self, instance, validated_data):
        vehicle = validated_data.pop('vehicle', {})
        if vehicle:
            instance.vehicle_model = vehicle.get('model', instance.vehicle_model)
            instance.vehicle_number = vehicle.get('number', instance.vehicle_number)
            instance.vehicle_type = vehicle.get('type', instance.vehicle_type)
        return super().update(instance, validated_data)

class RideRequestSerializer(serializers.ModelSerializer):
    requester_name = serializers.ReadOnlyField(source='requester.full_name')
    requester_photo = serializers.ReadOnlyField(source='requester.photo')
    requester_type = serializers.ReadOnlyField(source='requester.user_type')
    ride_details = serializers.SerializerMethodField()

    class Meta:
        model = RideRequest
        fields = ('id', 'ride', 'requester', 'requester_name', 'requester_photo', 'requester_type', 'status', 'message', 'created_at', 'ride_details')
        read_only_fields = ('requester', 'created_at')

    def get_ride_details(self, obj):
        return {
            'from_location': obj.ride.from_location,
            'to_location': obj.ride.to_location,
            'date': obj.ride.date,
            'time': obj.ride.time,
        }

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
        read_only_fields = ('user', 'created_at')

class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = '__all__'
        read_only_fields = ('sender', 'created_at')

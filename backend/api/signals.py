from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Ride, RideRequest, ChatMessage, Notification
from core.sockets import emit_event

@receiver(post_save, sender=Ride)
def ride_post_save(sender, instance, created, **kwargs):
    if created:
        emit_event('new_ride', {
            'id': instance.id,
            'from': instance.from_location,
            'to': instance.to_location,
            'poster': instance.poster.username
        })

@receiver(post_save, sender=RideRequest)
def request_post_save(sender, instance, created, **kwargs):
    if created:
        emit_event('new_request', {
            'id': instance.id,
            'ride_id': instance.ride.id,
            'requester': instance.requester.username,
            'owner_id': instance.ride.poster.id
        })
    elif instance.status == 'accepted':
        emit_event('ride_accepted', {
            'id': instance.id,
            'ride_id': instance.ride.id,
            'requester_id': instance.requester.id
        })

@receiver(post_save, sender=ChatMessage)
def message_post_save(sender, instance, created, **kwargs):
    if created:
        emit_event('new_message', {
            'id': instance.id,
            'ride_id': instance.ride.id,
            'sender_id': instance.sender.id,
            'receiver_id': instance.receiver.id,
            'text': instance.text
        })

@receiver(post_save, sender=Notification)
def notification_post_save(sender, instance, created, **kwargs):
    if created:
        emit_event('new_notification', {
            'id': instance.id,
            'user_id': instance.user.id,
            'title': instance.title,
            'message': instance.message
        })

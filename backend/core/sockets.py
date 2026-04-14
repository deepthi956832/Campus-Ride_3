import socketio
import os

# Create a Socket.IO server
# Using eventlet for better concurrency and stability
mgr = socketio.Server(cors_allowed_origins="*", async_mode='eventlet')

def get_socketio_app(django_app):
    return socketio.WSGIApp(mgr, django_app)

@mgr.event
def connect(sid, environ):
    print(f'Socket connected: {sid}')

@mgr.event
def disconnect(sid):
    print(f'Socket disconnected: {sid}')

# Helper to emit from anywhere
def emit_event(event, data):
    print(f"Emitting {event}: {data}")
    mgr.emit(event, data)

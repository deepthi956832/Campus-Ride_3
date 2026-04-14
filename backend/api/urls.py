from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)
from .views import (
    UserViewSet, RideViewSet, RideRequestViewSet, 
    NotificationViewSet, ChatMessageViewSet,
    CustomTokenObtainPairView
)

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'rides', RideViewSet)
router.register(r'requests', RideRequestViewSet)
router.register(r'notifications', NotificationViewSet)
router.register(r'chats', ChatMessageViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

from django.urls import path
from .views import RegisterView, LoginView, SSOSyncView, UserMeView # Dodano UserMeView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('sso/sync/', SSOSyncView.as_view(), name='sso_sync'),
    path('me/', UserMeView.as_view(), name='user_me'), # NOWY ENDPOINT
]
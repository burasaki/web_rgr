from django.urls import path
from .views import RegisterView, UserUpdateView, stream_video, get_chat_history, login_user

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/me/', UserUpdateView.as_view(), name='user_me'),
    path('video/stream/<int:video_id>/', stream_video, name='stream_video'),
    path('chat/history/', get_chat_history, name='chat_history'),
    path('auth/login/', login_user, name='login_user'),
    path('auth/user/update/', UserUpdateView.as_view(), name='user_update'),
]

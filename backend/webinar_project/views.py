import os
import re
from django.http import StreamingHttpResponse
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Video, User, ChatMessage
from .serializers import RegisterSerializer, UserSerializer
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.decorators import api_view, permission_classes
from django.shortcuts import get_object_or_404


@api_view(['GET'])
@permission_classes([AllowAny])
def get_chat_history(request):
    messages = ChatMessage.objects.select_related('user').order_by('created_at')[:50]
    data = []
    for msg in messages:
        data.append({
            'id': msg.id,
            'chat_name': msg.user.chat_name or msg.user.first_name,
            'text': msg.text,
            'likes': msg.likes_count,
            # Передаем массив ID пользователей, которые лайкнули, чтобы фронтенд знал, подсвечивать ли сердечко
            'liked_by_ids': list(msg.liked_by.values_list('id', flat=True)),
            'is_question': msg.is_question
        })
    return Response(data)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    email = request.data.get('email')
    if not email:
        return Response({'detail': 'Email обязателен для заполнения'}, status=400)
    
    # Ищем пользователя по email, если его нет — отдаем 404
    user = get_object_or_404(User, email=email)
    
    # Генерируем новый токен для существующего пользователя
    refresh = RefreshToken.for_user(user)
    return Response({
        'token': str(refresh.access_token),
        'user': {
            'id': user.id,
            'email': user.email,
            'first_name': user.first_name,
            'chat_name': user.chat_name or user.first_name
        }
    })

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print("!!! ОШИБКА ВАЛИДАЦИИ БЭКЕНДА:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

class UserUpdateView(generics.RetrieveUpdateAPIView):
    # Указываем, что доступ разрешен только с валидным JWT-токеном
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        # Контроллер автоматически вернет объект текущего авторизованного пользователя
        return self.request.user

# Потоковое воспроизведение видео (HTTP 206 Partial Content)
def stream_video(request, video_id):
    video = generics.get_object_or_404(Video, id=video_id)
    path = video.file.path
    size = os.path.getsize(path)
    
    range_header = request.META.get('HTTP_RANGE', '').strip()
    range_match = re.match(r'bytes=(\d+)-(\d*)', range_header)
    
    first_byte, last_byte = 0, size - 1
    if range_match:
        first_byte = int(range_match.group(1))
        if range_match.group(2):
            last_byte = int(range_match.group(2))
            
    chunk_size = last_byte - first_byte + 1
    
    def file_iterator(file_name, offset, length):
        with open(file_name, 'rb') as f:
            f.seek(offset)
            remaining = length
            while remaining > 0:
                chunk = f.read(min(remaining, 8192))
                if not chunk:
                    break
                remaining -= len(chunk)
                yield chunk

    response = StreamingHttpResponse(file_iterator(path, first_byte, chunk_size), status=206, content_type='video/mp4')
    response['Content-Length'] = str(chunk_size)
    response['Content-Range'] = f'bytes {first_byte}-{last_byte}/{size}'
    response['Accept-Ranges'] = 'bytes'
    return response

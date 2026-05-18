import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from django.urls import path
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

django_asgi_app = get_asgi_application()


from webinar_project.consumers import ChatConsumer

application = ProtocolTypeRouter({
    # Обычные HTTP-запросы
    "http": django_asgi_app,
    
    # WebSocket-соединения
    "websocket": URLRouter([
        path("ws/chat/", ChatConsumer.as_asgi()),
    ]),
})

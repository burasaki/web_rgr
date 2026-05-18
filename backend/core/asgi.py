"""
ASGI config for core project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/6.0/howto/deployment/asgi/
"""

import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from django.urls import path
from webinar_project.consumers import ChatConsumer

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

# Инициализируем стандартное HTTP приложение Django
django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter({
    # Обычные HTTP запросы идут в стандартный Django
    "http": django_asgi_app,
    
    # WebSocket запросы маршрутизируются в наш ChatConsumer
    "websocket": URLRouter([
        path("ws/chat/", ChatConsumer.as_asgi()),
    ]),
})

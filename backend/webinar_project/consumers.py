import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import ChatMessage, User

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = "webinar_room"
        await self.channel_layer.group_add(self.room_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        action = data.get('action')

        if action == 'message':
            # Считываем флаг из запроса фронтенда (по умолчанию False)
            is_question = data.get('is_question', False)
            msg_data = await self.create_message(data['user_id'], data['text'], is_question)
            await self.channel_layer.group_send(self.room_name, {
                'type': 'chat_message', **msg_data
            })
            
        elif action == 'like':
            like_data = await self.toggle_like(data['msg_id'], data['user_id'])
            await self.channel_layer.group_send(self.room_name, {
                'type': 'message_liked', **like_data
            })

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'action': 'message', 'id': event['id'], 'chat_name': event['chat_name'], 
            'text': event['text'], 'likes': event['likes'], 'liked_by_ids': event['liked_by_ids'],
            'is_question': event['is_question']
        }))

    async def message_liked(self, event):
        await self.send(text_data=json.dumps({
            'action': 'like', 'msg_id': event['msg_id'], 'likes': event['likes'], 'liked_by_ids': event['liked_by_ids']
        }))

    @database_sync_to_async
    def create_message(self, user_id, text, is_question):
        user = User.objects.get(id=user_id)
        msg = ChatMessage.objects.create(user=user, text=text, is_question=is_question)
        return {
            'id': msg.id, 'chat_name': user.chat_name or user.first_name, 'text': msg.text, 
            'likes': 0, 'liked_by_ids': [], 'is_question': msg.is_question
        }

    @database_sync_to_async
    def toggle_like(self, msg_id, user_id):
        msg = ChatMessage.objects.get(id=msg_id)
        user = User.objects.get(id=user_id)
        if msg.liked_by.filter(id=user.id).exists():
            msg.liked_by.remove(user)
        else:
            msg.liked_by.add(user)
        return {
            'msg_id': msg.id, 'likes': msg.likes_count, 'liked_by_ids': list(msg.liked_by.values_list('id', flat=True))
        }

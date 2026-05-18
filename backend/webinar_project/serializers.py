from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'chat_name']
        read_only_fields = ['email']

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['email', 'first_name', 'last_name', 'username']

    def validate_email(self, value):
        # Проверяем, нет ли уже пользователя с таким email
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Пользователь с такой электронной почтой уже зарегистрирован.")
        return value

    def create(self, validated_data):
        # Создаем пользователя через специальный метод, чтобы он корректно записался в БД
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name']
        )
        return user

    def to_representation(self, instance):
        refresh = RefreshToken.for_user(instance)
        return {
            'token': str(refresh.access_token),
            'user': {
                'id': instance.id,
                'email': instance.email,
                'first_name': instance.first_name,
                'last_name': instance.last_name,
                'chat_name': instance.chat_name or instance.first_name
            }
        }

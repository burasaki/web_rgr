# РГЗ по теме: «Создание тестовой видеоплатформы с использованием технологий Python для бэкенда, React JS для фронтенда и Figma для дизайна»


* **Ссылка на сайт** [https://web-rgr.vercel.app](https://web-rgr.vercel.app)

## Cтек

### Frontend
* **Библиотека:** React (VITE)
* **Архитектура:** SPA, компонентный подход, CSS-модули
* **Управление состоянием:** React Context API (авторизационные сессии, синхронизация с LocalStorage)
* **Хостинг:** Vercel

### Backend
* **Фреймворк:** Django 6.0 + Django REST Framework (DRF)
* **Авторизация:** Беспарольная сессия на базе JWT-токенов (SimpleJWT)
* **Хостинг:** Render (+ WhiteNoise для раздачи статики)

## Инструкция по локальному развертыванию

### Развертывание Backend

1. **Клонируйте репозиторий и перейдите в папку сервера:**
   ```bash
   git clone <url-репозитория>
   cd backend

**Создайте и активируйте виртуальное окружение:**

```bash
    python -m venv venv
    # Для Windows:
    venv\Scripts\activate
    # Для macOS/Linux:
    source venv/bin/activate
```
**Установите зависимости проекта:**

```bash
pip install -r requirements.txt
```
**Выполните миграции базы данных:**

```bash
python manage.py migrate
```
**Запустите сервер разработки (ASGI):**

```bash
python manage.py runserver
```
**Сервер запустится по адресу http://127.0.0.1:8000/**

### Развертывание Frontend
**Перейдите в папку клиентской части:**

```bash
cd ../frontend
```
**Установите Node-зависимости:**

```bash
npm install
```
**Создайте файл конфигурации окружения .env в корне фронтенда:**

```
VITE_API_URL=[http://127.0.0.1:8000/api](http://127.0.0.1:8000/api)
VITE_WS_URL=ws://127.0.0.1:8000/ws/chat/
```
**Запустите локальный сервер Vite:**

```bash
npm run dev
```
## Спецификация серверного API
### 1. HTTP REST API эндпоинты
Регистрация аккаунта
URL: /api/auth/register/
Метод: POST
Тело запроса (JSON):
```JSON
{
  "email": "user@yadro.ru",
  "first_name": "Иван",
  "last_name": "Иванов",
  "username": "user@yadro.ru"
}
```
Ответ (201 Created):

```JSON
{
  "token": "eyJhbGciOiJIUzI1Ni...",
  "user": { "id": 1, "email": "user@yadro.ru", "first_name": "Иван", "last_name": "Иванов", "chat_name": "" }
}
```
Вход в систему (Авторизация)
URL: /api/auth/login/
Метод: POST
Тело запроса (JSON):

```JSON
{ "email": "user@yadro.ru" }
```
Ответ (200 OK): Возвращает JWT-токен и базовый профиль пользователя.

Профиль пользователя (Получение / Изменение)
URL: /api/auth/user/update/

Метод: GET / PATCH

Заголовок авторизации: Authorization: Bearer <JWT_TOKEN>

Параметры изменения (PATCH JSON):

```JSON
{ "chat_name": "Иван (Разработчик)" }
```
Архив сообщений чата
URL: /api/chat/history/

Метод: GET

Ответ (200 OK): Возвращает массив из последних 50 сообщений, сохраненных в БД, включая счетчики лайков и флаги вопросов спикеру.

Видео-стриминг вебинара
URL: /api/video/stream/<int:video_id>/

Метод: GET

Особенность: Поддерживает частичную передачу данных чанками на основании HTTP-заголовка Range, отдавая статус 206 Partial Content.

### 2. Протокол обмена WebSocket (Интерактивное взаимодействие)
Адрес для сетевого сокет-подключения: wss://web-rgr.onrender.com/ws/chat/

Обмен данными происходит асинхронно через структуры сообщений в формате JSON.

А. Отправка нового сообщения пользователем (Клиент ➔ Сервер)
```JSON
{
  "action": "message",
  "user_id": 1,
  "text": "Будет ли выложена презентация в репозиторий?",
  "is_question": true
}
```
Б. Вещание нового сообщения (Сервер ➔ Все участники вебинара)
```JSON
{
  "action": "message",
  "id": 45,
  "chat_name": "Иван Иванов",
  "text": "Будет ли выложена презентация в репозиторий?",
  "likes": 0,
  "liked_by_ids": [],
  "is_question": true
}
```
В. Тогглинг лайка на сообщении (Клиент ➔ Сервер)
```JSON
{
  "action": "like",
  "msg_id": 45,
  "user_id": 1
}
```
Г. Синхронизация счетчиков лайков (Сервер ➔ Все участники вебинара)
```JSON
{
  "action": "like",
  "msg_id": 45,
  "likes": 1,
  "liked_by_ids": [1]
}
```
## Настройки безопасности (CORS / CSRF / Сессии)
Для обеспечения стабильного кросс-доменного соединения между сервером на Render и клиентом на Vercel, в settings.py бэкенда зафиксированы жесткие правила безопасности:

Защита POST и PATCH методов обеспечивается через регистрацию доменов в CSRF_TRUSTED_ORIGINS.

Разрешена передача JWT-токенов внутри кастомных заголовков благодаря установке флага CORS_ALLOW_CREDENTIALS = True.

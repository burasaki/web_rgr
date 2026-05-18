FROM python:3.12-slim
RUN apt-get update && apt-get install -y --no-install-recommends gcc python3-dev && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
RUN python manage.py collectstatic --noinput
EXPOSE 10000

CMD python manage.py migrate --noinput && \
    python manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.filter(email='admin@mail.com').exists() or User.objects.create_superuser('admin@mail.com', 'admin@mail.com', 'AdminPassword123', first_name='Администратор')" && \
    daphne -u /tmp/daphne.sock -b 0.0.0.0 -p 10000 core.asgi:application
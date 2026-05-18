FROM python:3.12-slim
RUN apt-get update && apt-get install -y --no-install-recommends gcc python3-dev && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
RUN python manage.py collectstatic --noinput
EXPOSE 10000
CMD ["daphne", "-b", "0.0.0.0", "-p", "10000", "core.asgi:application"]

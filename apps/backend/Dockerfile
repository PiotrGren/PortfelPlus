FROM python:3.12-slim

# Ustawiamy zmienne środowiskowe:
# 1. Zapobiega tworzeniu plików .pyc (oszczędność miejsca)
# 2. Wysyła logi prosto do terminala (ważne przy debugowaniu w chmurze np. Render)
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Ustawiamy katalog roboczy wewnątrz kontenera
WORKDIR /app

# Instalujemy zależności systemowe (często wymagane przez PostgreSQL i kompilację pakietów)
RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Kopiujemy plik z wymaganymi pakietami i instalujemy je
COPY requirements.txt .
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Kopiujemy cały folder kodu źródłowego do kontenera
COPY src/ /app/src/

# Informujemy, że kontener nasłuchuje na porcie 8000
EXPOSE 8000

# Domyślna komenda do uruchomienia aplikacji (w trybie dev)
# Pamiętaj: w produkcji (chmurze) zaleca się zamianę tej linijki na serwer Gunicorn, np.:
# CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--chdir", "/app/src", "core.wsgi:application"]
CMD ["python", "src/manage.py", "runserver", "0.0.0.0:8000"]
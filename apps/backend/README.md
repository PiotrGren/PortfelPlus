# Portfel+ (Backend)

Ten folder zawiera kod backendu oparty na frameworku Django oraz Django REST Framework.

## Wymagania
- Python 3.12+
- Baza danych PostgreSQL (lub tymczasowo domyślny SQLite do wczesnego devu)

## Jak uruchomić projekt lokalnie?

Za każdym razem, gdy pracujesz nad kodem backendu lub chcesz uruchomić i przetestować środowisko, wykonaj poniższe kroki w terminalu.

### 1. Przejdź do folderu backendu
Upewnij się, że jesteś w odpowiednim katalogu:
```bash
cd apps/backend
```

### 2. Aktywuj środowisko wirtualne
Zanim cokolwiek uruchmisz, musisz aktuywować izolowane środowisko `venv`.

#### Na Linux / MacOS:
```bash
source venv/bin/activate
```

#### Na Windows (CMD):
```dos
venv\Scripts\activate
```

*(Po poprawnej aktywacji powinieneś zobaczyć `(venv)` z lewej strony terminala).*

### 3. Zainstaluj zależności (jeśli ktoś dodał nowe pakiety lub robisz to pierwszy raz)
Zawsze warto upewnić się, że masz aktualne pakiety z pliku `requirements.txt`:
```bash
pip install -r requirements.txt
```

### 4. Zmienne środowiskoe `(.env)`
W folderze `src/` (lub w głównym folderze backendu – zależnie od ostatecznej konfiguracji settings.py) utwórz plik `.env` (np. URL do bazy danych, sekrety do JWT). Ten plik jest ignorowany przez Gita!

### 5. Wykonaj migracje bazy danych
Jeśli pojawiły się nowe modele, zaktualizuj bazę danych:
```bash
cd src
python manage.py makemigrations
python manage.pt migrate
```

### 6. Uruchom serwer developerski
Z poziomu folderu `src/` (tam gdzie znajduje się plik `manage.py`) odpal serwer:
```bash
python manage.py runserver
```

API będzie dostępne pod adresem: `http://localhost:8000` lub `http://127.0.0.1:8000`.

### Zakończenie pracy

Kiedy skończysz programować, możesz wyjść ze środowiska wirtualnego komendą `deactivate`.
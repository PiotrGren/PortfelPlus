# 📑 Kontrakt API - Portfel+ (Finances & Profile)

Wszystkie zapytania (oprócz logowania/rejestracji) wymagają nagłówka uwierzytelniającego:
`Authorization: Bearer <access_token>`

---

## 1. Profil Użytkownika & Ustawienia Konta
### Pobieranie profilu i preferowanej waluty
* **URL:** `/api/auth/me/`
* **Metoda:** `GET`
* **Response (200 OK):**
```json
{
    "id": 1,
    "email": "user@example.com",
    "first_name": "Piotr",
    "last_name": "Greń",
    "full_name": "Piotr Greń",
    "nickname": "Piotrek",
    "phone": "+48123456789",
    "preferred_currency": 2,
    "currency_details": {
        "id": 2,
        "code": "USD",
        "name": "Dolar Amerykański",
        "symbol": "$"
    }
}
```

### Personalizacja danych i zmiana waluty
* **URL:** `/api/auth/me/`
* **Metoda:** `PATCH`
* **Payload** (Wszystkie pola są opcjonalne - przesyłasz tylko to, co zmieniasz):
```json
{
    "nickname": "NowyNick",
    "preferred_currency": 3, 
    "first_name": "Adam"
}
```

## 2. Portfel & Saldo
### Pobieranie stanu konta (Dashboard)
Zwraca aktualny stan, środki zamrożone (na minusie) i wolne środki. Symbol waluty dobiera się automatycznie z ustawień profilu.
* **URL:** `/api/finances/wallet/`
* **Metoda:** `GET`
* **Response (200 OK):**
```json
{
    "id": 1,
    "user": 1,
    "current_balance": "5400.00",
    "pending_expenses": "400.00",
    "free_funds": "5000.00",
    "currency_symbol": "zł",
    "updated_at": "2026-05-19T22:00:00Z"
}
```

### Inicjalizacja "Pieniędzy Stałych"
Używane, gdy użytkownik pierwszy raz konfiguruje aplikację i wpisuje, ile ma gotówki.
* **URL:** `/api/finances/wallet/`
* **Metoda:** `POST`
* **Payload:**
```json
{
    "current_balance": 1500.50
}
```

## 3. Kategorie
### Pobieranie listy kategorii
Zwraca systemowe kategorie domyślne (te, gdzie `user: null`) oraz własne kategorie stworzone przez użytkownika.
* **URL:** `/api/finances/categories/`
* **Metoda:** `GET`
* **Response (200 OK):**
```json
[
    { "id": 1, "name": "Jedzenie i chemia", "type": "EXPENSE", "user": null },
    { "id": 12, "name": "Moje Hobby", "type": "EXPENSE", "user": 1 }
]
```

### Dodawanie własnej kategorii
* **URL:** `/api/finances/categories/`
* **Metoda:** `POST`
* **Payload:**
```json
{
    "name": "Koty i karma",
    "type": "EXPENSE"
}
```

## 4. Transakcje (Historia, Wydatki i Przychody)
Obsługuje przychody/wydatki bieżące oraz przychody/wydatki spodziewane.

### Dodawanie transakcji
* Wydatki/Przychody Bieżące: ustaw flagę `"is_realized": true` (od razu zmieni to stan portfela).
* Wydatki Spodziewane (Środki na minusie): ustaw `"is_realized": false` oraz `"type": "EXPENSE"`.
* Przychody Spodziewane: ustaw `"is_realized": false` oraz `"type": "INCOME"`.
* **URL:** `/api/finances/transactions/`
* **Metoda:** `POST`
* **Payload:**
```json
{
    "category": 1,
    "amount": "150.00",
    "type": "EXPENSE",
    "date": "2026-05-19",
    "description": "Zakupy w Biedronce",
    "is_realized": true
}
```

### Pobieranie Historii z Filtrami
Endpoint wspiera filtrowanie poprzez parametry zapytania (Query Params). Można je łączyć.
* Filtrowanie po wszystkim: `/api/finances/transactions/`
* Filtrowanie po typie: `/api/finances/transactions/?type=EXPENSE`
* Filtrowanie po konkretnym miesiącu: `/api/finances/transactions/?year=2026&month=5`
* **Response (200 OK):** Zwraca tablicę obiektów transakcji.

### Usuwanie Transakcji
* **URL:** `/api/finances/transactions/<id_transakcji>/`
* **Metoda:** `DELETE`
* **Response: 204 No Content** (Stan konta w portfelu automatycznie wycofa skutki finansowe tej transakcji).

## 5. Plany Cykliczne i Okresowe (Subskrypcje i Raty)
### Dodawanie planów
* Subskrypcje / Stałe Dochody: Wyślij bez pola `end_date` (lub `null`).
* Kredyty ratalne / Wydatki okresowe: Wyślij z zadeklarowaną datą `end_date`.
* **URL:** `/api/finances/recurring/`
* **Metoda:** `POST`
* **Payload:**
```json
{
    "category": 2,
    "amount": "55.00",
    "type": "EXPENSE",
    "frequency": "MONTHLY",
    "start_date": "2026-01-01",
    "end_date": "2026-12-01",
    "description": "Rata za telefon"
}
```

## 6. Raporty miesięczne
### Generowanie podsumowania struktury finansów
Zwraca zagregowane dane o dochodach, wydatkach czystych oraz podsumowanie ile wydano w danej kategorii.
* **URL:** `/api/finances/report/?year=2026&month=5`
* **Metoda:** `GET`
* **Response (200 OK):**
```json
{
    "year": 2026,
    "month": 5,
    "total_realized_income": "6000.00",
    "total_realized_expense": "1200.00",
    "net_savings": "4800.00",
    "breakdown": [
        { "category__name": "Jedzenie i chemia", "type": "EXPENSE", "total": "800.00" },
        { "category__name": "Mieszkanie i rachunki", "type": "EXPENSE", "total": "400.00" }
    ]
}
```
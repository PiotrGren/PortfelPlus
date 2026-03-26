# Portfel+ (Frontend)

Ten folder zawiera kod warstwy wizualnej aplikacji. Projekt został zbudowany przy użyciu **Next.js (App Router)**, **TypeScript**, **Tailwind CSS** oraz **Auth.js** do obsługi logowania (SSO).

## Wymagania wstępne

Aby uniknąć problemów z kompatybilnością ("u mnie działa"), w tym projekcie **wymagany jest Node.js w wersji 24**. Do zarządzania wersjami Node'a używamy narzędzia `nvm` (Node Version Manager).

### Konfiguracja NVM i Node.js (tylko za pierwszym razem)

1. **Zainstaluj NVM** (jeśli jeszcze nie masz):
   - Linux / macOS / WSL: 
     ```bash
     curl -o- [https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh](https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh) | bash
     source ~/.bashrc
     ```
   - Windows (bez WSL): Pobierz i zainstaluj [nvm-windows](https://github.com/coreybutler/nvm-windows).

2. **Zainstaluj i ustaw Node 24**:
   ```bash
   nvm install 24
   nvm use 24
   nvm alias default 24
   ```

## Jak uruchomić projekt lokalnie?

Za każdym razem, gdy chcesz pracować nad kodem frontendu, wykonaj poniższe kroki w terminalu.

### 1. Przejdź do folderu frontend
Upewnij się, że jesteś w odpowiednim katalogu:
```bash
cd apps/frontend
```

### 2. Upewnij się, że używasz poprawnej wersji Node'a
```bash
nvm use 24
```

### 3. Zainstaluj zależności
Jeśli to Twój pierwszy raz z projektem lub ktoś dodał nowe paczki do package.json, pobierz je:
```bash
npm install
```

### 4. Zmienne środowiskowe (`.env.local`)
Skopiuj plik z przykładowymi zmiennymi (jeśli istnieje) lub utwórz plik `.env.local` w katalogu `apps/frontend`. Będziemy tam trzymać m.in. URL do naszego backendu w Django oraz klucze dla dostawców logowania (Google, GitHub, Microsoft). Ten plik jest ignorowany przez Gita!

### 5. Uruchom serwer developerski
Rozpocznij pracę komendą:
```bash
npm run dev
```

Aplikacja będzie dostępna pod adresem: `http://localhost:3000/`

## Przydatne komendy:
 - `npm run dev` - Uruchamia serwer deweloperski.
 - `npm run build` - Buduje zoptymalizowaną wersję produkcyjną.
 - `npm run lint` - Sprawdza kod pod kątem błędów (ESLint).
 - `npm run test` - Uruchamia testy jednostkowe (Jest).
 
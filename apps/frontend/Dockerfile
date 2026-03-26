FROM node:24-alpine AS builder
WORKDIR /app

# Kopiujemy pliki konfiguracyjne paczek
COPY package.json package-lock.json ./

# Instalujemy wszystkie zależności (w tym devDependencies potrzebne do builda)
RUN npm ci

# Kopiujemy resztę kodu źródłowego
COPY . .

# Budujemy aplikację Next.js do wersji produkcyjnej
# (Wymaga odpowiedniej konfiguracji next.config.mjs z 'output: standalone', 
# jeśli chcemy to mocno odchudzić, ale domyślny build też przejdzie)
RUN npm run build


# ETAP 2: Uruchomienie (Lekki obraz produkcyjny)
FROM node:24-alpine AS runner
WORKDIR /app

# Ustawiamy środowisko na produkcyjne
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Tworzymy użytkownika non-root ze względów bezpieczeństwa
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Kopiujemy tylko pliki niezbędne do uruchomienia aplikacji z etapu budowania
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Uruchamiamy serwer (korzystając z pliku wygenerowanego przez output: standalone)
# Jeśli nie użyjesz 'standalone' w next.config.js, to komenda byłaby: CMD ["npm", "start"]
CMD ["node", "server.js"]
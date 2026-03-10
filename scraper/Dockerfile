# Używamy oficjalnego obrazu Playwright, który ma już zainstalowane przeglądarki i zależności
FROM mcr.microsoft.com/playwright/python:v1.58.0-jammy

# Ustawiamy katalog roboczy
WORKDIR /app

# Kopiujemy plik z wymaganiami (jeśli go masz) lub instalujemy biblioteki bezpośrednio
RUN pip install playwright
# Dodaj inne biblioteki, których używasz (re, json, os są w standardzie)

# Kopiujemy Twój skrypt do kontenera
COPY . .

# Tworzymy foldery na dane, które będą mapowane (wolumeny)
RUN mkdir -p /app/browser_data /app/updejty

# Komenda startowa
CMD ["python", "main.py"]
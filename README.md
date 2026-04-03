```
    \   /\
    )  ( ')
    (  /  )
    \(__)|
    
By
Dawid Rej
```
# T3G Leaderboard

Aplikacja webowa (Next.js) pokazujaca ranking druzyn Turnieju Trojgamicznego na podstawie statystyk z Instagrama.
<img width="1920" height="1080" alt="undefined" src="https://github.com/user-attachments/assets/85ae1e22-1787-457e-bc20-ec379085a0e1" />

## Co robi projekt

- wyswietla ranking druzyn po metrykach Instagram
- pozwala sortowac ranking (followers, engagement, lajki, posty, srednie lajki)
- pokazuje zmiany metryk (wzrost/spadek) miedzy snapshotami
- ma filtr zakresu dat oparty o historie update'ow
- korzysta z lokalnych danych JSON (backend self hosted)

Glowne dane trzymane sa w pliku `dane.json`.

## Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- Radix UI + shadcn/ui komponenty
- Lucide Icons
- Playwright (Python) do scrapowania danych
- Firebase App Hosting (konfiguracja w repo)

## Wymagania

- Node.js 20+
- Python 3.10+ (tylko do scrapera)
- Docker (opcjonalnie, dla scrapera w kontenerze)

## Uruchomienie lokalne (frontend)

1. Zainstaluj zaleznosci:

```bash
npm install
```

2. Uruchom dev server:

```bash
npm run dev
```

3. Otworz:

```text
http://localhost:3000
```

## Skrypty npm/

- `npm run dev` - uruchamia aplikacje developersko
- `npm run build` - buduje produkcyjnie
- `npm run start` - uruchamia build produkcyjny
- `npm run lint` - odpala ESLint

## Struktura danych

Kazda druzyna w `dane.json` ma:

- dane bazowe konta (np. `followers_count`, `engagement_rate`)
- pole `updates` z historia snapshotow (kolejne `updated_at`)

Frontend bierze dla kazdej druzyny najnowszy snapshot, a roznice liczy wzgledem:

- poprzedniego snapshotu (wg localStorage), albo
- zakresu dat wybranego w kalendarzu.

## Aktualizacja danych (scraper)

Scraper znajduje sie w folderze `scraper/` i zapisuje snapshoty jako `updateX.json`.

### Opcja A: lokalnie (Python)

1. Wejdz do katalogu scrapera:

```bash
cd scraper
```

2. Zainstaluj zaleznosci:

```bash
pip install playwright tf-playwright-stealth
playwright install
```

3. (Jednorazowo) zapisz zalogowana sesje Instagram:

```bash
python get_state.py
```

4. Uruchom scraping:

```bash
python main.py
```

Wyniki pojawia sie w `scraper/updejty/`.

### Opcja B: Docker

W katalogu `scraper/`:

```bash
docker compose build
docker compose run --rm insta-scraper
```

Upewnij sie, ze `scraper/state.json` istnieje (sesja po logowaniu).

## Scalanie update'ow do glownej bazy

Po zebraniu nowych plikow `updateX.json` odpal w katalogu glownym repo:

```bash
python fix_data.py
```

Skrypt:

- scali `scraper/updejty/update*.json` do `dane.json`
- dopisze nowe snapshoty do `updates`
- odswiezy `updejty/update1.json` najnowszym stanem

## Build i deploy

### Build lokalny

```bash
npm run build
npm run start
```

### Firebase App Hosting

Repo zawiera konfiguracje:

- `firebase.json`
- `apphosting.yaml`

Region backendu ustawiony jest na `europe-west1`.


## Autor

Copyright (c) Dawid Rej

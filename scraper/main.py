import re
import json
import os
from datetime import datetime, timezone
from playwright.sync_api import sync_playwright # type: ignore
import time
os.environ["NODE_OPTIONS"] = "--no-deprecation"
r"""
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222 --user-data-dir="/tmp/chrome_dev_session"

"""

instagram_handles = {
    "Cockroach Pulp Games": "cockroachpulp_games",
    "St. Barbara Studio's": "st.bstudios",
    "Catnip Addict": "studiocatnipaddict",
    "Table Entertainment": "tableentertainment",
    "Elektryk Entertainment": "temple_of_echoes",
    "PixelFlower": "theotherworld_pixelflower",
    "ZetaIT": "zetait_",
    "BlackRadio": None,
    "Playground": "playgroundxstudio",
    "Fundacja Teatrikon": "fundacja.teatrikon",
    "Turniej Trójgamiczny": "turniejtrojgamiczny",
    "Alotis": "alotis_crew",
    "Artificail Idiots": "artificial_idiots_t3g",
    "Getaway Games": "getaway_games",
    "Knedle": "knedle_t3g",
    "Komornicy": "vindigators",
    "Żegluga za Komputerem": "zegluga.za_komputerem",
    "Cat Marks": None,
    "Mechan": "mechant3g",
    "NSS Studio": None,
    "Dark District": "darkdistrict.zst",
    "JVELK": "jvelk_",
    "MechaKoty": "mechakoty",
    "Monochrome Studio": "monochromestudiodev",
    "PJTeam": "pjteam.official",
    "Polar Bears Inc.": "polar.bears.inc",
    "FC Royal Mońki": "royalmonki",
    "Stokrotki": "stokrotkigamedev",
    "BronkDEV": "studio_bronkdevu",
    "LogPeak": None,
    "Cheerful Studio": "cheerfulstudioofficial"
}

def wyciagnij_liczbe(tekst: str) -> int:
    """Zamienia tekst (np. '1,2 tys.', '1.5M', '1 234') na czystą liczbę (int)"""
    if not tekst:
        return 0
    t = tekst.lower().replace(' ', '').replace('\u00a0', '').replace(',', '.')
    try:
        if 'tys' in t or 'k' in t:
            t = re.sub(r'[^\d.]', '', t)
            return int(float(t) * 1000)
        elif 'm' in t or 'mln' in t:
            t = re.sub(r'[^\d.]', '', t)
            return int(float(t) * 1000000)
        else:
            t = re.sub(r'\D', '', t)
            return int(t) if t else 0
    except ValueError:
        return 0
def zapisz_do_json(username: str, dane: dict, folder="updejty", nazwa_konta=None):
    """Zapisuje dane do najnowszego pliku updateX.json lub tworzy nowy"""
    
    # 1. Tworzymy folder, jeśli nie istnieje
    if not os.path.exists(folder):
        os.makedirs(folder)

    # 2. Szukamy istniejących plików updateX.json
    pliki = [f for f in os.listdir(folder) if re.match(r'update\d+\.json', f)]
    
    if not pliki:
        nastepny_numer = 1
    else:
        # Wyciągamy numery i znajdujemy najwyższy
        numery = [int(re.search(r'(\d+)', f).group()) for f in pliki]
        nastepny_numer = max(numery)

    sciezka_pliku = os.path.join(folder, f"update{nastepny_numer}.json")

    # 3. Odczytujemy aktualną zawartość
    zawartosc = {}
    if os.path.exists(sciezka_pliku):
        try:
            with open(sciezka_pliku, 'r', encoding='utf-8') as f:
                zawartosc = json.load(f)
        except json.JSONDecodeError:
            pass

    # 4. LOGIKA NOWEGO PLIKU:
    # Jeśli nazwa_konta już istnieje w tym pliku, to znaczy, że zaczęliśmy nową sesję skanowania
    # i chcemy stworzyć nowy plik update (np. update2.json), zamiast nadpisywać stare dane z tego tygodnia.
    if nazwa_konta in zawartosc:
        nastepny_numer += 1
        sciezka_pliku = os.path.join(folder, f"update{nastepny_numer}.json")
        zawartosc = {} # Czyścimy dla nowego pliku

    # 5. Aktualizujemy dane
    zawartosc[nazwa_konta] = dane

    # 6. Zapisujemy
    with open(sciezka_pliku, 'w', encoding='utf-8') as f:
        json.dump(zawartosc, f, indent=4, ensure_ascii=False)
    
    print(f"[{time.ctime()}]💾 Dane '{nazwa_konta}' zapisane w: {sciezka_pliku}")



def zbadaj_profil(username: str, nazwa_konta: str = None):
    print(f"[{time.ctime()}]⚡️Podłączam się do Chrome'a i badam profil: @{username}...")
    user_data_dir = "./browser_data"
    with sync_playwright() as p:
        try:
            browser = p.chromium.launch(
                headless=True,
                args=["--no-sandbox", "--disable-dev-shm-usage"]
            )
            context = browser.new_context(
                storage_state="state.json",
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            )
            
            page = context.pages[0] if context.pages else context.new_page()

            page.goto(f"https://www.instagram.com/{username}/", wait_until="domcontentloaded")

            # 1. POBIERANIE GŁÓWNYCH STATYSTYK (Posty, Followers, Following)
            page.wait_for_selector('header', timeout=10000)
            
            # Zakładamy, że pierwsza znaleziona sekcja z tekstem to ta z danymi
            sekcja_danych = page.locator('header section').nth(1)
            
            posty, followersi, following = 0, 0, 0
            
            try:
                # Szukamy followersów
                followers_loc = sekcja_danych.locator('a[href*="/followers/"] span').first
                if followers_loc.is_visible():
                    followersi = wyciagnij_liczbe(followers_loc.get_attribute("title") or followers_loc.inner_text())
                
                # Szukamy obserwowanych (following)
                following_loc = sekcja_danych.locator('a[href*="/following/"] span').first
                if following_loc.is_visible():
                    following = wyciagnij_liczbe(following_loc.inner_text())
                    
                # Szukamy postów (regexem w tekście)
                wszystkie_teksty = sekcja_danych.inner_text().lower()
                posty_match = re.search(r'([\d\s,\.]+)\s*post', wszystkie_teksty)
                if posty_match:
                    posty = wyciagnij_liczbe(posty_match.group(1))
                    
            except Exception as e:
                print(f"[{time.ctime()}]❌ Błąd przy wyciąganiu statystyk: {e}")

            # 2. POBIERANIE POSTÓW (Ze scrollowaniem)
            selektor_postow = 'a[href*="/p/"], a[href*="/reel/"]'
            page.wait_for_selector(selektor_postow, timeout=10000)
            
            docelowa_liczba_postow = 30
            # print(f"\n🔍 Skanuję ostatnie posty (przewijam stronę)...")
            
            while True:
                # print(f"Znaleziono {page.locator(selektor_postow).count()} postów...")
                aktualna_liczba = page.locator(selektor_postow).count()
                if aktualna_liczba >= docelowa_liczba_postow:
                    break
                if posty>3:
                    page.keyboard.press("End")
                page.wait_for_timeout(5000)
                if page.locator(selektor_postow).count() == aktualna_liczba:
                    break # Koniec profilu
                    
            posty_w_siatce = page.locator(selektor_postow).all()[:docelowa_liczba_postow]
            laczne_lajki = 0
            laczne_komentarze = 0
            zbadane_posty = 0
            
            page.wait_for_timeout(500)
            posty_w_siatce[0].scroll_into_view_if_needed()
            page.wait_for_timeout(500)
            
            
            for post in posty_w_siatce:
                post.hover()
                page.wait_for_timeout(400) 
                dane_hover = post.locator('ul li').all_inner_texts()
                
                if len(dane_hover) >= 2:
                    laczne_lajki += wyciagnij_liczbe(dane_hover[0])
                    laczne_komentarze += wyciagnij_liczbe(dane_hover[1])
                    zbadane_posty += 1
                # print(f"Post {zbadane_posty}/{len(posty_w_siatce)}: Lajki={dane_hover[0]}, Komentarze={dane_hover[1]}")
            page.close()
            
            # 3. OBLICZANIE WSKAŹNIKÓW I FORMATOWANIE DO JSON
            # Zabezpieczenia przed dzieleniem przez zero (dywizja przez 0 wywala program)
            avg_likes = (laczne_lajki / zbadane_posty) if zbadane_posty > 0 else 0
            avg_comments = (laczne_komentarze / zbadane_posty) if zbadane_posty > 0 else 0
            
            # Engagement Rate = ((Średnia lajków + Średnia komentarzy) / Followers) * 100
            if followersi > 0 and zbadane_posty > 0:
                engagement_rate = ((avg_likes + avg_comments) / followersi) * 100
            else:
                engagement_rate = 0
                
            comments_to_likes = (laczne_komentarze / laczne_lajki * 100) if laczne_lajki > 0 else 0
            foll_to_foll_ratio = (followersi / following) if following > 0 else 0
            
            # Aktualny czas w formacie UTC ISO 8601
            aktualny_czas = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000000Z")

            gotowy_json = {
                "followers_count": followersi,
                "follows_count": following,
                "total_media_count": posty,
                "analyzed_posts": zbadane_posty,
                "total_likes_analyzed": laczne_lajki,
                "total_comments_analyzed": laczne_komentarze,
                "average_likes": f"{avg_likes:.1f}",
                "average_comments": f"{avg_comments:.1f}",
                "engagement_rate": f"{engagement_rate:.3f}",
                "weekly_posts": "0.00", # Ustawione na sztywno, bo Playwright w trybie hover nie widzi dat postów
                "comments_to_likes_ratio": f"{comments_to_likes:.3f}",
                "followers_to_follows_ratio": f"{foll_to_foll_ratio:.2f}",
                "updated_at": aktualny_czas
            }
            
            # Zapis do pliku
            zapisz_do_json(username, gotowy_json, nazwa_konta=nazwa_konta)
            context.storage_state(path="state.json") 
            context.close()
        except Exception as e:
            page.screenshot(path=f"updejty/error_{username}.png") # Zapisze screena tam gdzie jsony
            print(f"\n❌ Błąd: {e}")

if __name__ == "__main__":
    for nazwa, handle in instagram_handles.items():
        if handle:
            zbadaj_profil(handle,nazwa)
            time.sleep(10)  
        else:
            print(f"[{time.ctime()}]⚠️  Brak handle'a Instagram dla drużyny '{nazwa}' - pomijam analizę tego profilu.")
    else:
        print(f"[{time.ctime()}]✅ Analiza zakończona dla wszystkich drużyn z dostępnymi handle'ami Instagram.")
        
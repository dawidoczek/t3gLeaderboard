import json
import os
import re
import shutil

# Ścieżki (dostosuj jeśli nazwy folderów się różnią)
PATH_BASE_DANE = "dane.json"
PATH_UPDATE_FRONT = "updejty/update1.json"
PATH_SCRAPER_UPDATES = "scraper/updejty"

def merge_json_data():
    print("🔄 Rozpoczynam aktualizację bazy danych (dane.json)...")
    
    # 1. Wczytaj bazę (dane.json)
    if os.path.exists(PATH_BASE_DANE):
        with open(PATH_BASE_DANE, 'r', encoding='utf-8') as f:
            base_data = json.load(f)
    else:
        print("⚠️ Brak pliku dane.json - stworzę nowy.")
        base_data = {}

    # 2. Wczytaj ostatni update (update1.json)
    if os.path.exists(PATH_UPDATE_FRONT):
        with open(PATH_UPDATE_FRONT, 'r', encoding='utf-8') as f:
            update_data = json.load(f)
        
        # Merge: Dla każdego zespołu w update, zaktualizuj bazę
        for team, new_stats in update_data.items():
            if team in base_data:
                # To jest odpowiednik ...base, ...updateData
                base_data[team].update(new_stats)
            else:
                base_data[team] = new_stats
        
        # Zapisz zaktualizowane dane.json
        with open(PATH_BASE_DANE, 'w', encoding='utf-8') as f:
            json.dump(base_data, f, indent=4, ensure_ascii=False)
        print(f"✅ Baza {PATH_BASE_DANE} zaktualizowana.")
    else:
        print("ℹ️ Brak update1.json do wmergowania. Pomijam ten krok.")

def rotate_latest_update():
    print(f"📂 Szukam najnowszego raportu w {PATH_SCRAPER_UPDATES}...")
    
    if not os.path.exists(PATH_SCRAPER_UPDATES):
        print("❌ Folder scrapera nie istnieje!")
        return

    # Znajdź wszystkie pliki updateX.json
    files = [f for f in os.listdir(PATH_SCRAPER_UPDATES) if re.match(r'update\d+\.json', f)]
    
    if not files:
        print("❌ Nie znaleziono żadnych plików updateX.json w folderze scrapera.")
        return

    # Wyciągnij numer i znajdź najwyższy
    latest_file = max(files, key=lambda x: int(re.search(r'(\d+)', x).group()))
    src_path = os.path.join(PATH_SCRAPER_UPDATES, latest_file)
    
    # Kopiowanie do update1.json na frontendzie
    # Upewnij się, że folder docelowy istnieje
    os.makedirs(os.path.dirname(PATH_UPDATE_FRONT), exist_ok=True)
    shutil.copy2(src_path, PATH_UPDATE_FRONT)
    
    print(f"🚀 Najnowszy plik ({latest_file}) skopiowany jako {PATH_UPDATE_FRONT}.")

if __name__ == "__main__":
    # Kolejność jest ważna: 
    # Najpierw merge'ujemy stary update1 do bazy, 
    # a potem nadpisujemy go nowym plikiem ze scrapera.
    merge_json_data()
    rotate_latest_update()
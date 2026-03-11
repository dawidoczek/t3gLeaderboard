import json
import os
import re
import shutil

# Ścieżki
PATH_BASE_DANE = "dane.json"
PATH_UPDATE_FRONT = "updejty/update1.json"
PATH_SCRAPER_UPDATES = "scraper/updejty"

def merge_all_scraper_updates():
    print(f"🔄 Przeszukuję {PATH_SCRAPER_UPDATES} w poszukiwaniu wszystkich danych...")
    
    # 1. Wczytaj bazę (dane.json)
    if os.path.exists(PATH_BASE_DANE):
        with open(PATH_BASE_DANE, 'r', encoding='utf-8') as f:
            base_data = json.load(f)
    else:
        base_data = {}

    # 2. Znajdź wszystkie pliki updateX.json i posortuj je numerami (1, 2, 3...)
    if not os.path.exists(PATH_SCRAPER_UPDATES):
        print("❌ Folder scrapera nie istnieje!")
        return
    
    files = [f for f in os.listdir(PATH_SCRAPER_UPDATES) if re.match(r'update\d+\.json', f)]
    # Sortujemy, żeby starsze dane wchodziły do listy 'updates' przed nowszymi
    files.sort(key=lambda x: int(re.search(r'(\d+)', x).group()))

    newest_update_data = {}

    for file_name in files:
        file_path = os.path.join(PATH_SCRAPER_UPDATES, file_name)
        with open(file_path, 'r', encoding='utf-8') as f:
            current_file_data = json.load(f)
            
        for team, stats in current_file_data.items():
            if team not in base_data:
                base_data[team] = {"updates": []}
            
            if 'updates' not in base_data[team]:
                base_data[team]['updates'] = []

            # Sprawdź czy ten konkretny update (po dacie) już jest w historii, żeby nie dublować
            already_exists = any(u.get('updated_at') == stats.get('updated_at') for u in base_data[team]['updates'])
            
            if not already_exists:
                # Dodaj do listy historycznej
                base_data[team]['updates'].append(stats.copy())
                # Zaktualizuj główne pola na najświeższe jakie znajdziesz w pętli
                newest_update_data[team] = stats # Zachowaj do update1.json
        
    # 3. Zapisz zaktualizowane dane.json
    with open(PATH_BASE_DANE, 'w', encoding='utf-8') as f:
        json.dump(base_data, f, indent=4, ensure_ascii=False)
    
    print(f"✅ Baza historyczna {PATH_BASE_DANE} zaktualizowana o wszystkie dostępne pliki.")
    return newest_update_data

def update_frontend_file(last_stats):
    # Kopiuje absolutnie najnowsze dane do update1.json dla frontendu
    if last_stats:
        os.makedirs(os.path.dirname(PATH_UPDATE_FRONT), exist_ok=True)
        with open(PATH_UPDATE_FRONT, 'w', encoding='utf-8') as f:
            json.dump(last_stats, f, indent=4, ensure_ascii=False)
        print(f"🚀 Plik {PATH_UPDATE_FRONT} odświeżony najnowszymi danymi.")

if __name__ == "__main__":
    # 1. Przemiel wszystkie pliki ze scrapera do głównej bazy
    latest_stats = merge_all_scraper_updates()
    
    # 2. Ustaw najświeższy stan w pliku dla frontendu
    update_frontend_file(latest_stats)
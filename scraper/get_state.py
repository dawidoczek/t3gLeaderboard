from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        # Odpalamy z widocznym oknem
        browser = p.chromium.launch(headless=False)
        context = browser.new_context()
        page = context.new_page()
        page.goto("https://www.instagram.com/")
        
        print("Zaloguj się ręcznie w oknie przeglądarki...")
        # Czekamy aż pojawi się element dostępny tylko po zalogowaniu (np. ikona wiadomości)
        page.wait_for_selector('svg[aria-label="Messages"]', timeout=0) 
        
        # Zapisujemy stan (ciasteczka i local storage) do pliku JSON
        context.storage_state(path="state.json")
        print("✅ Sesja zapisana do state.json!")
        browser.close()

run()
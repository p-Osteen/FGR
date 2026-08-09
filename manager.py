import os
import sys
import subprocess
import shutil

SCRAPER_DIR = os.path.join(os.path.dirname(__file__), 'scraper')
UI_DIR = os.path.join(os.path.dirname(__file__), 'ui')
PUBLIC_DIR = os.path.join(UI_DIR, 'public')
GAMES_JSON = os.path.join(PUBLIC_DIR, 'games.json')
STATE_JSON = os.path.join(SCRAPER_DIR, 'state.json')

def scrape_all():
    print("Starting full scrape...")
    subprocess.run(["node", "index.js", "all"], cwd=SCRAPER_DIR)

def clear_all():
    print("Clearing all data...")
    if os.path.exists(GAMES_JSON):
        os.remove(GAMES_JSON)
    if os.path.exists(STATE_JSON):
        os.remove(STATE_JSON)
    print("Data cleared.")

def check_updates():
    print("Checking for updates...")
    subprocess.run(["node", "index.js", "update"], cwd=SCRAPER_DIR)

def push_to_live():
    print("Building UI and pushing to live (GitHub Pages)...")
    
    # 1. Build UI
    print("Building React App...")
    subprocess.run(["npm", "run", "build"], cwd=UI_DIR, shell=True)
    
    # 2. Push to GitHub Pages
    # For a seamless GH pages deployment, the 'gh-pages' npm package is ideal.
    # If not installed, we can fall back to standard git commands.
    print("Deploying to gh-pages...")
    subprocess.run(["npx", "gh-pages", "-d", "dist"], cwd=UI_DIR, shell=True)
    
    # Note: For the actual repo source, you can run normal git add/commit/push here as well
    print("Pushing raw source to main branch...")
    subprocess.run(["git", "add", "."], cwd=os.path.dirname(__file__), shell=True)
    subprocess.run(["git", "commit", "-m", "Auto-update catalog"], cwd=os.path.dirname(__file__), shell=True)
    subprocess.run(["git", "push"], cwd=os.path.dirname(__file__), shell=True)
    print("Done!")

def main():
    if len(sys.argv) > 1:
        choice = sys.argv[1]
    else:
        print("FitGirl Scraper Manager")
        print("1. Scrape All (Warning: Takes ~20 mins)")
        print("2. Clear All Data")
        print("3. Check for Updates (Incremental)")
        print("4. Push to Live (Build & Deploy)")
        print("5. Exit")
        choice = input("Select an option: ")

    if choice == '1':
        scrape_all()
    elif choice == '2':
        clear_all()
    elif choice == '3':
        check_updates()
    elif choice == '4':
        push_to_live()
    else:
        print("Exiting.")

if __name__ == "__main__":
    main()

import os
import sys
import subprocess
import shutil
import json
from datetime import datetime

SCRAPER_DIR = os.path.join(os.path.dirname(__file__), 'scraper')
UI_DIR = os.path.join(os.path.dirname(__file__), 'ui')
PUBLIC_DIR = os.path.join(UI_DIR, 'public')
GAMES_JSON = os.path.join(PUBLIC_DIR, 'games.json')
STATE_JSON = os.path.join(SCRAPER_DIR, 'state.json')

def scrape_all():
    print("Starting full scrape...")
    subprocess.run(["node", "index.js", "all"], cwd=SCRAPER_DIR)
GAMES_DIR = os.path.join(PUBLIC_DIR, 'games')

def clear_all():
    print("Clearing all data...")
    if os.path.exists(GAMES_JSON):
        os.remove(GAMES_JSON)
    if os.path.exists(STATE_JSON):
        os.remove(STATE_JSON)
    if os.path.exists(GAMES_DIR):
        shutil.rmtree(GAMES_DIR)
    print("Data cleared.")

def check_updates():
    print("Checking for updates...")
    subprocess.run(["node", "index.js", "update"], cwd=SCRAPER_DIR)

def generate_sitemap():
    print("Generating sitemap.xml...")
    if not os.path.exists(GAMES_JSON):
        print("games.json not found, skipping sitemap generation.")
        return
        
    try:
        with open(GAMES_JSON, 'r', encoding='utf-8') as f:
            games = json.load(f)
            
        pages_json = os.path.join(PUBLIC_DIR, 'pages.json')
        pages = {}
        if os.path.exists(pages_json):
            with open(pages_json, 'r', encoding='utf-8') as f:
                pages = json.load(f)

        sitemap = ['<?xml version="1.0" encoding="UTF-8"?>']
        sitemap.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
        
        base_url = "https://p-osteen.github.io/FGR"
        
        # Root
        sitemap.append(f'  <url>\\n    <loc>{base_url}/</loc>\\n    <changefreq>daily</changefreq>\\n    <priority>1.0</priority>\\n  </url>')
        
        # Static Pages
        for slug in pages.keys():
            sitemap.append(f'  <url>\\n    <loc>{base_url}/page/{slug}</loc>\\n    <changefreq>weekly</changefreq>\\n    <priority>0.8</priority>\\n  </url>')

        # Games
        for game in games:
            game_id = game.get('id')
            if not game_id:
                continue
            date_str = game.get('date', '')
            lastmod = ""
            try:
                dt = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
                lastmod = f"\\n    <lastmod>{dt.strftime('%Y-%m-%d')}</lastmod>"
            except Exception:
                pass
                
            sitemap.append(f'  <url>\\n    <loc>{base_url}/game/{game_id}</loc>{lastmod}\\n    <changefreq>monthly</changefreq>\\n    <priority>0.6</priority>\\n  </url>')

        sitemap.append('</urlset>')
        
        with open(os.path.join(PUBLIC_DIR, 'sitemap.xml'), 'w', encoding='utf-8') as f:
            f.write('\\n'.join(sitemap).replace('\\n', '\n'))
            
        print(f"Sitemap generated with {len(games) + len(pages) + 1} URLs.")
    except Exception as e:
        print(f"Error generating sitemap: {e}")

def push_to_live():
    print("Building UI and pushing to live (GitHub Pages)...")
    
    generate_sitemap()
    
    print("Building React App...")
    build_result = subprocess.run(["npm", "run", "build"], cwd=UI_DIR, shell=True)
    if build_result.returncode != 0:
        print("Build failed. Aborting deployment.")
        return
        
    print("Deploying to gh-pages...")
    dist_dir = os.path.join(UI_DIR, "dist")
    shutil.copy(os.path.join(dist_dir, "index.html"), os.path.join(dist_dir, "404.html"))
    remote_url = subprocess.check_output(["git", "config", "--get", "remote.origin.url"], cwd=os.path.dirname(__file__)).decode("utf-8").strip()
    
    subprocess.run(["git", "init"], cwd=dist_dir, shell=True)
    subprocess.run(["git", "checkout", "-b", "gh-pages"], cwd=dist_dir, shell=True)
    subprocess.run(["git", "add", "."], cwd=dist_dir, shell=True)
    subprocess.run(["git", "commit", "-m", "Auto-deploy"], cwd=dist_dir, shell=True)
    subprocess.run(["git", "push", "-f", remote_url, "gh-pages"], cwd=dist_dir, shell=True)
    
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
        print("1. Scrape All (Takes ~5-10 mins)")
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

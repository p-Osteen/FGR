const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs-extra');
const path = require('path');

const UI_PUBLIC_DIR = path.join(__dirname, '../ui/public');
const GAMES_FILE = path.join(UI_PUBLIC_DIR, 'games.json');
const GAMES_DIR = path.join(UI_PUBLIC_DIR, 'games');
const STATE_FILE = path.join(__dirname, 'state.json');
const BASE_URL = 'https://fitgirl-repacks.site/';

fs.ensureDirSync(UI_PUBLIC_DIR);
fs.ensureDirSync(GAMES_DIR);
const args = process.argv.slice(2);
const MODE = args[0] || 'update'; 

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function urlToSlug(url) {
  const match = url.match(/fitgirl-repacks\.site\/([^\/]+)/);
  return match ? match[1] : Buffer.from(url).toString('base64');
}

async function fetchPage(page) {
  const url = page === 1 ? BASE_URL : `${BASE_URL}page/${page}/`;
  console.log(`Fetching ${url}...`);
  try {
    const res = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    return res.data;
  } catch (err) {
    return null;
  }
}

function parsePage(html) {
  const $ = cheerio.load(html);
  const games = [];

  $('article.post').each((i, el) => {
    const titleNode = $(el).find('h1.entry-title a');
    const title = titleNode.text().trim();
    const url = titleNode.attr('href');

    if (!title || title.toLowerCase().includes('upcoming repacks') || title.toLowerCase().includes('site updates')) return;

    const categories = [];
    $(el).find('.cat-links a').each((_, cat) => categories.push($(cat).text().trim()));
    const date = $(el).find('time.entry-date').attr('datetime');
    const image = $(el).find('.entry-content img').first().attr('src');
    const pText = $(el).find('.entry-content p').text();
    
    const meta = { genres: '', companies: '', languages: '', originalSize: '', repackSize: '' };
    const extract = (label) => {
      const match = pText.match(new RegExp(`${label}\\s*([^\\n\\r]+)`));
      return match ? match[1].trim() : '';
    };

    meta.genres = extract('Genres/Tags:');
    meta.companies = extract('Companies:');
    meta.languages = extract('Languages:');
    meta.originalSize = extract('Original Size:');
    meta.repackSize = extract('Repack Size:').replace(/Discussion.*/i, '').trim();

    let discussionUrl = '';
    $(el).find('a').each((_, a) => {
      if ($(a).text().toLowerCase().includes('cs.rin.ru')) {
        discussionUrl = $(a).attr('href');
      }
    });

    $(el).find('.entry-content p strong').each((_, strong) => {
       const text = $(strong).parent().text();
       if(text.includes('Companies:') && !meta.companies) meta.companies = $(strong).text();
       if(text.includes('Languages:') && !meta.languages) meta.languages = $(strong).text();
       if(text.includes('Original Size:') && !meta.originalSize) meta.originalSize = $(strong).text();
       if(text.includes('Repack Size:') && !meta.repackSize) meta.repackSize = $(strong).text();
    });
    
    let mirrorsHtml = '';
    // Find all <h3> that contain "Download Mirrors" or "Game Updates"
    $(el).find('.entry-content h3').each((_, h3) => {
      const h3Text = $(h3).text().trim();
      if (h3Text.includes('Download Mirrors') || h3Text.includes('Game Updates')) {
         mirrorsHtml += '<h3>' + $(h3).html() + '</h3>';
         // The next siblings could be ul, style, div, etc. We want everything until the next h3 or p
         let next = $(h3).next();
         while (next.length && next[0].tagName !== 'h3' && next[0].tagName !== 'p') {
           mirrorsHtml += $.html(next);
           next = next.next();
         }
      }
    });

    games.push({
      id: urlToSlug(url), title, url, image, categories, date, 
      year: new Date(date).getFullYear().toString(),
      ...meta,
      discussionUrl,
      mirrorsHtml
    });
  });

  return { games, hasNext: $('.nav-previous a').length > 0 || $('.next.page-numbers').length > 0 };
}

async function run() {
  let state = { lastPage: 1 };
  if (MODE === 'all') {
    state.lastPage = 1;
    fs.writeJsonSync(GAMES_FILE, []);
  } else if (fs.existsSync(STATE_FILE)) {
    state = fs.readJsonSync(STATE_FILE);
  }

  let gamesData = fs.existsSync(GAMES_FILE) ? fs.readJsonSync(GAMES_FILE) : [];
  const gamesMap = new Map();
  gamesData.forEach(g => gamesMap.set(g.id, g));

  let currentPage = MODE === 'all' ? 1 : state.lastPage;
  let keepGoing = true;

  while (keepGoing) {
    const BATCH_SIZE = 10;
    const promises = [];
    for (let i = 0; i < BATCH_SIZE; i++) {
      promises.push(fetchPage(currentPage + i).then(html => ({ page: currentPage + i, html })));
    }
    
    const results = await Promise.all(promises);
    let anyHasNext = false;
    let newGamesAddedBatch = 0;
    let anyGamesFound = false;

    for (const res of results) {
      if (!res.html) continue;
      const { games, hasNext } = parsePage(res.html);
      if (games.length > 0) anyGamesFound = true;
      if (hasNext) anyHasNext = true;

      games.forEach(g => {
        // Write full game object to individual file
        fs.writeJsonSync(path.join(GAMES_DIR, `${g.id}.json`), g, { spaces: 2 });
        
        // Create lightweight object for the main catalog
        const lightweight = { ...g };
        delete lightweight.mirrorsHtml;

        if (!gamesMap.has(g.id)) {
          gamesMap.set(g.id, lightweight);
          newGamesAddedBatch++;
        } else {
          gamesMap.set(g.id, { ...gamesMap.get(g.id), ...lightweight });
        }
      });
    }

    if (MODE === 'update' && newGamesAddedBatch === 0 && anyGamesFound && currentPage > 1) {
      break;
    }

    const updatedGamesList = Array.from(gamesMap.values()).sort((a, b) => new Date(b.date) - new Date(a.date));
    fs.writeJsonSync(GAMES_FILE, updatedGamesList, { spaces: 2 });
    
    currentPage += BATCH_SIZE;
    fs.writeJsonSync(STATE_FILE, { lastPage: currentPage });

    if (!anyHasNext && anyGamesFound === false) {
      // no games found in the entire batch, we reached the end
      keepGoing = false;
    } else if (!anyHasNext) {
      keepGoing = false;
    } else { 
      await sleep(1500); 
    }
  }
  
  if (MODE === 'all' || !keepGoing) fs.writeJsonSync(STATE_FILE, { lastPage: 1 });
  console.log(`Done. Total: ${gamesMap.size}`);
}

run().catch(console.error);

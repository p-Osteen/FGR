const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs-extra');
const path = require('path');

const PAGES_FILE = path.join(__dirname, '../ui/public/pages.json');

const urls = [
  'https://fitgirl-repacks.site/popular-repacks/',
  'https://fitgirl-repacks.site/pop-repacks/',
  'https://fitgirl-repacks.site/popular-repacks-of-the-year/',
  'https://fitgirl-repacks.site/all-my-repacks-a-z/',
  'https://fitgirl-repacks.site/games-with-my-personal-pink-paw-award/',
  'https://fitgirl-repacks.site/all-hypervisor-bypassed-repacks-a-z/',
  'https://fitgirl-repacks.site/all-switch-emulated-repacks-a-z/',
  'https://fitgirl-repacks.site/all-playstation-3-emulated-repacks-a-z/',
  'https://fitgirl-repacks.site/updates-list/',
  'https://fitgirl-repacks.site/faq/',
  'https://fitgirl-repacks.site/repacks-troubleshooting/',
  'https://fitgirl-repacks.site/hypervisor-guide/',
  'https://fitgirl-repacks.site/contacts/'
];

async function scrapePages() {
  const pagesData = {};

  for (const url of urls) {
    try {
      console.log(`Scraping: ${url}`);
      const res = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const $ = cheerio.load(res.data);
      
      const title = $('h1.entry-title').first().text().trim();
      let content = $('.entry-content').first().html();
      
      // Fix relative or missing schemes in links and images
      if (content) {
         // Some basic cleanup
         content = content.replace(/href="\//g, 'href="https://fitgirl-repacks.site/');
      }

      // Generate a slug from the URL
      // e.g. https://fitgirl-repacks.site/faq/ -> faq
      const urlObj = new URL(url);
      const slug = urlObj.pathname.replace(/\//g, '').trim() || 'home';
      
      pagesData[slug] = {
        title,
        content
      };
      
      // Sleep to prevent rate limit
      await new Promise(r => setTimeout(r, 1000));
    } catch (e) {
      console.error(`Failed to scrape ${url}:`, e.message);
    }
  }

  fs.writeJsonSync(PAGES_FILE, pagesData, { spaces: 2 });
  console.log('Saved to pages.json');
}

scrapePages();

let catalogCache = null;
let catalogPromise = null;
const gameDetailCache = {};

export const fetchCatalog = async () => {
  if (catalogCache) return catalogCache;
  if (!catalogPromise) {
    const url = `${import.meta.env.BASE_URL}games.json`;
    catalogPromise = fetch(url)
      .then(res => { if (!res.ok) throw new Error('Failed to load catalog'); return res.json(); })
      .then(data => { 
        data.forEach(g => {
          const d = new Date(g.date);
          g._timestamp = d.getTime();
          g._month = d.getMonth();
          g._searchString = (g.title + ' ' + (g.categories ? g.categories.join(' ') : '')).toLowerCase();
          g._sortTitle = g.title.toLowerCase();
        });
        catalogCache = data; 
        return data; 
      })
      .catch(err => { console.error(err); catalogPromise = null; return []; });
  }
  return catalogPromise;
};

export const fetchGameDetail = async (id) => {
  if (gameDetailCache[id]) return gameDetailCache[id];
  const url = `${import.meta.env.BASE_URL}games/${id}.json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Game not found: ${id}`);
  const data = await res.json();
  gameDetailCache[id] = data;
  return data;
};

let filtersCache = null;

export const getFilters = (games) => {
  if (filtersCache) return filtersCache;
  const years = new Set();
  const categories = new Set();
  games.forEach(g => {
    if (g.year && !isNaN(g.year)) years.add(g.year);
    if (g.categories) g.categories.forEach(c => categories.add(c));
  });
  filtersCache = {
    years: Array.from(years).sort().reverse(),
    categories: Array.from(categories).sort(),
  };
  return filtersCache;
};

let pagesCache = null;
export async function fetchPagesData() {
  if (pagesCache) return pagesCache;
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}pages.json`);
    if (!res.ok) throw new Error('Failed to load static pages');
    pagesCache = await res.json();
    return pagesCache;
  } catch (err) {
    console.error('Error fetching pages:', err);
    return {};
  }
}

let metadataCache = null;
let metadataPromise = null;

export async function fetchMetadata() {
  if (metadataCache) return metadataCache;
  if (!metadataPromise) {
    const url = `${import.meta.env.BASE_URL}metadata.json`;
    metadataPromise = fetch(url)
      .then(res => { if (!res.ok) throw new Error('Failed to load metadata'); return res.json(); })
      .then(data => { metadataCache = data; return data; })
      .catch(err => { console.error('Error fetching metadata:', err); metadataPromise = null; return { lastUpdated: null }; });
  }
  return metadataPromise;
}

export function formatDate(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d)) return '';
  return `${String(d.getDate()).padStart(2, '0')}/${d.toLocaleString('en-US', {month: 'short'})}/${d.getFullYear()}`;
}

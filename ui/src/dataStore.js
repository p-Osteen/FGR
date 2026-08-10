let catalogCache = null;
let catalogPromise = null;
const gameDetailCache = {};

export const fetchCatalog = async () => {
  if (catalogCache) return catalogCache;
  if (!catalogPromise) {
    const url = `${import.meta.env.BASE_URL}games.json?t=${Date.now()}`;
    catalogPromise = fetch(url)
      .then(res => { if (!res.ok) throw new Error('Failed to load catalog'); return res.json(); })
      .then(data => { catalogCache = data; return data; })
      .catch(err => { console.error(err); catalogPromise = null; return []; });
  }
  return catalogPromise;
};

export const fetchGameDetail = async (id) => {
  if (gameDetailCache[id]) return gameDetailCache[id];
  const url = `${import.meta.env.BASE_URL}games/${id}.json?t=${Date.now()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Game not found: ${id}`);
  const data = await res.json();
  gameDetailCache[id] = data;
  return data;
};

export const getFilters = (games) => {
  const years = new Set();
  const categories = new Set();
  games.forEach(g => {
    if (g.year && !isNaN(g.year)) years.add(g.year);
    if (g.categories) g.categories.forEach(c => categories.add(c));
  });
  return {
    years: Array.from(years).sort().reverse(),
    categories: Array.from(categories).sort(),
  };
};

let pagesCache = null;
export async function fetchPagesData() {
  if (pagesCache) return pagesCache;
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}pages.json?t=${Date.now()}`);
    if (!res.ok) throw new Error('Failed to load static pages');
    pagesCache = await res.json();
    return pagesCache;
  } catch (err) {
    console.error('Error fetching pages:', err);
    return {};
  }
}

export function formatDate(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d)) return '';
  return `${String(d.getDate()).padStart(2, '0')}/${d.toLocaleString('en-US', {month: 'short'})}/${d.getFullYear()}`;
}

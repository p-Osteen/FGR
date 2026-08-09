let gamesData = null;
let fetchPromise = null;

export const fetchGamesData = async () => {
  if (gamesData) return gamesData;
  if (!fetchPromise) {
    // In dev mode, or locally, we fetch from the public folder.
    // Given base: '/FGR/', the public URL for github pages is /FGR/games.json
    // But locally in dev it's /games.json. 
    // We can just use the relative or absolute path based on environment, 
    // but standard Vite behavior resolves absolute paths from public root.
    // Let's use import.meta.env.BASE_URL to be safe.
    const url = `${import.meta.env.BASE_URL}games.json`;

    fetchPromise = fetch(url)
      .then(res => res.json())
      .then(data => {
        gamesData = data;
        return data;
      })
      .catch(err => {
        console.error('Failed to load games.json', err);
        return [];
      });
  }
  return fetchPromise;
};

export const getFilters = (games) => {
  const years = new Set();
  const categories = new Set();

  games.forEach(g => {
    if (g.year && !isNaN(g.year)) years.add(g.year);
    if (g.categories) {
      g.categories.forEach(c => categories.add(c));
    }
  });

  return {
    years: Array.from(years).sort().reverse(),
    categories: Array.from(categories).sort()
  };
};


let pagesCache = null;
export async function fetchPagesData() {
  if (pagesCache) return pagesCache;
  try {
    const res = await fetch('/FGR/pages.json');
    if (!res.ok) throw new Error('Failed to load static pages');
    pagesCache = await res.json();
    return pagesCache;
  } catch (err) {
    console.error('Error fetching pages:', err);
    return {};
  }
}


import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { fetchCatalog, getFilters, formatDate } from '../dataStore';
import OptimizedImage from '../components/OptimizedImage';
import BackToTop from '../components/BackToTop';

const PLACEHOLDER = `${import.meta.env.BASE_URL}placeholder.svg`;

const SkeletonCard = React.memo(() => (
  <div className="game-card skeleton-card">
    <div className="game-image-wrapper skeleton-image" />
    <div className="game-info">
      <div className="skeleton-line skeleton-title" />
      <div className="skeleton-line skeleton-date" />
    </div>
  </div>
));

const GameCard = React.memo(({ game, priority }) => (
  <Link to={`/game/${game.id}`} className="game-card-link">
    <div className="game-card">
      <OptimizedImage
        src={game.image}
        alt={game.title}
        wrapperClassName="game-image-wrapper"
        className="game-image"
        priority={priority}
      />
      <div className="game-info">
        <h3 className="game-title" title={game.title}>{game.title}</h3>
        <div className="game-meta">
          <span className="date">{formatDate(game.date)}</span>
        </div>
      </div>
    </div>
  </Link>
));

export default function Catalog() {
  const [allGames, setAllGames] = useState([]);
  const [filtersData, setFiltersData] = useState({ years: [], categories: [] });
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  
  // State for filters
  const [search, setSearch] = useState(() => sessionStorage.getItem('fgr_search') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [selectedYear, setSelectedYear] = useState(() => sessionStorage.getItem('fgr_year') || '');
  const [selectedMonth, setSelectedMonth] = useState(() => sessionStorage.getItem('fgr_month') || '');
  const [selectedCategories, setSelectedCategories] = useState(() => {
    try {
      const saved = sessionStorage.getItem('fgr_categories');
      if (saved) return new Set(JSON.parse(saved));
    } catch (e) {}
    return new Set();
  });
  const [sortBy, setSortBy] = useState(() => sessionStorage.getItem('fgr_sort') || 'newest');

  const searchInputRef = useRef(null);

  // Sync state to sessionStorage
  useEffect(() => {
    sessionStorage.setItem('fgr_search', search);
    sessionStorage.setItem('fgr_year', selectedYear);
    sessionStorage.setItem('fgr_month', selectedMonth);
    sessionStorage.setItem('fgr_sort', sortBy);
    sessionStorage.setItem('fgr_categories', JSON.stringify(Array.from(selectedCategories)));
  }, [search, selectedYear, selectedMonth, sortBy, selectedCategories]);

  // Set document title
  useEffect(() => {
    document.title = 'Catalog - FitGirl Repacks';
  }, []);

  // Keyboard shortcut: "/" to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape' && document.activeElement === searchInputRef.current) {
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  // Pagination via URL
  const { pageParam } = useParams();
  const navigate = useNavigate();
  const page = parseInt(pageParam, 10) || 1;
  const limit = 24;

  // Local state for page input (#10 fix)
  const [pageInputValue, setPageInputValue] = useState(String(page));
  useEffect(() => {
    setPageInputValue(String(page));
  }, [page]);


  useEffect(() => {
    fetchCatalog().then(data => {
      setAllGames(data);
      setFiltersData(getFilters(data));
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 220);
    return () => clearTimeout(timer);
  }, [search]);

  const toggleCategory = (cat) => {
    setSelectedCategories(prev => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  };

  const clearAllFilters = () => {
    setSearch('');
    setSelectedYear('');
    setSelectedMonth('');
    setSelectedCategories(new Set());
    setSortBy('newest');
  };

  const filteredGames = useMemo(() => {
    let result = allGames;
    
    if (debouncedSearch) {
      const s = debouncedSearch.toLowerCase();
      result = result.filter(g => g._searchString.includes(s));
    }
    
    if (selectedYear) {
      result = result.filter(g => g.year === selectedYear);
      if (selectedMonth !== '') {
        const m = parseInt(selectedMonth, 10);
        result = result.filter(g => g._month === m);
      }
    }
    
    if (selectedCategories.size > 0) {
      result = result.filter(g => g.categories && g.categories.some(c => selectedCategories.has(c)));
    }
    
    if (sortBy === 'newest') result = [...result].sort((a, b) => b._timestamp - a._timestamp);
    else if (sortBy === 'oldest') result = [...result].sort((a, b) => a._timestamp - b._timestamp);
    else if (sortBy === 'az') result = [...result].sort((a, b) => a._sortTitle < b._sortTitle ? -1 : 1);
    else if (sortBy === 'za') result = [...result].sort((a, b) => a._sortTitle > b._sortTitle ? -1 : 1);

    return result;
  }, [allGames, debouncedSearch, selectedYear, selectedMonth, selectedCategories, sortBy]);

  const totalPages = Math.ceil(filteredGames.length / limit) || 1;

  const commitPageInput = useCallback(() => {
    const p = parseInt(pageInputValue, 10);
    if (p >= 1 && p <= totalPages && p !== page) {
      navigate(`/${p}`);
    } else {
      setPageInputValue(String(page));
    }
  }, [pageInputValue, page, totalPages, navigate]);

  const paginatedGames = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredGames.slice(start, start + limit);
  }, [filteredGames, page, limit]);

  useEffect(() => {
    setSelectedMonth('');
  }, [selectedYear]);

  // Handle out-of-bounds pages
  useEffect(() => {
    if (!loading && page > totalPages) {
      navigate(totalPages === 1 ? '/' : `/${totalPages}`, { replace: true });
    }
  }, [loading, page, totalPages, navigate]);

  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      if (page !== 1) {
        navigate('/');
      }
    }
  }, [debouncedSearch, selectedYear, selectedMonth, selectedCategories, sortBy]);

  useEffect(() => {
    if (window.scrollY > 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [page, debouncedSearch, selectedYear, selectedMonth, selectedCategories, sortBy]);

  const hasFilters = debouncedSearch || selectedYear || selectedCategories.size > 0;

  return (
    <div className="main-layout">
      <button 
        className="filter-toggle-btn" 
        onClick={() => setMobileFiltersOpen(o => !o)}
      >
        {mobileFiltersOpen ? '✕ Hide Filters' : '☰ Filters'}
      </button>

      <aside className={`sidebar ${mobileFiltersOpen ? 'open' : ''}`}>
        <div className="filter-group">
          <h3>Search <kbd className="kbd-hint">/</kbd></h3>
          <input 
            ref={searchInputRef}
            type="text" 
            className="search-input" 
            placeholder="Search games..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <h3>Year Released</h3>
          <select 
            className="search-input" 
            value={selectedYear} 
            onChange={e => setSelectedYear(e.target.value)}
          >
            <option value="">All Years</option>
            {filtersData.years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {selectedYear && (
          <div className="filter-group">
            <h3>Month Released</h3>
            <select 
              className="search-input" 
              value={selectedMonth} 
              onChange={e => setSelectedMonth(e.target.value)}
            >
              <option value="">All Months</option>
              {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, i) => (
                <option key={i} value={i}>{m}</option>
              ))}
            </select>
          </div>
        )}

        <div className="filter-group">
          <div className="filter-group-header">
            <h3>Categories</h3>
            {selectedCategories.size > 0 && (
              <button className="clear-filter-btn" onClick={() => setSelectedCategories(new Set())}>
                Clear ({selectedCategories.size})
              </button>
            )}
          </div>
          <div className="filter-list">
            {filtersData.categories.map(c => (
              <label key={c} className="filter-label">
                <input 
                  type="checkbox" 
                  className="filter-checkbox"
                  checked={selectedCategories.has(c)}
                  onChange={() => toggleCategory(c)}
                />
                {c}
              </label>
            ))}
          </div>
        </div>
      </aside>

      <main className="content-area">
        <div className="sort-bar">
          {/* Total game count */}
          <span className="catalog-count">
            {loading ? '...' : (
              hasFilters
                ? `${filteredGames.length.toLocaleString()} of ${allGames.length.toLocaleString()}`
                : `${allGames.length.toLocaleString()} repacks`
            )}
          </span>
          {hasFilters && (
            <button className="clear-all-btn" onClick={clearAllFilters}>
              Clear All Filters
            </button>
          )}
          <label htmlFor="sort-select" className="sort-label">Sort:</label>
          <select id="sort-select" className="sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="az">A &rarr; Z</option>
            <option value="za">Z &rarr; A</option>
          </select>
        </div>

        {hasFilters && (
          <div className="active-filters">
            {debouncedSearch && (
              <span className="filter-chip">
                Search: "{debouncedSearch}"
                <button onClick={() => setSearch('')}>&#10005;</button>
              </span>
            )}
            {selectedYear && (
              <span className="filter-chip">
                Year: {selectedYear}
                <button onClick={() => setSelectedYear('')}>&#10005;</button>
              </span>
            )}
            {selectedCategories.size > 0 && (
              <span className="filter-chip">
                {selectedCategories.size} {selectedCategories.size === 1 ? 'category' : 'categories'}
                <button onClick={() => setSelectedCategories(new Set())}>&#10005;</button>
              </span>
            )}
            <span className="filter-result-count">{filteredGames.length.toLocaleString()} results</span>
          </div>
        )}

        {loading ? (
          <div className="grid">
            {Array.from({ length: 24 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : paginatedGames.length > 0 ? (
          <>
            <div className="grid">
              {paginatedGames.map((game, index) => (
                <GameCard key={game.id} game={game} priority={index < 6} />
              ))}
            </div>
            
            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  className="btn" 
                  disabled={page === 1}
                  onClick={() => navigate(`/1`)}
                  title="First Page"
                >
                  &laquo; First
                </button>
                <button 
                  className="btn" 
                  disabled={page === 1}
                  onClick={() => navigate(`/${page - 1}`)}
                >
                  &lsaquo; Prev
                </button>
                
                <span className="page-indicator">
                  Page 
                  <input 
                    type="number" 
                    className="page-input search-input"
                    value={pageInputValue}
                    min={1}
                    max={totalPages}
                    onChange={(e) => setPageInputValue(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') commitPageInput(); }}
                    onBlur={commitPageInput}
                    style={{ width: '70px', padding: '0.4rem', margin: '0 0.5rem', textAlign: 'center' }}
                  /> 
                  of {totalPages}
                </span>

                <button 
                  className="btn" 
                  disabled={page === totalPages}
                  onClick={() => navigate(`/${page + 1}`)}
                >
                  Next &rsaquo;
                </button>
                <button 
                  className="btn" 
                  disabled={page === totalPages}
                  onClick={() => navigate(`/${totalPages}`)}
                  title="Last Page"
                >
                  Last &raquo;
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            No games found matching your filters.
          </div>
        )}
      </main>

      <BackToTop />
    </div>
  );
}

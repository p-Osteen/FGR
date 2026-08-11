import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { fetchCatalog, getFilters, formatDate } from '../dataStore';
import { motion } from 'framer-motion';

const PLACEHOLDER = `${import.meta.env.BASE_URL}placeholder.svg`;

const SkeletonCard = () => (
  <div className="game-card skeleton-card">
    <div className="game-image-wrapper skeleton-image" />
    <div className="game-info">
      <div className="skeleton-line skeleton-title" />
      <div className="skeleton-line skeleton-date" />
    </div>
  </div>
);

const GameCard = ({ game }) => (
  <Link to={`/game/${game.id}`} className="game-card-link">
    <motion.div 
      className="game-card"
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
    >
      <div className="game-image-wrapper">
        <img src={game.image || PLACEHOLDER} alt={game.title} className="game-image" loading="lazy" />
      </div>
      <div className="game-info">
        <h3 className="game-title" title={game.title}>{game.title}</h3>
        <div className="game-meta">
          <span className="date">{formatDate(game.date)}</span>
        </div>
      </div>
    </motion.div>
  </Link>
);

export default function Catalog() {
  const [allGames, setAllGames] = useState([]);
  const [filtersData, setFiltersData] = useState({ years: [], categories: [] });
  const [loading, setLoading] = useState(true);
  
  // State for filters
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedCategories, setSelectedCategories] = useState(new Set());
  const [sortBy, setSortBy] = useState('newest');
  
  // Pagination via URL
  const { pageParam } = useParams();
  const navigate = useNavigate();
  const page = parseInt(pageParam, 10) || 1;
  const limit = 24;

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

  const filteredGames = useMemo(() => {
    let result = allGames;
    
    if (debouncedSearch) {
      const s = debouncedSearch.toLowerCase();
      result = result.filter(g => 
        g.title.toLowerCase().includes(s) || 
        (g.categories && g.categories.some(c => c.toLowerCase().includes(s)))
      );
    }
    
    if (selectedYear) {
      result = result.filter(g => g.year === selectedYear);
      if (selectedMonth !== '') {
        result = result.filter(g => {
          const d = new Date(g.date);
          return !isNaN(d) && d.getMonth() === parseInt(selectedMonth, 10);
        });
      }
    }
    
    if (selectedCategories.size > 0) {
      result = result.filter(g => g.categories && g.categories.some(c => selectedCategories.has(c)));
    }
    
    if (sortBy === 'newest') result = [...result].sort((a, b) => new Date(b.date) - new Date(a.date));
    else if (sortBy === 'oldest') result = [...result].sort((a, b) => new Date(a.date) - new Date(b.date));
    else if (sortBy === 'az') result = [...result].sort((a, b) => a.title.localeCompare(b.title));
    else if (sortBy === 'za') result = [...result].sort((a, b) => b.title.localeCompare(a.title));

    return result;
  }, [allGames, debouncedSearch, selectedYear, selectedMonth, selectedCategories, sortBy]);

  const totalPages = Math.ceil(filteredGames.length / limit) || 1;
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page, debouncedSearch, selectedYear, selectedMonth, selectedCategories, sortBy]);

  const hasFilters = debouncedSearch || selectedYear || selectedCategories.size > 0;

  return (
    <div className="main-layout">
      <aside className="sidebar">
        <div className="filter-group">
          <h3>Search</h3>
          <input 
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
          <h3>Categories</h3>
          {selectedCategories.size > 0 && (
            <button className="clear-filter-btn" onClick={() => setSelectedCategories(new Set())}>
              Clear ({selectedCategories.size})
            </button>
          )}
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
            <span className="filter-result-count">{filteredGames.length} results</span>
          </div>
        )}

        {loading ? (
          <div className="grid">
            {Array.from({ length: 24 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : paginatedGames.length > 0 ? (
          <>
            <div className="grid">
              {paginatedGames.map(game => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
            
            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  className="btn" 
                  disabled={page === 1}
                  onClick={() => navigate(`/${page - 1}`)}
                >
                  Previous
                </button>
                <span>Page {page} of {totalPages}</span>
                <button 
                  className="btn" 
                  disabled={page === totalPages}
                  onClick={() => navigate(`/${page + 1}`)}
                >
                  Next
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
    </div>
  );
}

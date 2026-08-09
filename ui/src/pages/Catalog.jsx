import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { fetchGamesData, getFilters } from '../dataStore';

const GameCard = ({ game }) => (
  <Link to={`/game/${game.id}`} className="game-card-link">
    <div className="game-card">
      <div className="game-image-wrapper">
        <img src={game.image || 'https://via.placeholder.com/300x400?text=No+Image'} alt={game.title} className="game-image" loading="lazy" />
      </div>
      <div className="game-info">
        <h3 className="game-title" title={game.title}>{game.title}</h3>
        <div className="game-meta">
          <span className="date">{new Date(game.date).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  </Link>
);

export default function Catalog() {
  const [allGames, setAllGames] = useState([]);
  const [filtersData, setFiltersData] = useState({ years: [], categories: [] });
  const [loading, setLoading] = useState(true);

  // State for filters
  const [search, setSearch] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const limit = 24;

  useEffect(() => {
    fetchGamesData().then(data => {
      setAllGames(data);
      setFiltersData(getFilters(data));
      setLoading(false);
    });
  }, []);

  const filteredGames = useMemo(() => {
    let result = allGames;

    if (search) {
      const s = search.toLowerCase();
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

    if (selectedCategory) {
      result = result.filter(g => g.categories && g.categories.includes(selectedCategory));
    }

    return result;
  }, [allGames, search, selectedYear, selectedMonth, selectedCategory]);

  const totalPages = Math.ceil(filteredGames.length / limit) || 1;
  const paginatedGames = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredGames.slice(start, start + limit);
  }, [filteredGames, page, limit]);

  // Reset month when year changes
  useEffect(() => {
    setSelectedMonth('');
  }, [selectedYear]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, selectedYear, selectedMonth, selectedCategory]);

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
            style={{ width: '100%' }}
          />
        </div>

        <div className="filter-group">
          <h3>Year Released</h3>
          <select 
            className="search-input" 
            value={selectedYear} 
            onChange={e => setSelectedYear(e.target.value)}
            style={{ padding: '0.5rem', width: '100%' }}
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
              style={{ padding: '0.5rem', width: '100%' }}
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
          <select
            className="search-input"
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            style={{ padding: '0.5rem', width: '100%' }}
          >
            <option value="">All Categories</option>
            {filtersData.categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </aside>

      <main className="content-area">
        {loading ? (
          <div className="loading">Loading library...</div>
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
                  onClick={() => setPage(p => p - 1)}
                >
                  Previous
                </button>
                <span>Page {page} of {totalPages}</span>
                <button
                  className="btn"
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
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

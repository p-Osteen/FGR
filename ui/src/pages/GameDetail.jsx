import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchGamesData } from '../dataStore';

export default function GameDetail() {
  const { id } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchGamesData()
      .then(games => {
        const found = games.find(g => g.id === id);
        if (found) {
          setGame(found);
        } else {
          setError('Game not found');
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (!loading && game && game.mirrorsHtml) {
      const titles = document.querySelectorAll('.su-spoiler-title');
      const toggleSpoiler = function () {
        const parent = this.parentElement;
        parent.classList.toggle('su-spoiler-closed');
      };
      titles.forEach(t => t.addEventListener('click', toggleSpoiler));
      return () => {
        titles.forEach(t => t.removeEventListener('click', toggleSpoiler));
      };
    }
  }, [loading, game]);

  if (loading) {
    return <div className="detail-page"><div className="loading">Loading details...</div></div>;
  }

  if (error || !game) {
    return (
      <div className="detail-page">
        <Link to="/" className="back-link">&larr; Back to Catalog</Link>
        <div className="empty-state">{error || 'Game not found'}</div>
      </div>
    );
  }

  return (
    <div className="detail-page">
      <Link to="/" className="back-link">&larr; Back to Catalog</Link>
      <div className="detail-content">
        <div className="detail-image-col">
          <img src={game.image || 'https://via.placeholder.com/400x533?text=No+Image'} alt={game.title} />
        </div>
        <div className="detail-info-col">
          <h1 className="detail-title">{game.title}</h1>
          <div className="detail-tags">
            <span className="tag">Added: {new Date(game.date).toLocaleDateString()}</span>
            {game.categories && game.categories.map(c => (
              <span key={c} className="tag">{c}</span>
            ))}
          </div>

          <div className="metadata-section" style={{ marginBottom: '2rem' }}>
            {game.genres && <p><strong>Genres/Tags:</strong> {game.genres}</p>}
            {game.companies && <p><strong>Companies:</strong> {game.companies}</p>}
            {game.languages && <p><strong>Languages:</strong> {game.languages}</p>}
            {game.originalSize && <p><strong>Original Size:</strong> {game.originalSize}</p>}
            {game.repackSize && <p><strong>Repack Size:</strong> {game.repackSize}</p>}
          </div>

          <div className="download-section">
            {game.mirrorsHtml ? (
              <div
                className="og-mirrors-container"
                dangerouslySetInnerHTML={{ __html: game.mirrorsHtml }}
              />
            ) : game.links && game.links.length > 0 ? (
              <>
                <h3>Download Links</h3>
                <div className="text-links-list">
                  {game.links.map((link, idx) => (
                    <div key={idx} className="text-link-item">
                      <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-link">
                        {link.name}
                      </a>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>No links found for this title.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

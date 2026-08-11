import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchGameDetail, formatDate } from '../dataStore';
import DOMPurify from 'dompurify';
import UpdatesDigest from './UpdatesDigest';

const PLACEHOLDER = `${import.meta.env.BASE_URL}placeholder.svg`;

export default function GameDetail() {
  const { id } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchGameDetail(id)
      .then(g => {
        setGame(g);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (game && game.title) {
      document.title = `${game.title} - FitGirl Repacks`;
    }
  }, [game]);

  useEffect(() => {
    if (!loading && game && game.mirrorsHtml) {
      const titles = document.querySelectorAll('.su-spoiler-title');
      const toggleSpoiler = function() {
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
    return (
      <div className="detail-page">
        <Link to="/" className="back-link">&larr; Back to Catalog</Link>
        <div className="detail-content">
          <div className="detail-image-col">
            <div className="skeleton-image" style={{ width: '100%', paddingTop: '133%', borderRadius: '12px' }} />
          </div>
          <div className="detail-info-col" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="skeleton-line" style={{ height: '3.5rem', width: '80%' }} />
            <div className="skeleton-line" style={{ height: '1.5rem', width: '40%', marginBottom: '1.5rem' }} />
            <div className="skeleton-line" style={{ height: '1rem', width: '100%' }} />
            <div className="skeleton-line" style={{ height: '1rem', width: '90%' }} />
            <div className="skeleton-line" style={{ height: '1rem', width: '95%' }} />
            <div className="skeleton-line" style={{ height: '1rem', width: '60%' }} />
          </div>
        </div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="detail-page">
        <Link to="/" className="back-link">&larr; Back to Catalog</Link>
        <div className="empty-state">{error || 'Game not found'}</div>
      </div>
    );
  }

  // Data-driven detection: check categories instead of URL string matching
  if (game.categories?.includes('Updates Digest')) {
    const pageData = {
      title: game.title,
      content: game.mirrorsHtml
    };
    return <UpdatesDigest pageData={pageData} />;
  }

  return (
    <div className="detail-page">
      <Link to="/" className="back-link">&larr; Back to Catalog</Link>
      <div className="detail-content">
        <div className="detail-image-col">
          <img src={game.image || PLACEHOLDER} alt={game.title} />
        </div>
        <div className="detail-info-col">
          <h1 className="detail-title">{game.title}</h1>
          <div className="detail-tags">
            <span className="tag">Added: {formatDate(game.date)}</span>
            {game.categories && game.categories.map(c => (
              <span key={c} className="tag">{c}</span>
            ))}
          </div>

          <div className="metadata-section">
            {game.genres && <p><strong>Genres/Tags:</strong> {game.genres}</p>}
            {game.companies && <p><strong>Companies:</strong> {game.companies}</p>}
            {game.languages && <p><strong>Languages:</strong> {game.languages}</p>}
            {game.originalSize && <p><strong>Original Size:</strong> {game.originalSize}</p>}
            {game.repackSize && <p><strong>Repack Size:</strong> {game.repackSize}</p>}
            {game.discussionUrl && (
              <p>
                <a href={game.discussionUrl} target="_blank" rel="noopener noreferrer">
                  Discussion and (possible) future updates on CS.RIN.RU thread
                </a>
              </p>
            )}
          </div>
          
          <div className="download-section">
            <h2>Download Links</h2>
            {game.mirrorsHtml ? (
              <div 
                className="og-mirrors-container"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(game.mirrorsHtml) }}
              />
            ) : (
              <p>No links available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

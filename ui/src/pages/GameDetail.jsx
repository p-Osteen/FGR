import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchGameDetail, formatDate } from '../dataStore';
import DOMPurify from 'dompurify';
import UpdatesDigest from './UpdatesDigest';

const PLACEHOLDER = `${import.meta.env.BASE_URL}placeholder.svg`;

export default function GameDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const handleBack = (e) => {
    e.preventDefault();
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

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
        <a href="/" onClick={handleBack} className="back-link">&larr; Back to Catalog</a>
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
        <a href="/" onClick={handleBack} className="back-link">&larr; Back to Catalog</a>
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
      <a href="/" onClick={handleBack} className="back-link">&larr; Back to Catalog</a>
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

          {game.backwardsCompatibility && (
            <div className="compatibility-notice">
              <strong>Compatibility Notice:</strong> {game.backwardsCompatibility}
            </div>
          )}

          {game.gameDescriptionHtml && (
            <details className="description-tile">
              <summary>Game Description</summary>
              <div 
                className="description-content"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(game.gameDescriptionHtml) }}
              />
            </details>
          )}
          
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

          {game.screenshots && game.screenshots.length > 0 && (
            <div className="screenshots-section">
              <h2>Screenshots</h2>
              <div className="screenshots-grid">
                {game.screenshots.map((src, index) => (
                  <a key={index} href={src} target="_blank" rel="noopener noreferrer">
                    <img src={src} alt={`${game.title} screenshot ${index + 1}`} loading="lazy" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {game.repackFeatures && game.repackFeatures.length > 0 && (
            <div className="features-section">
              <h2>Repack Features</h2>
              <ul>
                {game.repackFeatures.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

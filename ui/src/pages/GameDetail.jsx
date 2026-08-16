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
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const openLightbox = (index, e) => {
    e.preventDefault();
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev > 0 ? prev - 1 : game.screenshots.length - 1));
  };

  const nextImage = (e) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev < game.screenshots.length - 1 ? prev + 1 : 0));
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') prevImage(e);
      if (e.key === 'ArrowRight') nextImage(e);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, game]);

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
      <div className="detail-hero">
        <div 
          className="detail-hero-bg" 
          style={{ backgroundImage: `url(${game.screenshots?.[0] || game.image || PLACEHOLDER})` }} 
        />
        <div className="detail-hero-overlay"></div>
        <div className="detail-hero-content">
          <a href="/" onClick={handleBack} className="back-link">&larr; Back to Catalog</a>
          <div className="hero-info">
            <h1 className="detail-title">{game.title}</h1>
            <div className="detail-tags">
              <span className="tag hero-tag">Added: {formatDate(game.date)}</span>
              {game.categories && game.categories.map(c => (
                <span key={c} className="tag hero-tag">{c}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="detail-content">
        <div className="detail-sidebar">
          <div className="detail-image-wrapper">
            <img src={game.image || PLACEHOLDER} alt={game.title} className="detail-poster" />
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

        <div className="detail-main">
          <div className="metadata-grid">
            {game.genres && <div className="meta-card"><span className="meta-label">Genres/Tags</span><span className="meta-value">{game.genres}</span></div>}
            {game.companies && <div className="meta-card"><span className="meta-label">Companies</span><span className="meta-value">{game.companies}</span></div>}
            {game.languages && <div className="meta-card"><span className="meta-label">Languages</span><span className="meta-value">{game.languages}</span></div>}
            {game.originalSize && <div className="meta-card"><span className="meta-label">Original Size</span><span className="meta-value">{game.originalSize}</span></div>}
            {game.repackSize && <div className="meta-card"><span className="meta-label">Repack Size</span><span className="meta-value">{game.repackSize}</span></div>}
          </div>

          {game.discussionUrl && (
            <div className="discussion-link-wrapper">
              <a href={game.discussionUrl} target="_blank" rel="noopener noreferrer" className="discussion-link">
                &#128172; Discussion and future updates on CS.RIN.RU
              </a>
            </div>
          )}

          {game.backwardsCompatibility && (
            <div className="compatibility-notice">
              <strong>Compatibility Notice:</strong> {game.backwardsCompatibility}
            </div>
          )}

          {game.repackFeatures && game.repackFeatures.length > 0 && (
            <div className="features-section">
              <h2>Repack Features</h2>
              <ul className="styled-features-list">
                {game.repackFeatures.map((feature, index) => (
                  <li key={index}><span className="feature-icon">&#10003;</span> <span dangerouslySetInnerHTML={{__html: feature}} /></li>
                ))}
              </ul>
            </div>
          )}

          {game.gameDescriptionHtml && (
            <div className="description-section">
              <h2>Game Description</h2>
              <div 
                className="description-content"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(game.gameDescriptionHtml) }}
              />
            </div>
          )}

          {game.screenshots && game.screenshots.length > 0 && (
            <div className="screenshots-section">
              <h2>Screenshots</h2>
              <div className="screenshots-grid-masonry">
                {game.screenshots.map((src, index) => (
                  <a key={index} href={src} onClick={(e) => openLightbox(index, e)} className="screenshot-item">
                    <img src={src} alt={`${game.title} screenshot ${index + 1}`} loading="lazy" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {lightboxIndex !== null && game.screenshots && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <div className="lightbox-content">
            <button className="lightbox-close" onClick={closeLightbox}>&times;</button>
            <button className="lightbox-prev" onClick={prevImage}>&#10094;</button>
            <img 
              src={game.screenshots[lightboxIndex]} 
              alt={`Screenshot ${lightboxIndex + 1}`} 
              className="lightbox-img" 
              onClick={(e) => e.stopPropagation()}
            />
            <button className="lightbox-next" onClick={nextImage}>&#10095;</button>
          </div>
          <div className="lightbox-caption">
            {lightboxIndex + 1} / {game.screenshots.length}
          </div>
        </div>
      )}
    </div>
  );
}

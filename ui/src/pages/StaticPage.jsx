import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchPagesData } from '../dataStore';

export default function StaticPage() {
  const { slug } = useParams();
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    fetchPagesData()
      .then(pages => {
        if (pages && pages[slug]) {
          setPageData(pages[slug]);
        } else {
          setError('Page not found in scraped data.');
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return <div className="detail-page"><div className="loading">Loading page...</div></div>;
  }

  if (error || !pageData) {
    return (
      <div className="detail-page">
        <Link to="/" className="back-link">&larr; Back to Catalog</Link>
        <div className="empty-state">{error || 'Page not found'}</div>
      </div>
    );
  }

  return (
    <div className="detail-page">
      <Link to="/" className="back-link">&larr; Back to Catalog</Link>
      <div className="detail-content" style={{ display: 'block' }}>
        <h1 className="detail-title">{pageData.title}</h1>
        {pageData.content ? (
          <div 
            className="og-mirrors-container static-html-content"
            dangerouslySetInnerHTML={{ __html: pageData.content }}
            style={{ marginTop: '2rem' }}
          />
        ) : (
          <p style={{ marginTop: '2rem' }}>No content scraped for this page.</p>
        )}
      </div>
    </div>
  );
}

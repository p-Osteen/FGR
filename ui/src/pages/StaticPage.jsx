import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchPagesData } from '../dataStore';
import DOMPurify from 'dompurify';
import UpdatesDigest from './UpdatesDigest';
import useBackNavigation from '../hooks/useBackNavigation';
import useSpoilerToggle from '../hooks/useSpoilerToggle';

export default function StaticPage() {
  const { slug } = useParams();
  const handleBack = useBackNavigation();
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Use shared spoiler toggle hook
  useSpoilerToggle(!loading && pageData && !!pageData.content);

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

  useEffect(() => {
    if (pageData && pageData.title) {
      document.title = `${pageData.title} - FitGirl Repacks`;
    }
  }, [pageData]);

  if (loading) {
    return <div className="detail-page"><div className="loading">Loading page...</div></div>;
  }

  if (error || !pageData) {
    return (
      <div className="detail-page">
        <a href="/" onClick={handleBack} className="back-link">&larr; Back to Catalog</a>
        <div className="empty-state">{error || 'Page not found'}</div>
      </div>
    );
  }

  // Data-driven detection: check categories instead of URL string matching
  if (pageData.categories?.includes('Updates Digest')) {
    return <UpdatesDigest pageData={pageData} />;
  }

  return (
    <div className="detail-page">
      <a href="/" onClick={handleBack} className="back-link">&larr; Back to Catalog</a>
      <div className="detail-content" style={{ display: 'block' }}>
        <h1 className="detail-title">{pageData.title}</h1>
        {pageData.content ? (
          <div 
            className="og-mirrors-container static-html-content"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(pageData.content) }}
            style={{ marginTop: '2rem' }}
          />
        ) : (
          <p style={{ marginTop: '2rem' }}>No content scraped for this page.</p>
        )}
      </div>
    </div>
  );
}

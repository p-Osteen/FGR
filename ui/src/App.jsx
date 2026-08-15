import React, { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ErrorBoundary from './components/ErrorBoundary';
import Catalog from './pages/Catalog';
import './index.css';

const GameDetail = lazy(() => import('./pages/GameDetail'));
const StaticPage = lazy(() => import('./pages/StaticPage'));

import { fetchMetadata } from './dataStore';

export default function App() {
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchMetadata().then(data => {
      if (data && data.lastUpdated) {
        setLastUpdated(data.lastUpdated);
      }
    });
  }, []);

  return (
    <Router basename="/FGR">
      <div className="app-container">
        <Navbar />
        <ErrorBoundary>
          <main className="main-content-wrapper">
            <Suspense fallback={
              <div className="detail-page" style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '2rem' }}>
                <div className="skeleton-line" style={{ height: '3rem', width: '50%', margin: '0 0 2rem' }} />
                <div className="skeleton-line" style={{ height: '1.5rem', width: '100%', margin: '0 0 1rem' }} />
                <div className="skeleton-line" style={{ height: '1.5rem', width: '90%', margin: '0 0 1rem' }} />
                <div className="skeleton-line" style={{ height: '1.5rem', width: '95%', margin: '0 0 1rem' }} />
              </div>
            }>
              <Routes>
                <Route path="/" element={<Catalog />} />
                <Route path="/:pageParam" element={<Catalog />} />
                <Route path="/game/:id" element={<GameDetail />} />
                <Route path="/page/:slug" element={<StaticPage />} />
              </Routes>
            </Suspense>
          </main>
        </ErrorBoundary>
        <footer className="site-footer">
          <p>
            <strong>Disclaimer:</strong> This is an unofficial, forked version of the FitGirl Repacks website. 
            It was created to provide a cleaner, more modern, and easier-to-use interface than the original site. 
            All data is sourced from the official FitGirl Repacks site.
          </p>
          {lastUpdated && (
            <p className="last-updated" style={{ marginTop: '0.5rem', color: 'var(--text-muted, #888)' }}>
              Last updated on: {new Date(lastUpdated).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
            </p>
          )}
        </footer>
      </div>
    </Router>
  );
}

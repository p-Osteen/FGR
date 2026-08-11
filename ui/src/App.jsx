import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ErrorBoundary from './components/ErrorBoundary';
import Catalog from './pages/Catalog';
import './index.css';

const GameDetail = lazy(() => import('./pages/GameDetail'));
const StaticPage = lazy(() => import('./pages/StaticPage'));

export default function App() {
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
        </footer>
      </div>
    </Router>
  );
}

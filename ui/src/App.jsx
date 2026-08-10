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
          <Suspense fallback={<div className="loading">Loading...</div>}>
            <Routes>
              <Route path="/" element={<Catalog />} />
              <Route path="/:pageParam" element={<Catalog />} />
              <Route path="/game/:id" element={<GameDetail />} />
              <Route path="/page/:slug" element={<StaticPage />} />
            </Routes>
          </Suspense>
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

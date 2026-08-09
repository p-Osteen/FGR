import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Catalog from './pages/Catalog';
import GameDetail from './pages/GameDetail';
import StaticPage from './pages/StaticPage';
import './index.css';

export default function App() {
  return (
    <Router basename="/FGR">
      <div className="app-container">
        <Navbar />
        <Routes>
          <Route path="/" element={<Catalog />} />
          <Route path="/game/:id" element={<GameDetail />} />
          <Route path="/page/:slug" element={<StaticPage />} />
        </Routes>
      </div>
    </Router>
  );
}

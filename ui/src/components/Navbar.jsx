import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <header className="topbar">
      <Link to="/" className="logo-link">
        <h1>FitGirl Repacks</h1>
      </Link>
      
      <nav className="site-navigation">
        <ul className="nav-menu">
          <li className="menu-item">
            <Link to="/page/faq">FAQ</Link>
          </li>
          
          <li className="menu-item has-dropdown">
            <Link to="/page/repacks-troubleshooting">Repacks Troubleshooting</Link>
            <ul className="sub-menu">
              <li><Link to="/page/hypervisor-guide">Hypervisor Guide</Link></li>
            </ul>
          </li>
        </ul>
      </nav>
    </header>
  );
}

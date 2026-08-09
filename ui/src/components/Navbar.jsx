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
          <li className="menu-item has-dropdown">
            <Link to="/page/popular-repacks">Popular Repacks</Link>
            <ul className="sub-menu">
              <li><Link to="/page/pop-repacks">Top 50 Repacks of the Month</Link></li>
              <li><Link to="/page/popular-repacks-of-the-year">Top 150 Repacks of The Year</Link></li>
            </ul>
          </li>
          
          <li className="menu-item has-dropdown">
            <Link to="/page/all-my-repacks-a-z">All My Repacks, A-Z</Link>
            <ul className="sub-menu">
              <li><Link to="/page/games-with-my-personal-pink-paw-award">Games with my personal Pink Paw Award</Link></li>
              <li><Link to="/page/all-hypervisor-bypassed-repacks-a-z">All Hypervisor Bypassed Repacks, A-Z</Link></li>
              <li><Link to="/page/all-switch-emulated-repacks-a-z">Switch Emulated Repacks</Link></li>
              <li><Link to="/page/all-playstation-3-emulated-repacks-a-z">PlayStation 3 Emulated Repacks</Link></li>
            </ul>
          </li>
          
          <li className="menu-item has-dropdown">
            <Link to="/page/updates-list">Updates List</Link>
            <ul className="sub-menu">
              <li><Link to="/page/updates-digest">Updates Digest</Link></li>
            </ul>
          </li>
          
          <li className="menu-item">
            <Link to="/page/faq">FAQ</Link>
          </li>
          
          <li className="menu-item has-dropdown">
            <Link to="/page/repacks-troubleshooting">Repacks Troubleshooting</Link>
            <ul className="sub-menu">
              <li><Link to="/page/hypervisor-guide">Hypervisor Guide</Link></li>
            </ul>
          </li>
          
          <li className="menu-item">
            <Link to="/page/contacts">Contacts</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

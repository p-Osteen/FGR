import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="topbar">
      <Link to="/" className="logo-link">
        <h1><span className="logo-fitgirl">FitGirl</span> <span className="logo-repacks">Repacks</span></h1>
      </Link>
      
      <nav className="site-navigation">
        <ul className="nav-menu">
          <li className="menu-item">
            <Link to="/page/faq">FAQ</Link>
          </li>
          
          <li className="menu-item has-dropdown" ref={dropdownRef}>
            <button 
              className="dropdown-trigger" 
              onClick={() => setDropdownOpen(o => !o)}
              aria-expanded={dropdownOpen}
            >
              Repacks Troubleshooting &#9662;
            </button>
            <AnimatePresence>
              {dropdownOpen && (
                <motion.ul 
                  className="sub-menu"
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ type: "spring", damping: 20, stiffness: 300 }}
                  style={{ transformOrigin: 'top center' }}
                >
                  <li>
                    <Link to="/page/repacks-troubleshooting" onClick={() => setDropdownOpen(false)}>
                      Repacks Troubleshooting
                    </Link>
                  </li>
                  <li>
                    <Link to="/page/hypervisor-guide" onClick={() => setDropdownOpen(false)}>
                      Hypervisor Guide
                    </Link>
                  </li>
                </motion.ul>
              )}
            </AnimatePresence>
          </li>
        </ul>
      </nav>
    </header>
  );
}

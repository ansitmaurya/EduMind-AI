import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Menu, X, LogIn, ArrowRight, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const isHome = location.pathname === '/';

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const closeMenu = () => setMobileMenuOpen(false);

  // Handles smooth in-page anchor scrolling if already on Home, or navigate to Home with hash
  const getNavLink = (hash) => {
    return isHome ? hash : `/${hash}`;
  };

  return (
    <header className="header-nav">
      <div className="container nav-container">
        {/* EduMind AI Logo */}
        <Link to="/" className="brand-logo" onClick={closeMenu}>
          <div className="brand-icon">
            <Sparkles size={20} />
          </div>
          <span>EduMind <span className="gradient-text">AI</span></span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav aria-label="Main Navigation">
          <ul className="nav-links">
            <li>
              <Link to="/" className={`nav-link ${isHome ? 'active' : ''}`}>
                Home
              </Link>
            </li>
            <li>
              <a href={getNavLink('#features')} className="nav-link">
                Features
              </a>
            </li>
            <li>
              <a href={getNavLink('#how-it-works')} className="nav-link">
                How It Works
              </a>
            </li>
            <li>
              <a href={getNavLink('#about')} className="nav-link">
                About
              </a>
            </li>
          </ul>
        </nav>

        {/* Desktop Auth Actions */}
        <div className="nav-actions">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="btn btn-primary btn-sm">
                <Sparkles size={15} />
                <span>Dashboard ({user?.full_name ? user.full_name.split(' ')[0] : 'Learner'})</span>
              </Link>
              <button onClick={logout} className="btn btn-secondary btn-sm" title="Log out">
                <LogOut size={15} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm">
                <LogIn size={15} />
                <span>Login</span>
              </Link>
              <Link to="/signup" className="btn btn-primary btn-sm">
                <span>Get Started</span>
                <ArrowRight size={15} />
              </Link>
            </>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="mobile-menu-btn"
            onClick={toggleMobileMenu}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-nav open">
          <Link to="/" className={`nav-link ${isHome ? 'active' : ''}`} onClick={closeMenu}>
            Home
          </Link>
          <a href={getNavLink('#features')} className="nav-link" onClick={closeMenu}>
            Features
          </a>
          <a href={getNavLink('#how-it-works')} className="nav-link" onClick={closeMenu}>
            How It Works
          </a>
          <a href={getNavLink('#about')} className="nav-link" onClick={closeMenu}>
            About
          </a>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0' }}>
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="btn btn-primary" onClick={closeMenu}>
                  <span>Open Dashboard</span>
                </Link>
                <button
                  onClick={() => { logout(); closeMenu(); }}
                  className="btn btn-secondary"
                  style={{ width: '100%' }}
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary" onClick={closeMenu}>
                  <LogIn size={16} />
                  <span>Sign In</span>
                </Link>
                <Link to="/signup" className="btn btn-primary" onClick={closeMenu}>
                  <span>Create Free Account</span>
                  <ArrowRight size={16} />
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

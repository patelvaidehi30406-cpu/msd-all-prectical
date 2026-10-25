import React from 'react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      <div className="container navbar-content">
        <div className="brand">
          <div className="brand-icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <line x1="10" y1="9" x2="8" y2="9" />
            </svg>
          </div>
          <div>
            <span className="brand-title">DocVault</span>
            <span className="brand-subtitle">Practical 13 &bull; MERN Document Manager</span>
          </div>
        </div>

        {user && (
          <div className="navbar-user">
            <div className="user-pill">
              <span className="user-avatar">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </span>
              <div className="user-details">
                <span className="user-name">{user.name}</span>
                <span className="user-email">{user.email}</span>
              </div>
            </div>
            <button type="button" className="btn btn-outline btn-sm" onClick={logout}>
              Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;

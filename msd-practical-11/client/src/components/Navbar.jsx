import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="brand-logo">✍️</span>
          <span>DevPulse</span>
          <span className="brand-tag">MERN Blog</span>
        </Link>

        <nav className="navbar-links">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive ? 'nav-link active' : 'nav-link'
            }
          >
            All Posts
          </NavLink>

          {isAuthenticated && (
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
            >
              Dashboard
            </NavLink>
          )}
        </nav>

        <div className="navbar-actions">
          {isAuthenticated ? (
            <div className="user-menu">
              <div className="user-badge-group">
                <span className="user-greeting">{user.name}</span>
                <span
                  className={`role-badge ${
                    isAdmin ? 'role-admin' : 'role-user'
                  }`}
                >
                  {user.role.toUpperCase()}
                </span>
              </div>
              <Link to="/dashboard?create=true" className="btn btn-primary btn-sm">
                + New Post
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="btn btn-outline btn-sm"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="guest-menu">
              <Link to="/login" className="btn btn-outline btn-sm">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;

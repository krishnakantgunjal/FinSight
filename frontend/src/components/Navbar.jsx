import React from 'react';

import { Menu, User } from 'lucide-react';

function Navbar({ user, theme, setTheme, onMenuClick }) {
  return (
    <div className="navbar navbar-no-search glass">
      <button className="menu-btn" onClick={onMenuClick} aria-label="Open menu">
        <Menu size={20} />
      </button>

      <div className="mobile-navbar-brand">
        <img className="mobile-brand-logo" src="/logo.png" alt="FinSight" />
      </div>

      <div className="navbar-actions">
        <button onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} className="theme-toggle-btn">
          {theme === 'dark' ? <span title="Switch to Light Mode">☀️</span> : <span title="Switch to Dark Mode">🌙</span>}
        </button>

        <div className="user-profile">
          <div className="user-info">
            <span className="user-name">{user.name}</span>
            <span className="user-role">Premium User</span>
          </div>
          <div className="avatar">
            <User size={20} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Navbar;

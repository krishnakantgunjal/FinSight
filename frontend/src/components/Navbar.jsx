import React from 'react';

import { User } from 'lucide-react';

function Navbar({ user, theme, setTheme }) {
  return (
    <div className="navbar navbar-no-search glass">
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

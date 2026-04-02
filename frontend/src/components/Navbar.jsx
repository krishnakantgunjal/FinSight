import React, { useContext, useState, useEffect } from 'react';

import { User, Bell, Search } from 'lucide-react';
import { SearchContext } from '../context/SearchContext';

function Navbar({ user, theme, setTheme }) {
  const { searchQuery, setSearchQuery } = useContext(SearchContext);
  const searchInputRef = React.useRef(null);
  const [localSearch, setLocalSearch] = useState(searchQuery);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, setSearchQuery]);

  return (
    <div className="navbar glass">
      <div className="navbar-search">
        <Search size={18} className="search-icon" />
        <input 
          ref={searchInputRef}
          type="text" 
          placeholder="Search transactions... (Cmd+K)" 
          className="search-input" 
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
        />
      </div>


      <div className="navbar-actions">
        <button onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} className="theme-toggle-btn">
          {theme === 'dark' ? <span title="Switch to Light Mode">☀️</span> : <span title="Switch to Dark Mode">🌙</span>}
        </button>
        <button className="action-btn">
          <Bell size={20} />
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

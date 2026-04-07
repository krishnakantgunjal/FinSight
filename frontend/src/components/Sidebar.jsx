import React from 'react';
import { NavLink } from 'react-router-dom';
import { PlusCircle, PieChart, LogOut, LayoutDashboard, Database, Settings as SettingsIcon, Repeat, Target, Upload, X } from 'lucide-react';

function Sidebar({ logout, user, isOpen, onClose }) {
  const handleNavClick = () => {
    if (onClose) onClose();
  };

  return (
    <>
      <button
        className={`sidebar-overlay ${isOpen ? 'show' : ''}`}
        onClick={onClose}
        aria-label="Close sidebar overlay"
      />
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <img
            className="brand-logo"
            src="/logo.png"
            alt="FinSight"
            loading="eager"
          />
          <button className="sidebar-close-btn" onClick={onClose} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/" onClick={handleNavClick} className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/add-expense" onClick={handleNavClick} className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            <PlusCircle size={20} />
            <span>Expenses</span>
          </NavLink>
          <NavLink to="/add-income" onClick={handleNavClick} className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            <Database size={20} />
            <span>Income</span>
          </NavLink>
          <NavLink to="/set-budget" onClick={handleNavClick} className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            <PieChart size={20} />
            <span>Budget</span>
          </NavLink>
          <NavLink to="/recurring" onClick={handleNavClick} className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            <Repeat size={20} />
            <span>Recurring</span>
          </NavLink>
          <NavLink to="/goals" onClick={handleNavClick} className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            <Target size={20} />
            <span>Goals</span>
          </NavLink>
          <NavLink to="/import" onClick={handleNavClick} className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            <Upload size={20} />
            <span>Import CSV</span>
          </NavLink>
          <NavLink to="/settings" onClick={handleNavClick} className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            <SettingsIcon size={20} />
            <span>Settings</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <button onClick={logout} className="logout-btn">
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
}

export default Sidebar;

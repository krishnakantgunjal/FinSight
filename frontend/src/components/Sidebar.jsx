import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, PlusCircle, PieChart, LogOut, LayoutDashboard, Database, Settings as SettingsIcon, Repeat, Target, Upload } from 'lucide-react';

function Sidebar({ logout, user }) {
  return (
    <div className="sidebar">
      <div className="sidebar-brand">
        <img
          className="brand-logo"
          src="/logo.png"
          alt="FinSight"
          loading="eager"
        />
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/add-expense" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
          <PlusCircle size={20} />
          <span>Expenses</span>
        </NavLink>
        <NavLink to="/add-income" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
          <Database size={20} />
          <span>Income</span>
        </NavLink>
        <NavLink to="/set-budget" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
          <PieChart size={20} />
          <span>Budget</span>
        </NavLink>
        <NavLink to="/recurring" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
          <Repeat size={20} />
          <span>Recurring</span>
        </NavLink>
        <NavLink to="/goals" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
          <Target size={20} />
          <span>Goals</span>
        </NavLink>
        <NavLink to="/import" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
          <Upload size={20} />
          <span>Import CSV</span>
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
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
  );
}

export default Sidebar;

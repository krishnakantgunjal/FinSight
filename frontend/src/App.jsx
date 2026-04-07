import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import AddExpense from './pages/AddExpense';
import AddIncome from './pages/AddIncome';
import SetBudget from './pages/SetBudget';
import Settings from './pages/Settings';
import Recurring from './pages/Recurring';
import Goals from './pages/Goals';
import Import from './pages/Import';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

import { Toaster } from 'react-hot-toast';

import './App.css';

function App() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      if (saved && saved !== 'undefined') {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Session parse error:', e);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState(() => 
    localStorage.getItem('theme') || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {

    const token = localStorage.getItem('token');
    if (token) {
      // Potentially verify token here
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);

  if (isLoading) return <div className="loading">Loading...</div>;

  return (
    <Router>
      <Toaster position="top-right" />
      <div className="app-container">
        {user && <Sidebar logout={logout} user={user} isOpen={sidebarOpen} onClose={closeSidebar} />}
        <main className={user ? 'main-with-sidebar' : 'main-full'}>
          {user && <Navbar user={user} theme={theme} setTheme={setTheme} onMenuClick={openSidebar} />}

          <div className="content">
            <Routes>
              <Route path="/login" element={!user ? <Login login={login} /> : <Navigate to="/" />} />
              <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
              
              <Route path="/" element={user ? <ErrorBoundary><Dashboard user={user} /></ErrorBoundary> : <Navigate to="/login" />} />

              <Route path="/add-expense" element={user ? <AddExpense /> : <Navigate to="/login" />} />
              <Route path="/add-income" element={user ? <AddIncome /> : <Navigate to="/login" />} />
              <Route path="/set-budget" element={user ? <SetBudget /> : <Navigate to="/login" />} />
              <Route path="/settings" element={user ? <Settings user={user} setUser={setUser} /> : <Navigate to="/login" />} />
              <Route path="/recurring" element={user ? <Recurring /> : <Navigate to="/login" />} />
              <Route path="/goals" element={user ? <Goals /> : <Navigate to="/login" />} />
              <Route path="/import" element={user ? <Import /> : <Navigate to="/login" />} />
              
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </main>
      </div>
      {user && (
        <Link to="/add-expense" className="fab-action" aria-label="Add expense">
          <Plus size={24} />
        </Link>
      )}
    </Router>
  );
}

export default App;


import React, { useState, useEffect, useContext } from 'react';
import { 
  TrendingUp, TrendingDown, Wallet, Target, 
  Calendar, Filter, FileText, ChevronRight, AlertCircle, Sparkles, X
} from 'lucide-react';

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Filler
} from 'chart.js';
import { Pie, Line, Bar } from 'react-chartjs-2';
import api from '../services/api';
import { formatCurrency } from '../utils/formatCurrency';
import AIAdviceWidget from '../components/AIAdviceWidget';
import ComparisonChart from '../components/ComparisonChart';

import { exportExpenseReport } from '../utils/exportPDF';

ChartJS.register(
  ArcElement, Tooltip, Legend, CategoryScale, 
  LinearScale, PointElement, LineElement, BarElement, Title, Filler
);

function Dashboard({ user }) {
  const [data, setData] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({ category: '', from: '', to: '', amount: '' });
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [showBudgetAlert, setShowBudgetAlert] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [filters, page]);







  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/dashboard');
      setData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchExpenses = async () => {
    try {
       // Note: the backend returns { data: [], ... } due to pagination
      const queryParams = { ...filters, page, limit: 10 };
      const query = new URLSearchParams(queryParams).toString();
      const res = await api.get(`/expenses?${query}`);
      setExpenses(res.data.data || []);
      setTotalPages(res.data.pages || 1);
    } catch (err) {
      console.error(err);
    }
  };


  const fetchCategories = async () => {
    try {
      const res = await api.get('/expenses/categories');
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const applyFilters = (e) => {
    e.preventDefault();
    fetchExpenses();
  };

  if (!data) return <div className="loading">Loading Dashboard...</div>;
  if (!data.charts) return <div className="loading">Loading...</div>;

  const filteredExpenses = expenses;

  const pieData = {
    labels: data.charts.categoryData?.map(c => c.category) || [],
    datasets: [{
      data: data.charts.categoryData?.map(c => c.total) || [],
      backgroundColor: ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#f43f5e', '#14b8a6'],
      borderWidth: 0,
    }]
  };

  const incomePieData = {
    labels: data.charts.incomeCategoryData?.map(c => c.category) || [],
    datasets: [{
      data: data.charts.incomeCategoryData?.map(c => c.total) || [],
      backgroundColor: ['#10b981', '#6366f1', '#f59e0b', '#14b8a6', '#ec4899', '#94a3b8'],
      borderWidth: 0,
    }]
  };


  const lineData = {
    labels: data.charts.monthlyTrend?.map(m => m.month) || [],
    datasets: [{
      label: 'Monthly Expenses',
      data: data.charts.monthlyTrend?.map(m => m.total) || [],
      fill: true,
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99, 102, 241, 0.1)',
      tension: 0.4,
    }]
  };

  // Prepare comparison bar chart data


  return (

    <div className="dashboard fade-in">
      {(data.budget.budgetPercent >= 80 && showBudgetAlert) && (
        <div className="budget-banner danger slide-down mb-4 d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-2">
                <AlertCircle size={20} />
                <span>You have reached <b>{Math.round(data.budget.budgetPercent)}%</b> of your monthly budget limit!</span>
            </div>
            <button className="banner-close" onClick={() => setShowBudgetAlert(false)}><X size={18} /></button>
        </div>
      )}
      <header className="dashboard-header">

        <div className="title-area">
          <h1>Financial Dashboard</h1>
          <p className="subtitle">Welcome back! Manage your spending efficiently.</p>
        </div>
        <div className="header-actions">
           <button 
             onClick={() => exportExpenseReport(expenses, data.totals, user.name, new Date().toLocaleString('default', { month: 'long', year: 'numeric' }))} 
             className="secondary-btn"
           >
             <FileText size={18} />
             <span>Export PDF</span>
           </button>
        </div>
      </header>


      {/* Summary Cards */}
      <div className="stats-grid">
        <div className="stat-card glass secondary">
          <div className="stat-icon"><TrendingUp size={24} /></div>
          <div className="stat-info">
            <span className="stat-label">This Month's Income</span>
            <span className="stat-value">{formatCurrency(data.totals.monthlyIncome)}</span>
          </div>
        </div>
        <div className="stat-card glass danger">
          <div className="stat-icon"><TrendingDown size={24} /></div>
          <div className="stat-info">
            <span className="stat-label">Total Expenses</span>
            <span className="stat-value">{formatCurrency(data.totals.totalExpense)}</span>
          </div>
        </div>
        <div className="stat-card glass primary">
          <div className="stat-icon"><span style={{ fontSize: '1.2rem', fontWeight: '800' }}>₹</span></div>
          <div className="stat-info">
            <span className="stat-label">Monthly Balance</span>
            <span className="stat-value">{formatCurrency(data.totals.balance)}</span>
          </div>
        </div>
        <div className="stat-card glass accent">
          <div className="stat-icon"><Target size={24} /></div>
          <div className="stat-info">
            <span className="stat-label">Budget Progress</span>
            <span className="stat-value">{Math.round(data.budget.budgetPercent)}%</span>
            <div className="progress-bar">
               <div className="progress-fill" style={{ width: `${Math.min(data.budget.budgetPercent, 100)}%` }}></div>
            </div>
          </div>
        </div>
      </div>


      <div className="middle-section">
        <div className="charts-area">
          <div className="card chart-card">
            <h3>Expense Distribution</h3>
            <div className="pie-container">
              <Pie data={pieData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>
          <div className="card chart-card">
            <h3>Income Distribution</h3>
            <div className="pie-container">
              <Pie data={incomePieData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>
          <div className="card chart-card">

            <h3>Monthly Spending Trend</h3>
            <div className="line-container">
              <Line data={lineData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>
        </div>

        <ComparisonChart />


        <AIAdviceWidget />


        {data.budget.categoryBudgets?.length > 0 && (
          <div className="card category-budgets-card mt-3">
            <h3>Category Budgets</h3>
            <div className="cat-budgets-list mt-3">
              {data.budget.categoryBudgets.map(({ category, budget, spent }) => (
                <div key={category} className="cat-budget-row mb-3">
                  <div className="cat-budget-info d-flex justify-content-between mb-1">
                    <span className="cat-name font-semibold text-sm">{category}</span>
                    <span className="cat-amount text-xs text-muted">{formatCurrency(spent)} / {formatCurrency(budget)}</span>
                  </div>
                  <div className="mini-progress-bar bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="mini-progress-fill h-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min((spent/budget)*100, 100)}%`,
                        backgroundColor: spent > budget ? '#ef4444' : '#6366f1'
                      }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>


      {/* Filters and Transactions */}
      <div className="transactions-section">
        <div className="transactions-header">
          <h3>Recent Transactions</h3>
          <form className="filter-bar" onSubmit={applyFilters}>
            <select name="category" value={filters.category} onChange={handleFilterChange}>
              <option value="">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input type="date" name="from" value={filters.from} onChange={handleFilterChange} />
            <input type="date" name="to" value={filters.to} onChange={handleFilterChange} />
            <button type="submit" className="filter-btn">
               <Filter size={16} />
               <span>Filter</span>
            </button>
          </form>
        </div>

        <div className="card transactions-card">
          <div className="swipe-hint">Swipe left/right to view more columns</div>
          <table className="transactions-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map(expense => (
                <tr key={expense.id}>
                  <td>{new Date(expense.date).toLocaleDateString()}</td>
                  <td><span className="category-tag">{expense.category}</span></td>
                  <td>
                    <span className="amount-text">{formatCurrency(expense.amount)}</span>
                    {expense.is_anomaly && (
                      <span
                        className='anomaly-badge'
                        title={`Unusual: ${(expense.amount / expense.avg_for_category).toFixed(1)}x your average ${expense.category} spend`}
                      >
                        Unusual
                      </span>
                    )}
                  </td>
                  <td><span className="desc-text">{expense.description || '-'}</span></td>
                  <td>
                    <button className="icon-btn"><ChevronRight size={16} /></button>
                  </td>
                </tr>
              ))}
              {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>No transactions found</td>
                </tr>
              )}
            </tbody>
          </table>
          <Pagination page={page} totalPages={totalPages} setPage={setPage} />
        </div>

      </div>
    </div>
  );
}

const Pagination = ({ page, totalPages, setPage }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="pagination glass">
      <button 
        disabled={page === 1} 
        onClick={() => setPage(p => p - 1)}
        className="pagination-btn"
      >
        Prev
      </button>
      <span className="pagination-info">Page {page} of {totalPages}</span>
      <button 
        disabled={page === totalPages} 
        onClick={() => setPage(p => p + 1)}
        className="pagination-btn"
      >
        Next
      </button>
    </div>
  );
};

export default Dashboard;



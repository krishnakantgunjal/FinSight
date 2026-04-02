import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ArrowLeft, Save, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const CATEGORIES = ['Food', 'Transport', 'Entertainment', 'Rent', 'Utilities', 'Shopping', 'Health'];

function SetBudget() {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [totalAmount, setTotalAmount] = useState('');
  const [categoryBudgets, setCategoryBudgets] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchExistingBudgets();
  }, [month, year]);

  const fetchExistingBudgets = async () => {
    try {
      const res = await api.get(`/budgets?month=${month}&year=${year}`);
      setTotalAmount(res.data.total?.amount || '');
      const catBudgets = {};
      res.data.byCategory?.forEach(b => {
        catBudgets[b.category] = b.amount;
      });
      setCategoryBudgets(catBudgets);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCategoryChange = (cat, val) => {
    setCategoryBudgets(prev => ({ ...prev, [cat]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Set main budget
      await api.post('/budgets', { amount: totalAmount || 0, month, year, category: null });
      
      // Set category budgets
      const promises = Object.entries(categoryBudgets).map(([category, amount]) => {
        if (amount) {
            return api.post('/budgets', { amount, month, year, category });
        }
        return null;
      }).filter(p => p !== null);

      await Promise.all(promises);
      
      toast.success('Budget plan updated!');
      setTimeout(() => navigate('/'), 1000);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update budget plan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <button onClick={() => navigate(-1)} className="icon-btn-back">
          <ArrowLeft size={20} />
        </button>
        <h1>Budget Planning</h1>
      </div>

      <div className="card form-card glass">
        <form onSubmit={handleSubmit} className="standard-form">
          <div className="form-grid border-bottom pb-4 mb-4">
             <div className="form-group">
              <label>Month</label>
              <select value={month} onChange={(e) => setMonth(e.target.value)} required>
                {[...Array(12)].map((_, i) => (
                  <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Year</label>
              <input type="number" value={year} onChange={(e) => setYear(e.target.value)} required />
            </div>
          </div>

          <div className="budget-section">
            <h3>Overall Monthly Limit</h3>
            <div className="form-group mt-2">
              <div className="input-with-icon">
                <span className="currency-symbol">₹</span>
                <input 
                  type="number" 
                  placeholder="Total amount" 
                  value={totalAmount} 
                  onChange={(e) => setTotalAmount(e.target.value)} 
                />
              </div>
            </div>
          </div>

          <div className="budget-section mt-4">
            <h3>Category-Specific Limits</h3>
            <p className="text-muted small mb-3">Optional: Set limits for individual categories to track them separately.</p>
            <div className="category-budgets-list">
              {CATEGORIES.map(cat => (
                <div key={cat} className="category-budget-row">
                  <label>{cat}</label>
                  <div className="input-with-icon">
                    <span className="currency-symbol">₹</span>
                    <input 
                      type="number" 
                      placeholder="No limit" 
                      value={categoryBudgets[cat] || ''} 
                      onChange={(e) => handleCategoryChange(cat, e.target.value)} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="form-actions mt-4">
            <button type="submit" disabled={isSubmitting} className="submit-btn budget-accent">
              {isSubmitting ? 'Saving...' : 'Save Budget Plan'}
              {!isSubmitting && <Save size={18} />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SetBudget;

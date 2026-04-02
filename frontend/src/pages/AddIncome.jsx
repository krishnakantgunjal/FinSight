import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Calendar, FileText, ArrowLeft, Save, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { formatCurrency } from '../utils/formatCurrency';

function AddIncome() {
  const [formData, setFormData] = useState({
    amount: '',
    category: 'salary',
    date: new Date().toISOString().split('T')[0]
  });

  const [incomes, setIncomes] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchIncomes();
  }, []);

  const fetchIncomes = async () => {
    try {
      const res = await api.get('/income?limit=50');
      setIncomes(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const startEdit = (inc) => {
    setEditingId(inc.id);
    setFormData({
      amount: inc.amount,
      category: inc.category,
      date: new Date(inc.date).toISOString().split('T')[0]
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this income?')) return;
    try {
      await api.delete(`/income/${id}`);
      toast.success('Income deleted');
      fetchIncomes();
    } catch (err) {
      toast.error('Failed to delete income');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Amount must be greater than zero');
      setIsSubmitting(false);
      return;
    }
    if (new Date(formData.date) > new Date()) {
      toast.error('Date cannot be in the future');
      setIsSubmitting(false);
      return;
    }

    try {
      if (editingId) {
        await api.put(`/income/${editingId}`, formData);
        toast.success('Income updated successfully!');
      } else {
        await api.post('/income', formData);
        toast.success('Income added successfully!');
      }
      setFormData({
        amount: '',
        category: 'salary',
        date: new Date().toISOString().split('T')[0]
      });
      setEditingId(null);
      fetchIncomes();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to save income');
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
        <h1>{editingId ? 'Edit Income' : 'Add New Income'}</h1>
      </div>

      <div className="card form-card glass">
        <form onSubmit={handleSubmit} className="standard-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Income Category</label>
              <div className="input-with-icon">
                <Briefcase size={18} />
                <select 
                  name="category" 
                  value={formData.category} 
                  onChange={handleChange} 
                  required
                >
                  <option value="">Select Category</option>
                  <option value="salary">Salary</option>
                  <option value="freelance">Freelance</option>
                  <option value="business">Business</option>
                  <option value="investment">Investment</option>
                  <option value="gift">Gift</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>


            <div className="form-group">
              <label>Amount (₹)</label>
              <div className="input-with-icon">
                <span className="currency-symbol">₹</span>
                <input 
                  type="number" 
                  name="amount" 
                  placeholder="0.00" 
                  value={formData.amount} 
                  onChange={handleChange} 
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label>Date</label>
              <div className="input-with-icon">
                <Calendar size={18} />
                <input 
                  type="date" 
                  name="date" 
                  value={formData.date} 
                  onChange={handleChange} 
                  required 
                />
              </div>
            </div>
          </div>

          <div className="form-actions d-flex gap-2">
            <button type="submit" disabled={isSubmitting} className="submit-btn income-success flex-grow-1">
              {isSubmitting ? 'Saving...' : (editingId ? 'Update Income' : 'Save Income')}
              {!isSubmitting && <Save size={18} />}
            </button>
            {editingId && (
              <button 
                type="button" 
                className="secondary-btn" 
                onClick={() => {
                  setEditingId(null);
                  setFormData({ amount: '', category: 'salary', date: new Date().toISOString().split('T')[0] });
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {incomes.length > 0 && (
        <div className="card transactions-card mt-4 glass">
          <h3 className="mb-3">Recent Incomes</h3>
          <table className="transactions-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {incomes.map(inc => (
                <tr key={inc.id}>
                  <td>{new Date(inc.date).toLocaleDateString()}</td>
                  <td><span className="category-tag">{inc.category}</span></td>
                  <td><span className="amount-text income">{formatCurrency(inc.amount)}</span></td>
                  <td>
                    <div className="d-flex gap-2">
                      <button className="icon-btn" onClick={() => startEdit(inc)}><Edit2 size={16} /></button>
                      <button className="icon-btn" onClick={() => handleDelete(inc.id)}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AddIncome;

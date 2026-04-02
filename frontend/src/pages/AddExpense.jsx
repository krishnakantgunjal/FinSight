import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Calendar, FileText, ArrowLeft, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

function AddExpense() {
  const [formData, setFormData] = useState({
    category: '',
    customCategory: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    isRecurring: false,
    recurFrequency: 'monthly'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
    if (formData.category === 'Other' && !formData.customCategory.trim()) {
      toast.error('Please enter a category name');
      setIsSubmitting(false);
      return;
    }

    try {
      await api.post('/expenses', formData);
      toast.success('Expense added successfully!');
      setTimeout(() => navigate('/'), 1000);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to add expense');
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
        <h1>Add New Expense</h1>
      </div>

      <div className="card form-card glass">
        <form onSubmit={handleSubmit} className="standard-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Category</label>
              <div className="input-with-icon">
                <ShoppingBag size={18} />
                <select 
                  name="category" 
                  value={formData.category} 
                  onChange={handleChange} 
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Food">Food</option>
                  <option value="Transport">Transport</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Rent">Rent</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Health">Health</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {formData.category === 'Other' && (
              <div className="form-group slide-down">
                <label>Custom Category Name</label>
                <div className="input-with-icon">
                  <FileText size={18} />
                  <input 
                    type="text" 
                    name="customCategory" 
                    placeholder="Enter custom category" 
                    value={formData.customCategory} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
              </div>
            )}

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

            <div className="form-group full-width">
              <label>Description (Optional)</label>
              <div className="input-with-icon">
                <FileText size={18} />
                <input 
                  type="text" 
                  name="description" 
                  placeholder="What was this for?" 
                  value={formData.description} 
                  onChange={handleChange} 
                />
              </div>
            </div>

            <div className="form-group full-width border-top pt-4">
              <div className="d-flex align-items-center gap-2">
                <input 
                  type="checkbox" 
                  name="isRecurring" 
                  checked={formData.isRecurring} 
                  onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                  style={{ width: 'auto' }}
                />
                <label className="mb-0">Make this a recurring expense</label>
              </div>
            </div>

            {formData.isRecurring && (
              <div className="form-grid full-width slide-down mt-2">
                <div className="form-group">
                  <label>Frequency</label>
                  <select 
                    name="recurFrequency" 
                    value={formData.recurFrequency} 
                    onChange={handleChange} 
                    required
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Start From</label>
                  <input type="date" value={formData.date} disabled />
                  <small className="text-muted">Next expense will be logged based on frequency.</small>
                </div>
              </div>
            )}
          </div>


          <div className="form-actions">
            <button type="submit" disabled={isSubmitting} className="submit-btn">
              {isSubmitting ? 'Saving...' : 'Save Expense'}
              {!isSubmitting && <Save size={18} />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

}

export default AddExpense;

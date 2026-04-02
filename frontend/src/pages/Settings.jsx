import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Globe, AlertTriangle, Save, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

function Settings({ user, setUser }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    currency: user.currency || 'INR',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteAccount = async () => {
    if (!deletePassword) return toast.error('Enter your password to confirm');
    try {
      await api.delete('/auth/account', { data: { password: deletePassword } });
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      window.location.href = '/login';
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete account');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
        throw new Error('New passwords do not match');
      }

      const res = await api.put('/auth/profile', {
        name: formData.name,
        email: formData.email,
        currency: formData.currency,
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });

      const updatedUser = { ...user, ...res.data.user };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      toast.success('Profile updated successfully!');
      
      // Clear password fields
      setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message || 'Update failed');
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
        <h1>Account Settings</h1>
      </div>

      <div className="settings-grid">
        <div className="card glass settings-card">
          <div className="settings-section">
            <div className="section-header">
              <User size={20} className="text-primary" />
              <h2>Personal Information</h2>
            </div>
            <form onSubmit={handleProfileUpdate} className="standard-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Preferred Currency</label>
                  <select name="currency" value={formData.currency} onChange={handleChange}>
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>

              <div className="section-divider my-4" />

              <div className="section-header">
                <Lock size={20} className="text-primary" />
                <h2>Security</h2>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Current Password</label>
                  <input 
                    type="password" 
                    name="currentPassword" 
                    value={formData.currentPassword} 
                    onChange={handleChange} 
                    placeholder="Enter current password to change sensitive info" 
                  />
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <input 
                    type="password" 
                    name="newPassword" 
                    value={formData.newPassword} 
                    onChange={handleChange} 
                    placeholder="Leave blank to keep current" 
                  />
                </div>
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input 
                    type="password" 
                    name="confirmPassword" 
                    value={formData.confirmPassword} 
                    onChange={handleChange} 
                  />
                </div>
              </div>

              <div className="form-actions mt-4">
                <button type="submit" disabled={isSubmitting} className="submit-btn">
                  {isSubmitting ? 'Saving...' : 'Save Settings'}
                  {!isSubmitting && <Save size={18} />}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="card glass danger-zone mt-4">
          <div className="section-header">
            <AlertTriangle size={20} className="text-danger" />
            <h2 className="text-danger">Danger Zone</h2>
          </div>
          <p className="text-muted text-sm mb-3">Deleting your account is permanent and cannot be undone. All your data will be wiped.</p>
          {showDeleteConfirm ? (
            <div className='form-group mt-3'>
              <label>Enter your password to confirm deletion</label>
              <input type='password' value={deletePassword} onChange={e => setDeletePassword(e.target.value)} placeholder='Password' />
              <div className='d-flex gap-2 mt-2'>
                <button onClick={handleDeleteAccount} className='submit-btn' style={{ background: '#ef4444', border: 'none' }}>Confirm Delete</button>
                <button onClick={() => setShowDeleteConfirm(false)} className='secondary-btn' style={{ padding: '0.6rem 1.2rem', borderRadius: '12px' }}>Cancel</button>
              </div>
            </div>
          ) : (
            <button className='logout-btn border-danger' onClick={() => setShowDeleteConfirm(true)}>Delete My Account</button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Settings;

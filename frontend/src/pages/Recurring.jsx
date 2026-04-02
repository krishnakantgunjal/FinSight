import React, { useState, useEffect } from 'react';
import { Repeat, Trash2, Plus } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const CATEGORIES = ['Food','Transport','Entertainment','Rent','Utilities','Shopping','Health'];

export default function Recurring() {
  const [templates, setTemplates] = useState([]);
  const [form, setForm] = useState({ category:'Food', amount:'', description:'', recur_frequency:'monthly', recur_day:1 });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { api.get('/recurring').then(r => setTemplates(r.data)); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    await api.post('/recurring', form);
    toast.success('Recurring expense created!');
    const res = await api.get('/recurring');
    setTemplates(res.data);
    setShowForm(false);
  };

  const handleDelete = async (id) => {
    await api.delete(`/recurring/${id}`);
    setTemplates(t => t.filter(x => x.id !== id));
    toast.success('Deleted');
  };

  return (
    <div className='page-container fade-in'>
      <div className='page-header'>
        <Repeat size={24} /> <h1>Recurring Expenses</h1>
        <button onClick={() => setShowForm(!showForm)} className='submit-btn'>
          <Plus size={16} /> Add Recurring
        </button>
      </div>
      {showForm && (
        <div className='card glass'>
          <form onSubmit={handleAdd} className='standard-form'>
            <div className='form-grid'>
              <div className='form-group'><label>Category</label>
                <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className='form-group'><label>Amount (Rs.)</label>
                <input type='number' value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required />
              </div>
              <div className='form-group'><label>Frequency</label>
                <select value={form.recur_frequency} onChange={e => setForm({...form, recur_frequency: e.target.value})}>
                  <option value='daily'>Daily</option>
                  <option value='weekly'>Weekly</option>
                  <option value='monthly'>Monthly</option>
                </select>
              </div>
              <div className='form-group'><label>Day of Month/Week</label>
                <input type='number' min='1' max='31' value={form.recur_day} onChange={e => setForm({...form, recur_day: e.target.value})} />
              </div>
              <div className='form-group full-width'><label>Description</label>
                <input type='text' value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              </div>
            </div>
            <div className='form-actions'><button type='submit' className='submit-btn'>Save Template</button></div>
          </form>
        </div>
      )}
      <div className='card'><table className='transactions-table'>
        <thead><tr><th>Category</th><th>Amount</th><th>Frequency</th><th>Next Due</th><th>Action</th></tr></thead>
        <tbody>
          {templates.map(t => (
            <tr key={t.id}>
              <td><span className='category-tag'>{t.category}</span></td>
              <td>Rs.{t.amount}</td>
              <td>{t.recur_frequency}</td>
              <td>{new Date(t.next_due).toLocaleDateString()}</td>
              <td><button onClick={() => handleDelete(t.id)} className='icon-btn'><Trash2 size={16}/></button></td>
            </tr>
          ))}
        </tbody>
      </table></div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Target, Plus, Trash2 } from 'lucide-react';
import api from '../services/api';
import GoalCard from '../components/GoalCard';
import toast from 'react-hot-toast';

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [form, setForm] = useState({ name: '', target_amount: '', target_date: '' });
  const [contribution, setContribution] = useState({});
  const [showForm, setShowForm] = useState(false);

  const fetchGoals = () => api.get('/goals').then(r => setGoals(r.data));
  useEffect(() => { fetchGoals(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post('/goals', form);
      toast.success('Goal created!');
      setShowForm(false); 
      fetchGoals();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create goal');
    }
  };

  const handleContribute = async (id) => {
    const amount = contribution[id];
    if (!amount || amount <= 0) return toast.error('Enter a valid amount');
    try {
      await api.put(`/goals/${id}/amount`, { amount });
      toast.success('Contribution added!');
      setContribution(prev => ({ ...prev, [id]: '' }));
      fetchGoals();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add contribution');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/goals/${id}`);
      setGoals(g => g.filter(x => x.id !== id));
      toast.success('Goal deleted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete goal');
    }
  };

  return (
    <div className='page-container fade-in'>
      <div className='page-header'>
        <Target size={24}/> <h1>Savings Goals</h1>
        <button onClick={() => setShowForm(!showForm)} className='submit-btn'><Plus size={16}/> New Goal</button>
      </div>
      {showForm && (<div className='card glass'><form onSubmit={handleAdd} className='standard-form'>
        <div className='form-grid'>
          <div className='form-group'><label>Goal Name</label>
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
          <div className='form-group'><label>Target Amount (Rs.)</label>
            <input type='number' value={form.target_amount} onChange={e => setForm({...form, target_amount: e.target.value})} required /></div>
          <div className='form-group'><label>Target Date</label>
            <input type='date' value={form.target_date} onChange={e => setForm({...form, target_date: e.target.value})} required /></div>
        </div>
        <div className='form-actions'><button type='submit' className='submit-btn'>Create Goal</button></div>
      </form></div>)}
      <div className='goals-grid' style={{ display:'grid', gap:'1rem', gridTemplateColumns:'repeat(auto-fill, minmax(320px,1fr))' }}>
        {goals.map(g => (
          <div key={g.id} className='goal-wrapper'>
            <GoalCard goal={g} />
            <div className='d-flex gap-2 mt-2'>
              <input type='number' placeholder='Add Rs.' value={contribution[g.id] || ''}
                onChange={e => setContribution(prev => ({...prev, [g.id]: e.target.value}))} style={{flex:1}}/>
              <button onClick={() => handleContribute(g.id)} className='submit-btn' style={{width:'auto'}}>Add</button>
              <button onClick={() => handleDelete(g.id)} className='icon-btn'><Trash2 size={16}/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

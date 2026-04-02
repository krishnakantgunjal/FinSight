import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import api from '../services/api';

export default function AIAdviceWidget() {
  const [advice, setAdvice] = useState('');
  const [loading, setLoading] = useState(false);
  const [cached, setCached] = useState(false);

  const fetchAdvice = async () => {
    setLoading(true);
    try {
      const res = await api.get('/dashboard/ai-advice');
      setAdvice(res.data.advice);
      setCached(res.data.cached);
    } catch (err) {
      setAdvice('Could not load advice. Check your OpenAI API key.');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchAdvice(); }, []);

  // Format numbered tips into list items
  const tips = advice.split(/\n/).filter(l => l.trim().match(/^[123]\./));

  return (
    <div className='ai-card'>
      <div className='ai-header'>
        <div className='flex items-center gap-2'>
          <Sparkles className="text-blue-500" size={18} />
          <h3>Your Spending Coach</h3>
        </div>
        <div className='flex items-center gap-2'>
          <span className={`ai-badge ${cached ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-600'}`}>
            {cached ? 'Today' : 'Fresh'}
          </span>
          <button onClick={fetchAdvice} disabled={loading} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <RefreshCw className={`${loading ? 'animate-spin' : ''}`} size={14}/>
          </button>
        </div>
      </div>
      {loading ? (
        <div className="p-4 space-y-2">
          <div className="h-4 bg-gray-100 animate-pulse rounded w-3/4"></div>
          <div className="h-4 bg-gray-100 animate-pulse rounded w-5/6"></div>
          <div className="h-4 bg-gray-100 animate-pulse rounded w-2/3"></div>
        </div>
      ) : (
        <ul className='ai-tips'>
          {tips.length > 0 ? tips.map((t,i) => <li key={i}>{t}</li>)
            : <li>{advice}</li>}
        </ul>
      )}
    </div>
  );
}

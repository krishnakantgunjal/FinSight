import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import api from '../services/api';

export default function AIAdviceWidget() {
  const [advice, setAdvice] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchAdvice = async () => {
    setLoading(true);
    try {
      const res = await api.get('/dashboard/ai-advice');
      setAdvice(typeof res.data.advice === 'string' ? res.data.advice : '');
    } catch (err) {
      setAdvice('Could not load financial advice right now. Please try again.');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchAdvice(); }, []);

  return (
    <div className='ai-card'>
      <div className='ai-header'>
        <div className='flex items-center gap-2'>
          <Sparkles className="text-blue-500" size={18} />
          <h3>Smart Financial Advice</h3>
        </div>
        <div className='flex items-center gap-2'>
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
        <p className='ai-advice-text'>{advice || 'No financial advice available.'}</p>
      )}
    </div>
  );
}

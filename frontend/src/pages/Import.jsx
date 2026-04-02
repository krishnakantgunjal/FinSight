import React, { useState } from 'react';
import { Upload, CheckCircle, Trash2, FileText } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const CATEGORIES = ['Food','Transport','Entertainment','Rent','Utilities','Shopping','Health','Other'];

export default function Import() {
  const [preview, setPreview] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imported, setImported] = useState(null);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    const form = new FormData();
    form.append('file', file);
    try {
      const res = await api.post('/expenses/import/preview', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setPreview(res.data.transactions.map(t => ({ ...t, skip: false })));
      toast.success(`Found ${res.data.count} debit transactions`);
    } catch (err) {
      toast.error('Could not parse file. Check format.');
    } finally { setLoading(false); }
  };

  const handleCategoryChange = (idx, val) => {
    setPreview(p => p.map((t,i) => i===idx ? {...t, category: val} : t));
  };

  const handleSkip = (idx) => {
    setPreview(p => p.map((t,i) => i===idx ? {...t, skip: !t.skip} : t));
  };

  const handleConfirm = async () => {
    const res = await api.post('/expenses/import/confirm', { transactions: preview });
    setImported(res.data.message);
    setPreview([]);
    toast.success(res.data.message);
  };

  return (
    <div className='page-container fade-in'>
      <div className='page-header'><FileText size={24}/> <h1>Import Bank Statement</h1></div>
      <div className='card glass'>
        <p className='text-muted mb-3'>Upload your bank statement CSV (HDFC, SBI, ICICI formats supported)</p>
        <input type='file' accept='.csv,.xlsx,.xls' onChange={handleUpload} style={{marginBottom:'1rem'}}/>
        {loading && <p>Parsing file...</p>}
      </div>
      {preview.length > 0 && (<>
        <div className='card'>
          <div className='transactions-header'>
            <h3>Review {preview.filter(t=>!t.skip).length} of {preview.length} transactions</h3>
            <button onClick={handleConfirm} className='submit-btn'><CheckCircle size={16}/> Import Selected</button>
          </div>
          <table className='transactions-table'>
            <thead><tr><th>Import</th><th>Date</th><th>Description</th><th>Amount</th><th>Category</th></tr></thead>
            <tbody>
              {preview.map((t,i) => (
                <tr key={i} style={{ opacity: t.skip ? 0.4 : 1 }}>
                  <td><input type='checkbox' checked={!t.skip} onChange={() => handleSkip(i)} style={{width:'auto'}}/></td>
                  <td>{t.date}</td>
                  <td><span className='desc-text'>{t.description}</span></td>
                  <td><span className='amount-text'>Rs.{t.amount}</span></td>
                  <td><select value={t.category} onChange={e => handleCategoryChange(i, e.target.value)}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>)}
      {imported && <div className='success-msg'>{imported}</div>}
    </div>
  );
}

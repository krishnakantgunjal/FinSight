import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import api from '../services/api';

export default function ComparisonChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/comparison')
      .then(r => {
        setData(r.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const chartData = {
    labels: data.map(d => d.category),
    datasets: [
      { 
        label: 'This Month', 
        data: data.map(d => d.this_month), 
        backgroundColor: '#6366f1',
        borderRadius: 6,
        barThickness: 20
      },
      { 
        label: 'Last Month', 
        data: data.map(d => d.last_month), 
        backgroundColor: '#cbd5e1',
        borderRadius: 6,
        barThickness: 20
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { usePointStyle: true, font: { size: 12, weight: '600' } } },
      tooltip: {
        backgroundColor: '#1e293b',
        padding: 12,
        titleFont: { size: 14 },
        bodyFont: { size: 13 },
        cornerRadius: 8
      }
    },
    scales: {
      y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
      x: { grid: { display: false } }
    }
  };

  if (loading) return <div className="card animate-pulse h-[400px] flex items-center justify-center text-gray-400">Loading comparison details...</div>;

  return (
    <div className='card flex flex-col gap-6'>
      <div className="flex justify-between items-center">
        <h3>Month-over-Month Comparison</h3>
        <div className="flex gap-4 text-xs font-semibold">
           <div className="flex items-center gap-1"><div className="w-3 h-3 bg-[#6366f1] rounded-full"></div> This Month</div>
           <div className="flex items-center gap-1"><div className="w-3 h-3 bg-[#cbd5e1] rounded-full"></div> Last Month</div>
        </div>
      </div>
      
      <div className="h-[300px]">
        <Bar data={chartData} options={options} />
      </div>

      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3'>
        {data.length > 0 ? data.map(d => (
          <div key={d.category} className='flex flex-col p-3 border border-gray-100 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors'>
            <span className="text-xs text-gray-500 font-medium truncate">{d.category}</span>
            <div className='flex items-center justify-between mt-1'>
              <span className="font-bold text-sm">₹{d.this_month.toLocaleString()}</span>
              <div className={`flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded ${d.delta > 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                {d.delta > 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                {Math.abs(d.delta_pct)}%
              </div>
            </div>
          </div>
        )) : <div className="col-span-full text-center py-4 text-gray-400">No category data available yet.</div>}
      </div>
    </div>
  );
}

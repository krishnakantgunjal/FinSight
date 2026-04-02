import React from 'react';

export default function GoalCard({ goal }) {
  const pct = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
  const r = 36; 
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  
  return (
    <div className='goal-card flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow'>
      <svg width='90' height='90' viewBox='0 0 90 90' className='flex-shrink-0'>
        <circle cx='45' cy='45' r={r} fill='none' stroke='#e2e8f0' strokeWidth='7'/>
        <circle cx='45' cy='45' r={r} fill='none' stroke='#6366f1' strokeWidth='7'
          strokeDasharray={`${dash} ${circ}`} strokeLinecap='round'
          transform='rotate(-90 45 45)'
          style={{ transition: 'stroke-dasharray 1s ease-out' }}
        />
        <text x='45' y='50' textAnchor='middle' fontSize='13' fontWeight='600' fill='#1e293b'>
          {Math.round(pct)}%
        </text>
      </svg>
      <div className='goal-info flex-1'>
        <h4 className='text-lg font-semibold text-gray-800 tracking-tight'>{goal.name}</h4>
        <p className='text-sm text-gray-500 font-medium mt-1'>
          <span className='text-gray-900'>Rs.{parseFloat(goal.current_amount).toLocaleString()}</span> / Rs.{parseFloat(goal.target_amount).toLocaleString()}
        </p>
        {goal.projected_completion && (
          <p className='projected text-sm text-indigo-600 bg-indigo-50 inline-block px-2 py-1 rounded mt-2 font-medium'>
            On track for {new Date(goal.projected_completion).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
          </p>
        )}
      </div>
    </div>
  );
}

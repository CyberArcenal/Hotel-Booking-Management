// src/renderer/components/Dashboard/RevenueChart.tsx
import React from 'react';

interface RevenueItem {
  period: string;
  revenue: number;
  bookings?: number;
  averageValue?: number;
  growth?: number;
}

interface Props {
  data: RevenueItem[] | null | undefined;
}

export const RevenueChart: React.FC<Props> = ({ data }) => {
  if (!data || data.length === 0) return null;

  const maxRevenue = Math.max(...data.map(d => d.revenue));

  return (
    <div className="mt-1 space-y-2">
      {data.map((item, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <span className="text-2xs w-16" style={{ color: 'var(--text-secondary)' }}>
            {item.period}
          </span>
          <div className="flex-1 h-7 flex items-center group relative">
            <div
              className="h-5 rounded-r-full transition-all duration-500 ease-out group-hover:h-6 group-hover:shadow-md"
              style={{
                width: `${(item.revenue / maxRevenue) * 100}%`,
                background: 'linear-gradient(90deg, var(--primary-color), #fbbf24)',
                boxShadow: '0 2px 6px rgba(212,175,55,0.3)',
              }}
            >
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-2xs font-medium text-black opacity-0 group-hover:opacity-100 transition-opacity">
                ${item.revenue.toLocaleString()}
              </span>
            </div>
          </div>
          <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
            ${item.revenue.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
};
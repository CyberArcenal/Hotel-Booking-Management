import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { type OccupancyItem } from '../../../../api/dashboard';

interface OccupancyTrendChartProps {
  data: OccupancyItem[];
  loading?: boolean;
}

const OccupancyTrendChart: React.FC<OccupancyTrendChartProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="h-[300px] bg-[var(--card-bg)] rounded-lg flex items-center justify-center">
        <div className="text-[var(--text-secondary)]">Loading chart...</div>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="h-[300px] bg-[var(--card-bg)] rounded-lg flex items-center justify-center">
        <div className="text-[var(--text-secondary)]">No occupancy data available</div>
      </div>
    );
  }

  // Format date for display
  const chartData = data.map((item) => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border-color)]/20 rounded-lg p-4">
      <h3 className="text-md font-medium text-[var(--text-primary)] mb-4 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary-color)]"></span>
        Daily Occupancy Trend (Last {data.length} days)
      </h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="occupancyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#d4af37" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)/20" />
            <XAxis 
              dataKey="date" 
              tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
              axisLine={{ stroke: 'var(--border-color)/30' }}
              tickLine={{ stroke: 'var(--border-color)/30' }}
            />
            <YAxis 
              tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
              axisLine={{ stroke: 'var(--border-color)/30' }}
              tickLine={{ stroke: 'var(--border-color)/30' }}
              unit="%"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--card-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '0.5rem',
                color: 'var(--text-primary)',
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="occupancyRate"
              name="Occupancy Rate"
              stroke="#d4af37"
              strokeWidth={2}
              fill="url(#occupancyGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default OccupancyTrendChart;
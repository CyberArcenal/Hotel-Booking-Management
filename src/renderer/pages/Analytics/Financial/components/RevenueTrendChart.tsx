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
import { type RevenueTrendItem } from '../../../../api/dashboard';

interface RevenueTrendChartProps {
  data: RevenueTrendItem[];
  period?: string;
  loading?: boolean;
}

const RevenueTrendChart: React.FC<RevenueTrendChartProps> = ({ data, period = 'month', loading }) => {
  if (loading) {
    return (
      <div className="h-[350px] bg-[var(--card-bg)] rounded-lg flex items-center justify-center">
        <div className="text-[var(--text-secondary)]">Loading chart...</div>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="h-[350px] bg-[var(--card-bg)] rounded-lg flex items-center justify-center">
        <div className="text-[var(--text-secondary)]">No revenue data available</div>
      </div>
    );
  }

  // Format period for display
  const chartData = data.map((item) => ({
    ...item,
    period: item.period,
    revenue: item.revenue,
    bookings: item.bookings,
    averageValue: item.averageValue,
    growth: item.growth,
  }));

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border-color)]/20 rounded-lg p-4">
      <h3 className="text-md font-medium text-[var(--text-primary)] mb-4 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary-color)]"></span>
        Revenue Trend ({period === 'month' ? 'Monthly' : period === 'week' ? 'Weekly' : 'Daily'})
      </h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#d4af37" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)/20" />
            <XAxis
              dataKey="period"
              tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
              axisLine={{ stroke: 'var(--border-color)/30' }}
              tickLine={{ stroke: 'var(--border-color)/30' }}
            />
            <YAxis
              yAxisId="left"
              tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
              axisLine={{ stroke: 'var(--border-color)/30' }}
              tickLine={{ stroke: 'var(--border-color)/30' }}
              tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}k`}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
              axisLine={{ stroke: 'var(--border-color)/30' }}
              tickLine={{ stroke: 'var(--border-color)/30' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--card-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '0.5rem',
                color: 'var(--text-primary)',
              }}
              formatter={(value: number, name: string) => {
                if (name === 'Revenue') return [`₱${value.toLocaleString()}`, name];
                if (name === 'Bookings') return [value, name];
                return [value, name];
              }}
            />
            <Legend />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="revenue"
              name="Revenue"
              stroke="#d4af37"
              strokeWidth={2}
              fill="url(#revenueGradient)"
            />
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="bookings"
              name="Bookings"
              stroke="#94a3b8"
              strokeWidth={2}
              fill="none"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueTrendChart;
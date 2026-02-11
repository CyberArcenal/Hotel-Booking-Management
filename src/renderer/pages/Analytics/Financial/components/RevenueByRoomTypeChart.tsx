import React, { useMemo } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { type FinancialSummary } from '../../../../api/dashboard';

interface RevenueByRoomTypeChartProps {
  financialSummary: FinancialSummary | null;
  loading?: boolean;
}

const COLORS = ['#d4af37', '#b8860b', '#9ca3af', '#6b7280', '#4b5563', '#374151'];

const RevenueByRoomTypeChart: React.FC<RevenueByRoomTypeChartProps> = ({ financialSummary, loading }) => {
  const chartData = useMemo(() => {
    if (!financialSummary?.revenueByRoomType) return [];
    return financialSummary.revenueByRoomType.map((item) => ({
      name: item.roomType,
      value: item.revenue,
      bookings: item.bookings,
      averageRate: item.averageRate,
    }));
  }, [financialSummary]);

  if (loading) {
    return (
      <div className="h-[350px] bg-[var(--card-bg)] rounded-lg flex items-center justify-center">
        <div className="text-[var(--text-secondary)]">Loading...</div>
      </div>
    );
  }

  if (!chartData.length) {
    return (
      <div className="h-[350px] bg-[var(--card-bg)] rounded-lg flex items-center justify-center">
        <div className="text-[var(--text-secondary)]">No revenue by room type data</div>
      </div>
    );
  }

  const formatCurrency = (value: number) => `₱${value.toLocaleString()}`;

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border-color)]/20 rounded-lg p-4 h-full">
      <h3 className="text-md font-medium text-[var(--text-primary)] mb-4 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary-color)]"></span>
        Revenue by Room Type
      </h3>
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--card-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '0.5rem',
                color: 'var(--text-primary)',
              }}
              formatter={(value: number, name: string, props: any) => {
                if (name === 'value') return [formatCurrency(value), 'Revenue'];
                return [value, name];
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 space-y-2">
        {chartData.map((item) => (
          <div key={item.name} className="flex justify-between items-center text-sm">
            <span className="text-[var(--text-secondary)]">{item.name}</span>
            <div className="flex items-center gap-4">
              <span className="text-[var(--text-primary)] font-medium">
                {formatCurrency(item.value)}
              </span>
              <span className="text-[var(--text-tertiary)] text-xs">
                ({item.bookings} bookings)
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RevenueByRoomTypeChart;
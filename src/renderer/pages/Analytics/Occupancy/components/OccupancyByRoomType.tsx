import React, { useMemo } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { RoomPerformanceItem } from '../../../../api/dashboard';

interface OccupancyByRoomTypeProps {
  roomPerformance: RoomPerformanceItem[];
  loading?: boolean;
}

const COLORS = ['#d4af37', '#b8860b', '#9ca3af', '#6b7280', '#4b5563'];

const OccupancyByRoomType: React.FC<OccupancyByRoomTypeProps> = ({ roomPerformance, loading }) => {
  const chartData = useMemo(() => {
    const typeMap = new Map<string, { count: number; revenue: number; bookings: number }>();

    roomPerformance.forEach((room) => {
      const existing = typeMap.get(room.type) || { count: 0, revenue: 0, bookings: 0 };
      typeMap.set(room.type, {
        count: existing.count + 1,
        revenue: existing.revenue + room.totalRevenue,
        bookings: existing.bookings + room.totalBookings,
      });
    });

    return Array.from(typeMap.entries()).map(([type, stats]) => ({
      name: type,
      value: stats.count,
      revenue: stats.revenue,
      bookings: stats.bookings,
    }));
  }, [roomPerformance]);

  if (loading) {
    return (
      <div className="h-[300px] bg-[var(--card-bg)] rounded-lg flex items-center justify-center">
        <div className="text-[var(--text-secondary)]">Loading...</div>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="h-[300px] bg-[var(--card-bg)] rounded-lg flex items-center justify-center">
        <div className="text-[var(--text-secondary)]">No room type data</div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border-color)]/20 rounded-lg p-4">
      <h3 className="text-md font-medium text-[var(--text-primary)] mb-4 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary-color)]"></span>
        Rooms by Type
      </h3>
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
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
              formatter={(value: number, name: string) => [
                `${value} room${value !== 1 ? 's' : ''}`,
                name,
              ]}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {chartData.map((type) => (
          <div key={type.name} className="flex justify-between text-sm">
            <span className="text-[var(--text-secondary)]">{type.name}:</span>
            <span className="text-[var(--text-primary)] font-medium">{type.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OccupancyByRoomType;
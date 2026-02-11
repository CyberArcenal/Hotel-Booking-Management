// src/renderer/components/Dashboard/RoomTypeChart.tsx
import React from 'react';

interface RoomTypeItem {
  type: string;
  count: number;
  percentage: number;
}

interface Props {
  data: RoomTypeItem[] | null | undefined;
}

export const RoomTypeChart: React.FC<Props> = ({ data }) => {
  if (!data || data.length === 0) return null;

  const maxCount = Math.max(...data.map(d => d.count));

  return (
    <div className="space-y-4">
      {data.map((item) => (
        <div key={item.type}>
          <div className="flex justify-between text-sm mb-1">
            <span style={{ color: 'var(--text-primary)' }} className="capitalize">
              {item.type}
            </span>
            <span style={{ color: 'var(--primary-color)' }} className="font-medium">
              {item.count} ({item.percentage}%)
            </span>
          </div>
          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${(item.count / maxCount) * 100}%`,
                background: 'linear-gradient(90deg, var(--primary-color), #f1c40f)',
                boxShadow: '0 0 8px var(--primary-color)',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};
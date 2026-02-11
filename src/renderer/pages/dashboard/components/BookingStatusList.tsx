// src/renderer/components/Dashboard/BookingStatusList.tsx
import React from 'react';

type StatusItem = { status: string; count: number };

interface Props {
  data: Record<string, number> | StatusItem[] | null | undefined;
}

export const BookingStatusList: React.FC<Props> = ({ data }) => {
  if (!data) return null;

  // Helper: convert to array of { status, count }
  const items: StatusItem[] = Array.isArray(data)
    ? data
    : Object.entries(data).map(([status, count]) => ({ status, count }));

  return (
    <div className="space-y-2">
      {items.map(({ status, count }) => (
        <div
          key={status}
          className="flex items-center justify-between px-3 py-2 rounded-lg"
          style={{ background: 'rgba(212,175,55,0.05)' }}
        >
          <span className="text-sm capitalize" style={{ color: 'var(--text-secondary)' }}>
            {status.replace(/_/g, ' ')}
          </span>
          <span className="text-sm font-bold" style={{ color: 'var(--primary-color)' }}>
            {count}
          </span>
        </div>
      ))}
    </div>
  );
};
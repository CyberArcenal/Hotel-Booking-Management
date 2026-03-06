// src/renderer/components/Dashboard/BookingStatusList.tsx
import React from 'react';

type StatusItem = { status: string; count: number };

interface Props {
  data: Record<string, number> | StatusItem[] | null | undefined;
}

export const BookingStatusList: React.FC<Props> = ({ data }) => {
  if (!data) return null;

  const items: StatusItem[] = Array.isArray(data)
    ? data
    : Object.entries(data).map(([status, count]) => ({ status, count }));

  return (
    <div className="space-y-1.5">
      {items.map(({ status, count }) => (
        <div
          key={status}
          className="flex items-center justify-between px-2 py-1.5 rounded-md"
          style={{ background: 'rgba(212,175,55,0.05)' }}
        >
          <span className="text-xs capitalize" style={{ color: 'var(--text-secondary)' }}>
            {status.replace(/_/g, ' ')}
          </span>
          <span className="text-xs font-bold" style={{ color: 'var(--primary-color)' }}>
            {count}
          </span>
        </div>
      ))}
    </div>
  );
};
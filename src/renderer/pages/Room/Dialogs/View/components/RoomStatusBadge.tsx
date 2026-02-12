// src/renderer/components/Room/badges/RoomStatusBadge.tsx

import React from 'react';

interface Props {
  isAvailable: boolean;
  className?: string;
}

export const RoomStatusBadge: React.FC<Props> = ({ isAvailable, className = '' }) => {
  const status = isAvailable ? 'Available' : 'Not Available';
  const bgColor = isAvailable
    ? 'rgba(74,222,128,0.2)'
    : 'rgba(255,76,76,0.2)';
  const color = isAvailable
    ? 'var(--status-available-room)'
    : 'var(--status-occupied)';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}
      style={{ backgroundColor: bgColor, color }}
    >
      {status}
    </span>
  );
};
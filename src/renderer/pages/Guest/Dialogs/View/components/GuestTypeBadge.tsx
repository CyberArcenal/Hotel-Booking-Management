// src/renderer/components/Guest/badges/GuestTypeBadge.tsx

import React from 'react';

interface Props {
  totalBookings: number;
  className?: string;
}

export const GuestTypeBadge: React.FC<Props> = ({ totalBookings, className = '' }) => {
  let label = 'New';
  let bgColor = 'rgba(156,163,175,0.2)'; // gray
  let color = 'var(--text-secondary)';

  if (totalBookings >= 5) {
    label = 'VIP';
    bgColor = 'rgba(212,175,55,0.2)'; // gold
    color = 'var(--primary-color)';
  } else if (totalBookings >= 2) {
    label = 'Returning';
    bgColor = 'rgba(74,222,128,0.2)'; // green
    color = 'var(--status-available)';
  } else if (totalBookings === 1) {
    label = 'First-time';
    bgColor = 'rgba(96,165,250,0.2)'; // blue
    color = 'var(--status-confirmed)';
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}
      style={{ backgroundColor: bgColor, color }}
    >
      {label}
    </span>
  );
};
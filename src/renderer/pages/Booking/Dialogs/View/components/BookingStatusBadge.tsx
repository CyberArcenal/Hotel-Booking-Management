// src/renderer/components/Booking/badges/BookingStatusBadge.tsx

import React from 'react';
import type { Booking } from '../../../../../api/booking';

interface Props {
  status: Booking['status'];
  className?: string;
}

const statusConfig: Record<
  Booking['status'],
  { label: string; colorVar: string; bgVar: string }
> = {
  confirmed: {
    label: 'Confirmed',
    colorVar: '--status-confirmed',
    bgVar: 'rgba(212,175,55,0.2)',
  },
  checked_in: {
    label: 'Checked In',
    colorVar: '--status-available',
    bgVar: 'rgba(74,222,128,0.2)',
  },
  checked_out: {
    label: 'Checked Out',
    colorVar: '--text-primary',
    bgVar: 'rgba(255,255,255,0.2)',
  },
  cancelled: {
    label: 'Cancelled',
    colorVar: '--status-cancelled',
    bgVar: 'rgba(255,76,76,0.2)',
  },
};

export const BookingStatusBadge: React.FC<Props> = ({ status, className = '' }) => {
  const config = statusConfig[status] || statusConfig.confirmed;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}
      style={{
        backgroundColor: config.bgVar,
        color: `var(${config.colorVar})`,
      }}
    >
      {config.label}
    </span>
  );
};
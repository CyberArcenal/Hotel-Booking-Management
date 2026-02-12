// src/renderer/components/Guest/View/sections/GuestStatsCard.tsx

import React from 'react';
import { Calendar, CreditCard, Repeat, Clock } from 'lucide-react';

interface Props {
  totalBookings: number;
  totalSpent: number;
  avgNights: number;
  lastVisit: string | null;
  firstVisit: string | null;
  loading?: boolean;
}

export const GuestStatsCard: React.FC<Props> = ({
  totalBookings,
  totalSpent,
  avgNights,
  lastVisit,
  firstVisit,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="p-4 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--card-secondary-bg)' }}>
        <div className="h-4 w-24 shimmer rounded mb-3" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-12 shimmer rounded" />
          <div className="h-12 shimmer rounded" />
          <div className="h-12 shimmer rounded" />
          <div className="h-12 shimmer rounded" />
        </div>
      </div>
    );
  }

  return (
    <div
      className="p-4 rounded-lg"
      style={{
        backgroundColor: 'var(--card-secondary-bg)',
        border: '1px solid var(--border-color)',
      }}
    >
      <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
        Guest Statistics
      </h4>
      <div className="grid grid-cols-2 gap-4">
        <StatItem
          icon={Calendar}
          label="Total bookings"
          value={totalBookings.toString()}
        />
        <StatItem
          icon={CreditCard}
          label="Total spent"
          value={`₱${totalSpent.toFixed(2)}`}
        />
        <StatItem
          icon={Repeat}
          label="Avg. nights"
          value={avgNights.toFixed(1)}
        />
        <StatItem
          icon={Clock}
          label="Last visit"
          value={lastVisit ? new Date(lastVisit).toLocaleDateString() : '—'}
        />
      </div>
      {firstVisit && (
        <p className="text-xs mt-3" style={{ color: 'var(--text-tertiary)' }}>
          Guest since {new Date(firstVisit).toLocaleDateString()}
        </p>
      )}
    </div>
  );
};

const StatItem: React.FC<{ icon: any; label: string; value: string }> = ({
  icon: Icon,
  label,
  value,
}) => (
  <div className="flex items-center gap-2">
    <Icon className="w-3.5 h-3.5" style={{ color: 'var(--text-tertiary)' }} />
    <div>
      <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
        {label}
      </p>
      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
        {value}
      </p>
    </div>
  </div>
);
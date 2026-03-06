// src/renderer/components/Dashboard/GuestLoyaltyCard.tsx
import React from 'react';
import { Repeat } from 'lucide-react';

interface Props {
  data: {
    repeatGuests: number;
    newGuestsThisMonth: number;
    repeatRate: number;
  } | null | undefined;
}

export const GuestLoyaltyCard: React.FC<Props> = ({ data }) => {
  if (!data) return null;

  const repeatRate = data.repeatRate || 0;

  return (
    <div
      className="compact-card p-4 rounded-lg"
      style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}
    >
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
        <Repeat className="w-4 h-4" style={{ color: 'var(--primary-color)' }} />
        Guest Loyalty
      </h3>
      <div className="flex items-center gap-4">
        {/* Progress ring - smaller */}
        <div className="relative w-20 h-20">
          <div
            className="w-full h-full rounded-full"
            style={{
              background: `conic-gradient(var(--primary-color) ${repeatRate * 3.6}deg, #2a2a2a 0deg)`,
              boxShadow: '0 0 12px rgba(212,175,55,0.2)',
            }}
          />
          <div className="absolute inset-1.5 rounded-full" style={{ background: 'var(--card-bg)' }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-base font-bold windows-title" style={{ color: 'var(--primary-color)' }}>
              {Math.round(repeatRate)}%
            </span>
          </div>
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex justify-between">
            <span className="text-2xs" style={{ color: 'var(--text-secondary)' }}>Repeat Guests</span>
            <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{data.repeatGuests}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-2xs" style={{ color: 'var(--text-secondary)' }}>New this month</span>
            <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{data.newGuestsThisMonth}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-2xs" style={{ color: 'var(--text-secondary)' }}>Repeat rate</span>
            <span className="text-xs font-semibold" style={{ color: 'var(--primary-color)' }}>{Math.round(repeatRate)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
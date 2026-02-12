// src/renderer/components/Booking/View/sections/StayDetailsCard.tsx

import React from 'react';
import { Calendar, Users } from 'lucide-react';

interface Props {
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  formattedCheckIn: string;
  formattedCheckOut: string;
}

export const StayDetailsCard: React.FC<Props> = ({
  checkIn,
  checkOut,
  nights,
  guests,
  formattedCheckIn,
  formattedCheckOut,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
        <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          Stay Details
        </h4>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            Check‑in
          </p>
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            {formattedCheckIn}
          </p>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            {checkIn}
          </p>
        </div>
        <div>
          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            Check‑out
          </p>
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            {formattedCheckOut}
          </p>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            {checkOut}
          </p>
        </div>
      </div>
      <div className="flex justify-between">
        <div className="flex items-center gap-1">
          <Users className="w-3.5 h-3.5" style={{ color: 'var(--text-tertiary)' }} />
          <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
            {guests} {guests === 1 ? 'guest' : 'guests'}
          </span>
        </div>
        <span className="text-sm" style={{ color: 'var(--primary-color)' }}>
          {nights} {nights === 1 ? 'night' : 'nights'}
        </span>
      </div>
    </div>
  );
};
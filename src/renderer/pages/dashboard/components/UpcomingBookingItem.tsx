// src/renderer/components/Dashboard/UpcomingBookingItem.tsx
import React from 'react';

interface Booking {
  guestName?: string;
  roomNumber?: string;
  arrivalDate?: string;
  status?: string;
}

interface Props {
  booking: Booking;
}

export const UpcomingBookingItem: React.FC<Props> = ({ booking }) => {
  const initials = booking.guestName
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'G';

  return (
    <div
      className="p-3 rounded-lg transition-all duration-200 hover:translate-x-1 hover:shadow-lg"
      style={{
        background: 'rgba(212,175,55,0.03)',
        border: '1px solid var(--border-color)',
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
          style={{
            background: 'linear-gradient(135deg, var(--primary-color), #b8860b)',
            color: 'black',
          }}
        >
          {initials}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              {booking.guestName || 'Guest'}
            </p>
            <span
              className="text-xs px-2 py-1 rounded-full"
              style={{
                background: 'rgba(212,175,55,0.15)',
                color: 'var(--status-confirmed)',
              }}
            >
              {booking.status || 'Confirmed'}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs">
            <span style={{ color: 'var(--text-secondary)' }}>Room {booking.roomNumber || '—'}</span>
            <span style={{ color: 'var(--text-tertiary)' }}>•</span>
            <span style={{ color: 'var(--primary-color)' }}>{booking.arrivalDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
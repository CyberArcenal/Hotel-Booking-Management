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
      className="p-2 rounded-md transition-all duration-200 hover:translate-x-1 hover:shadow-sm"
      style={{
        background: 'rgba(212,175,55,0.03)',
        border: '1px solid var(--border-color)',
      }}
    >
      <div className="flex items-start gap-2">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
          style={{
            background: 'linear-gradient(135deg, var(--primary-color), #b8860b)',
            color: 'black',
          }}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>
              {booking.guestName || 'Guest'}
            </p>
            <span
              className="text-2xs px-1.5 py-0.5 rounded-full whitespace-nowrap"
              style={{
                background: 'rgba(212,175,55,0.15)',
                color: 'var(--status-confirmed)',
              }}
            >
              {booking.status || 'Confirmed'}
            </span>
          </div>
          <div className="flex items-center gap-1 mt-0.5 text-2xs">
            <span style={{ color: 'var(--text-secondary)' }}>Room {booking.roomNumber || '—'}</span>
            <span style={{ color: 'var(--text-tertiary)' }}>•</span>
            <span style={{ color: 'var(--primary-color)' }}>{booking.arrivalDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
// src/renderer/components/Room/View/sections/RecentBookingsCard.tsx

import React from 'react';
import { Calendar, Users, Loader } from 'lucide-react';
import type { Booking } from '../../../../../api/booking';

interface Props {
  bookings: Booking[];
  loading: boolean;
  roomId: number;
}

export const RecentBookingsCard: React.FC<Props> = ({ bookings, loading, roomId }) => {
  if (loading) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
          <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Recent Bookings
          </h4>
        </div>
        <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-tertiary)' }}>
          <Loader className="w-3.5 h-3.5 animate-spin" />
          <span>Loading bookings...</span>
        </div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
          <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Recent Bookings
          </h4>
        </div>
        <p className="text-sm italic" style={{ color: 'var(--text-tertiary)' }}>
          No recent bookings for this room.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
        <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          Recent Bookings
        </h4>
      </div>
      <div className="space-y-2">
        {bookings.map((booking) => (
          <div
            key={booking.id}
            className="p-2 rounded text-sm"
            style={{
              backgroundColor: 'var(--card-secondary-bg)',
              border: '1px solid var(--border-color)',
            }}
          >
            <div className="flex justify-between items-center">
              <span style={{ color: 'var(--text-primary)' }}>
                {booking.guest.fullName}
              </span>
              <span
                className="text-xs px-1.5 py-0.5 rounded"
                style={{
                  backgroundColor:
                    booking.status === 'confirmed'
                      ? 'rgba(212,175,55,0.2)'
                      : booking.status === 'checked_in'
                      ? 'rgba(74,222,128,0.2)'
                      : 'rgba(255,76,76,0.2)',
                  color:
                    booking.status === 'confirmed'
                      ? 'var(--status-confirmed)'
                      : booking.status === 'checked_in'
                      ? 'var(--status-available)'
                      : 'var(--status-cancelled)',
                }}
              >
                {booking.status.replace('_', ' ')}
              </span>
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span style={{ color: 'var(--text-secondary)' }}>
                {new Date(booking.checkInDate).toLocaleDateString()} –{' '}
                {new Date(booking.checkOutDate).toLocaleDateString()}
              </span>
              <span style={{ color: 'var(--primary-color)' }}>
                ₱{booking.totalPrice.toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
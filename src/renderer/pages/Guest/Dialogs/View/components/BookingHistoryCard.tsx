// src/renderer/components/Guest/View/sections/BookingHistoryCard.tsx

import React from 'react';
import { Calendar, DoorOpen, CreditCard, Loader } from 'lucide-react';
import type { BookingSummary } from '../../../../../api/guest';

interface Props {
  bookings: BookingSummary[];
  loading: boolean;
  guestId: number;
}

export const BookingHistoryCard: React.FC<Props> = ({ bookings, loading, guestId }) => {
  if (loading) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
          <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Booking History
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
            Booking History
          </h4>
        </div>
        <p className="text-sm italic" style={{ color: 'var(--text-tertiary)' }}>
          No bookings found for this guest.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
          <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Booking History
          </h4>
        </div>
        <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
          {bookings.length} {bookings.length === 1 ? 'booking' : 'bookings'}
        </span>
      </div>
      <div className="space-y-2 max-h-60 overflow-y-auto pr-1" style={{
        scrollbarWidth: 'thin',
        scrollbarColor: 'var(--border-color) var(--card-bg)',
      }}>
        {bookings.map((booking) => (
          <div
            key={booking.id}
            className="p-3 rounded text-sm"
            style={{
              backgroundColor: 'var(--card-bg)',
              border: '1px solid var(--border-color)',
            }}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                    Booking #{booking.id}
                  </span>
                  <span
                    className="text-xs px-1.5 py-0.5 rounded"
                    style={{
                      backgroundColor:
                        booking.status === 'confirmed'
                          ? 'rgba(212,175,55,0.2)'
                          : booking.status === 'checked_in'
                          ? 'rgba(74,222,128,0.2)'
                          : booking.status === 'checked_out'
                          ? 'rgba(255,255,255,0.2)'
                          : 'rgba(255,76,76,0.2)',
                      color:
                        booking.status === 'confirmed'
                          ? 'var(--status-confirmed)'
                          : booking.status === 'checked_in'
                          ? 'var(--status-available)'
                          : booking.status === 'checked_out'
                          ? 'var(--text-primary)'
                          : 'var(--status-cancelled)',
                    }}
                  >
                    {booking.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span style={{ color: 'var(--text-primary)' }}>
                    {new Date(booking.checkInDate).toLocaleDateString()} –{' '}
                    {new Date(booking.checkOutDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <DoorOpen className="w-3 h-3" style={{ color: 'var(--text-tertiary)' }} />
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {booking.room?.roomNumber || '—'}
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <CreditCard className="w-3 h-3" style={{ color: 'var(--primary-color)' }} />
                  <span className="text-xs font-medium" style={{ color: 'var(--primary-color)' }}>
                    ₱{booking.totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
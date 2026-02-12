import React from 'react';
import { Hash, DoorOpen, Calendar, CreditCard } from 'lucide-react';
import type { Booking, Room } from '../../../api/booking';

interface Props {
  booking: Booking;
  selectedRoom: Room | null;
  nights: number;
  totalPrice: number;
}

const SummaryCard: React.FC<Props> = ({ booking, selectedRoom, nights, totalPrice }) => {
  const statusColors = {
    confirmed: { bg: 'rgba(212,175,55,0.2)', color: 'var(--status-confirmed)' },
    checked_in: { bg: 'rgba(74,222,128,0.2)', color: 'var(--status-available)' },
    checked_out: { bg: 'rgba(255,255,255,0.2)', color: 'var(--text-primary)' },
    cancelled: { bg: 'rgba(255,76,76,0.2)', color: 'var(--status-cancelled)' },
  };

  return (
    <div
      className="mb-6 p-4 rounded-lg border"
      style={{
        backgroundColor: 'var(--card-secondary-bg)',
        borderColor: 'var(--border-color)',
      }}
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: 'rgba(212,175,55,0.1)', color: 'var(--primary-color)' }}
          >
            <Hash className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Status</div>
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: statusColors[booking.status]?.bg || 'rgba(255,255,255,0.1)',
                color: statusColors[booking.status]?.color || 'var(--text-primary)',
              }}
            >
              {booking.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: 'rgba(212,175,55,0.1)', color: 'var(--primary-color)' }}
          >
            <DoorOpen className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Room</div>
            <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              {booking.room.roomNumber} • {booking.room.type}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: 'rgba(212,175,55,0.1)', color: 'var(--primary-color)' }}
          >
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Nights</div>
            <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              {nights} {nights === 1 ? 'night' : 'nights'}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: 'rgba(212,175,55,0.1)', color: 'var(--primary-color)' }}
          >
            <CreditCard className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Total</div>
            <div className="text-sm font-semibold" style={{ color: 'var(--primary-color)' }}>
              ${totalPrice.toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;
// src/renderer/components/Booking/View/sections/RoomInfoCard.tsx

import React from 'react';
import { DoorOpen, Users as CapacityIcon, Tag, Sparkles } from 'lucide-react';
import type { Room } from '../../../../../api/booking';

interface Props {
  room: Room;
}

export const RoomInfoCard: React.FC<Props> = ({ room }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <DoorOpen className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
        <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          Room Information
        </h4>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Room #{room?.roomNumber || '—'}
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded-full capitalize"
            style={{
              backgroundColor: 'rgba(212,175,55,0.1)',
              color: 'var(--primary-color)',
            }}
          >
            {room?.type || 'Unknown'}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-1">
            <CapacityIcon className="w-3.5 h-3.5" style={{ color: 'var(--text-tertiary)' }} />
            <span style={{ color: 'var(--text-primary)' }}>Capacity: {room?.capacity}</span>
          </div>
          <div className="flex items-center gap-1">
            <Tag className="w-3.5 h-3.5" style={{ color: 'var(--text-tertiary)' }} />
            <span style={{ color: 'var(--primary-color)' }}>₱{room?.pricePerNight}/night</span>
          </div>
        </div>
        {room?.amenities && (
          <div className="flex items-start gap-1">
            <Sparkles className="w-3.5 h-3.5 mt-0.5" style={{ color: 'var(--text-tertiary)' }} />
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {room?.amenities}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
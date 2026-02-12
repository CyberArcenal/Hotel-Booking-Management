// src/renderer/components/Room/View/sections/RoomInfoCard.tsx
import React from 'react';
import { DoorOpen, Users, Calendar } from 'lucide-react';
import type { Room } from '../../../../../api/room';
import { RoomStatusBadge } from './RoomStatusBadge';

interface Props {
  room: Room;
}

export const RoomInfoCard: React.FC<Props> = ({ room }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DoorOpen className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
          <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Room Information
          </h4>
        </div>
        {/* ✅ Use the new status badge */}
        <RoomStatusBadge status={room.status} />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Room #{room.roomNumber}
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded-full capitalize"
            style={{
              backgroundColor: 'rgba(212,175,55,0.1)',
              color: 'var(--primary-color)',
            }}
          >
            {room.type}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" style={{ color: 'var(--text-tertiary)' }} />
            <span style={{ color: 'var(--text-primary)' }}>Capacity: {room.capacity}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" style={{ color: 'var(--text-tertiary)' }} />
            <span style={{ color: 'var(--text-primary)' }}>
              Added: {new Date(room.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
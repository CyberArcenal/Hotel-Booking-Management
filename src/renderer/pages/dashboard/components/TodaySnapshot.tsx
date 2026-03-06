// src/renderer/components/Dashboard/TodaySnapshot.tsx
import React from 'react';
import { DoorOpen } from 'lucide-react';

interface TodayData {
  arrivals: number;
  departures: number;
  inHouse: number;
  availableRooms: number;
  occupancyRate?: number;
}

interface Props {
  data: TodayData | null | undefined;
}

export const TodaySnapshot: React.FC<Props> = ({ data }) => {
  if (!data) return null;

  return (
    <div
      className="compact-card p-4 rounded-lg"
      style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}
    >
      <h2 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
        <DoorOpen className="w-4 h-4" style={{ color: 'var(--primary-color)' }} />
        Today's Snapshot
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div className="text-center p-2 rounded-md" style={{ background: 'rgba(212,175,55,0.05)' }}>
          <p className="text-2xs" style={{ color: 'var(--text-tertiary)' }}>Arrivals</p>
          <p className="text-lg font-bold" style={{ color: 'var(--primary-color)' }}>{data.arrivals}</p>
        </div>
        <div className="text-center p-2 rounded-md" style={{ background: 'rgba(212,175,55,0.05)' }}>
          <p className="text-2xs" style={{ color: 'var(--text-tertiary)' }}>Departures</p>
          <p className="text-lg font-bold" style={{ color: 'var(--primary-color)' }}>{data.departures}</p>
        </div>
        <div className="text-center p-2 rounded-md" style={{ background: 'rgba(212,175,55,0.05)' }}>
          <p className="text-2xs" style={{ color: 'var(--text-tertiary)' }}>In‑House</p>
          <p className="text-lg font-bold" style={{ color: 'var(--primary-color)' }}>{data.inHouse}</p>
        </div>
        <div className="text-center p-2 rounded-md" style={{ background: 'rgba(212,175,55,0.05)' }}>
          <p className="text-2xs" style={{ color: 'var(--text-tertiary)' }}>Available</p>
          <p className="text-lg font-bold" style={{ color: 'var(--primary-color)' }}>{data.availableRooms}</p>
        </div>
      </div>
    </div>
  );
};
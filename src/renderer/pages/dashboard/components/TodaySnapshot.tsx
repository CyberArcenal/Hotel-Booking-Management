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
    <div className="windows-card p-5" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
      <h2 className="text-md font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
        <DoorOpen className="w-5 h-5" style={{ color: 'var(--primary-color)' }} />
        Today's Snapshot
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-3 rounded-lg" style={{ background: 'rgba(212,175,55,0.05)' }}>
          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Arrivals</p>
          <p className="text-2xl font-bold" style={{ color: 'var(--primary-color)' }}>{data.arrivals}</p>
        </div>
        <div className="text-center p-3 rounded-lg" style={{ background: 'rgba(212,175,55,0.05)' }}>
          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Departures</p>
          <p className="text-2xl font-bold" style={{ color: 'var(--primary-color)' }}>{data.departures}</p>
        </div>
        <div className="text-center p-3 rounded-lg" style={{ background: 'rgba(212,175,55,0.05)' }}>
          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>In‑House</p>
          <p className="text-2xl font-bold" style={{ color: 'var(--primary-color)' }}>{data.inHouse}</p>
        </div>
        <div className="text-center p-3 rounded-lg" style={{ background: 'rgba(212,175,55,0.05)' }}>
          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Available</p>
          <p className="text-2xl font-bold" style={{ color: 'var(--primary-color)' }}>{data.availableRooms}</p>
        </div>
      </div>
    </div>
  );
};
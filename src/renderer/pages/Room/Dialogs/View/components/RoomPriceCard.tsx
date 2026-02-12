// src/renderer/components/Room/View/sections/RoomPriceCard.tsx

import React from 'react';
import { Tag } from 'lucide-react';

interface Props {
  pricePerNight: number;
}

export const RoomPriceCard: React.FC<Props> = ({ pricePerNight }) => {
  return (
    <div
      className="p-4 rounded-lg"
      style={{
        backgroundColor: 'rgba(212,175,55,0.05)',
        border: '1px solid var(--border-color)',
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Tag className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
        <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          Price per Night
        </h4>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Standard rate
        </span>
        <span className="text-lg font-bold" style={{ color: 'var(--primary-color)' }}>
          ₱{pricePerNight.toFixed(2)}
        </span>
      </div>
    </div>
  );
};
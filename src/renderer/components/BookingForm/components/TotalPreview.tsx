import React from 'react';
import type { Room } from '../../../api/booking';

interface Props {
  selectedRoom: Room | null;
  nights: number;
  totalPrice: number;
}

const TotalPreview: React.FC<Props> = ({ selectedRoom, nights, totalPrice }) => {
  if (!selectedRoom || nights === 0) return null;

  return (
    <div
      className="mt-4 p-4 rounded-lg flex justify-between items-center"
      style={{
        backgroundColor: 'rgba(212,175,55,0.05)',
        border: '1px solid var(--border-color)',
      }}
    >
      <div>
        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
          Total stay price
        </span>
        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
          {nights} nights × ${selectedRoom.pricePerNight}/night
        </p>
      </div>
      <span className="text-lg font-bold" style={{ color: 'var(--primary-color)' }}>
        ${totalPrice.toFixed(2)}
      </span>
    </div>
  );
};

export default TotalPreview;
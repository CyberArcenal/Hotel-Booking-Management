// src/renderer/components/Booking/View/sections/PriceSummaryCard.tsx

import React from 'react';
import { CreditCard } from 'lucide-react';

interface Props {
  pricePerNight: number;
  nights: number;
  totalPrice: number;
}

export const PriceSummaryCard: React.FC<Props> = ({ pricePerNight, nights, totalPrice }) => {
  return (
    <div
      className="p-4 rounded-lg"
      style={{
        backgroundColor: 'rgba(212,175,55,0.05)',
        border: '1px solid var(--border-color)',
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <CreditCard className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
        <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          Payment Summary
        </h4>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span style={{ color: 'var(--text-secondary)' }}>
            ₱{pricePerNight} × {nights} {nights === 1 ? 'night' : 'nights'}
          </span>
          <span style={{ color: 'var(--text-primary)' }}>₱{pricePerNight * nights}</span>
        </div>
        <div className="flex justify-between text-base font-semibold pt-2 border-t"
          style={{ borderColor: 'var(--border-color)' }}>
          <span style={{ color: 'var(--text-primary)' }}>Total</span>
          <span style={{ color: 'var(--primary-color)' }}>₱{totalPrice.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};
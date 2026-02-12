import React from 'react';
import { Calendar, AlertCircle } from 'lucide-react';

interface Props {
  checkInDate: string;
  checkOutDate: string;
  onCheckInChange: (value: string) => void;
  onCheckOutChange: (value: string) => void;
  nights: number;
  pricePerNight?: number;
  errors?: { checkInDate?: string; checkOutDate?: string };
  disabled?: boolean;
}

const StayDatesSection: React.FC<Props> = ({
  checkInDate,
  checkOutDate,
  onCheckInChange,
  onCheckOutChange,
  nights,
  pricePerNight,
  errors = {},
  disabled,
}) => {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
        <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Stay Details</h4>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
            Check‑in <span className="text-red-400">*</span>
          </label>
          <input
            type="date"
            value={checkInDate}
            onChange={(e) => onCheckInChange(e.target.value)}
            disabled={disabled}
            className="w-full px-3 py-2 rounded text-sm disabled:opacity-50"
            style={{
              backgroundColor: 'var(--card-bg)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
            }}
          />
          {errors.checkInDate && (
            <p className="mt-1 text-xs flex items-center gap-1 text-red-400">
              <AlertCircle className="w-3 h-3" />
              {errors.checkInDate}
            </p>
          )}
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
            Check‑out <span className="text-red-400">*</span>
          </label>
          <input
            type="date"
            value={checkOutDate}
            onChange={(e) => onCheckOutChange(e.target.value)}
            disabled={disabled}
            className="w-full px-3 py-2 rounded text-sm disabled:opacity-50"
            style={{
              backgroundColor: 'var(--card-bg)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
            }}
          />
          {errors.checkOutDate && (
            <p className="mt-1 text-xs flex items-center gap-1 text-red-400">
              <AlertCircle className="w-3 h-3" />
              {errors.checkOutDate}
            </p>
          )}
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
          {nights} {nights === 1 ? 'night' : 'nights'}
        </span>
        {pricePerNight && (
          <span className="text-xs font-medium" style={{ color: 'var(--primary-color)' }}>
            ${pricePerNight} / night
          </span>
        )}
      </div>
    </div>
  );
};

export default StayDatesSection;
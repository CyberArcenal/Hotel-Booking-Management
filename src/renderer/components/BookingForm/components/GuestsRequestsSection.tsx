import React from 'react';
import { Users, AlertCircle } from 'lucide-react';

interface Props {
  numberOfGuests: number;
  onNumberOfGuestsChange: (value: number) => void;
  specialRequests: string;
  onSpecialRequestsChange: (value: string) => void;
  maxCapacity?: number;
  errors?: { numberOfGuests?: string; specialRequests?: string };
  disabled?: boolean;
}

const GuestsRequestsSection: React.FC<Props> = ({
  numberOfGuests,
  onNumberOfGuestsChange,
  specialRequests,
  onSpecialRequestsChange,
  maxCapacity,
  errors = {},
  disabled,
}) => {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Users className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
        <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Guests & Requests</h4>
      </div>
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
            Number of guests <span className="text-red-400">*</span>
          </label>
          <input
            type="number"
            min="1"
            max={maxCapacity || 10}
            value={numberOfGuests}
            onChange={(e) => onNumberOfGuestsChange(parseInt(e.target.value) || 1)}
            disabled={disabled}
            className="w-full px-3 py-2 rounded text-sm disabled:opacity-50"
            style={{
              backgroundColor: 'var(--card-bg)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
            }}
          />
          {errors.numberOfGuests && (
            <p className="mt-1 text-xs flex items-center gap-1 text-red-400">
              <AlertCircle className="w-3 h-3" />
              {errors.numberOfGuests}
            </p>
          )}
        </div>
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
            Special requests
          </label>
          <textarea
            rows={3}
            value={specialRequests}
            onChange={(e) => onSpecialRequestsChange(e.target.value)}
            disabled={disabled}
            className="w-full px-3 py-2 rounded text-sm resize-none disabled:opacity-50"
            style={{
              backgroundColor: 'var(--card-bg)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
            }}
            placeholder="Early check-in, extra bed, dietary restrictions..."
          />
          {errors.specialRequests && (
            <p className="mt-1 text-xs flex items-center gap-1 text-red-400">
              <AlertCircle className="w-3 h-3" />
              {errors.specialRequests}
            </p>
          )}
          <div className="mt-1 text-right">
            <span
              className={`text-xs px-2 py-0.5 rounded ${
                specialRequests.length > 500
                  ? 'bg-red-900/50 text-red-300'
                  : 'bg-gray-800 text-gray-400'
              }`}
            >
              {specialRequests.length}/500
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestsRequestsSection;
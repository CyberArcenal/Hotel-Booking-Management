// src/renderer/components/Guest/Form/sections/IdentificationSection.tsx

import React from 'react';
import { MapPin, Hash } from 'lucide-react';
import type { GuestFormData } from '../hooks/useGuestForm';

interface Props {
  formData: GuestFormData;
  errors: Record<string, string>;
  onChange: (field: keyof GuestFormData, value: string) => void;
  disabled?: boolean;
}

export const IdentificationSection: React.FC<Props> = ({
  formData,
  errors,
  onChange,
  disabled = false,
}) => {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
        Additional Information
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            className="block text-xs font-medium mb-1.5"
            style={{ color: 'var(--text-secondary)' }}
          >
            Address
          </label>
          <div className="relative">
            <input
              type="text"
              value={formData.address}
              onChange={(e) => onChange('address', e.target.value)}
              disabled={disabled}
              className="w-full px-3 py-2 rounded text-sm pl-9 disabled:opacity-50"
              style={{
                backgroundColor: 'var(--card-bg)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
              }}
              placeholder="Street, City, Province"
            />
            <MapPin
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5"
              style={{ color: 'var(--text-tertiary)' }}
            />
          </div>
          {errors.address && <p className="mt-1 text-xs text-red-400">{errors.address}</p>}
        </div>

        <div>
          <label
            className="block text-xs font-medium mb-1.5"
            style={{ color: 'var(--text-secondary)' }}
          >
            ID / Passport Number
          </label>
          <div className="relative">
            <input
              type="text"
              value={formData.idNumber}
              onChange={(e) => onChange('idNumber', e.target.value)}
              disabled={disabled}
              className="w-full px-3 py-2 rounded text-sm pl-9 disabled:opacity-50"
              style={{
                backgroundColor: 'var(--card-bg)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
              }}
              placeholder="Optional"
            />
            <Hash
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5"
              style={{ color: 'var(--text-tertiary)' }}
            />
          </div>
          {errors.idNumber && <p className="mt-1 text-xs text-red-400">{errors.idNumber}</p>}
        </div>
      </div>
    </div>
  );
};
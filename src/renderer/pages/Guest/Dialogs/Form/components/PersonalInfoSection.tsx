// src/renderer/components/Guest/Form/sections/PersonalInfoSection.tsx

import React from 'react';
import { User, Globe } from 'lucide-react';
import type { GuestFormData } from '../hooks/useGuestForm';

interface Props {
  formData: GuestFormData;
  errors: Record<string, string>;
  onChange: (field: keyof GuestFormData, value: string) => void;
  disabled?: boolean;
}

export const PersonalInfoSection: React.FC<Props> = ({
  formData,
  errors,
  onChange,
  disabled = false,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <User className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
        <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          Personal Information
        </h4>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            className="block text-xs font-medium mb-1.5"
            style={{ color: 'var(--text-secondary)' }}
          >
            Full name <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => onChange('fullName', e.target.value)}
              disabled={disabled}
              className="w-full px-3 py-2 rounded text-sm pl-9 disabled:opacity-50"
              style={{
                backgroundColor: 'var(--card-bg)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
              }}
              placeholder="Juan Dela Cruz"
            />
            <User
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5"
              style={{ color: 'var(--text-tertiary)' }}
            />
          </div>
          {errors.fullName && (
            <p className="mt-1 text-xs text-red-400">{errors.fullName}</p>
          )}
        </div>

        <div>
          <label
            className="block text-xs font-medium mb-1.5"
            style={{ color: 'var(--text-secondary)' }}
          >
            Nationality
          </label>
          <div className="relative">
            <input
              type="text"
              value={formData.nationality}
              onChange={(e) => onChange('nationality', e.target.value)}
              disabled={disabled}
              className="w-full px-3 py-2 rounded text-sm pl-9 disabled:opacity-50"
              style={{
                backgroundColor: 'var(--card-bg)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
              }}
              placeholder="Filipino"
            />
            <Globe
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5"
              style={{ color: 'var(--text-tertiary)' }}
            />
          </div>
          {errors.nationality && (
            <p className="mt-1 text-xs text-red-400">{errors.nationality}</p>
          )}
        </div>
      </div>
    </div>
  );
};
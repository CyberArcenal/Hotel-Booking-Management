// src/renderer/components/Guest/Form/sections/ContactInfoSection.tsx

import React from 'react';
import { Mail, Phone } from 'lucide-react';
import type { GuestFormData } from '../hooks/useGuestForm';

interface Props {
  formData: GuestFormData;
  errors: Record<string, string>;
  onChange: (field: keyof GuestFormData, value: string) => void;
  disabled?: boolean;
}

export const ContactInfoSection: React.FC<Props> = ({
  formData,
  errors,
  onChange,
  disabled = false,
}) => {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
        Contact Information
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            className="block text-xs font-medium mb-1.5"
            style={{ color: 'var(--text-secondary)' }}
          >
            Email <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <input
              type="email"
              value={formData.email}
              onChange={(e) => onChange('email', e.target.value)}
              disabled={disabled}
              className="w-full px-3 py-2 rounded text-sm pl-9 disabled:opacity-50"
              style={{
                backgroundColor: 'var(--card-bg)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
              }}
              placeholder="guest@example.com"
            />
            <Mail
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5"
              style={{ color: 'var(--text-tertiary)' }}
            />
          </div>
          {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
        </div>

        <div>
          <label
            className="block text-xs font-medium mb-1.5"
            style={{ color: 'var(--text-secondary)' }}
          >
            Phone <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => onChange('phone', e.target.value)}
              disabled={disabled}
              className="w-full px-3 py-2 rounded text-sm pl-9 disabled:opacity-50"
              style={{
                backgroundColor: 'var(--card-bg)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
              }}
              placeholder="+63 912 345 6789"
            />
            <Phone
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5"
              style={{ color: 'var(--text-tertiary)' }}
            />
          </div>
          {errors.phone && <p className="mt-1 text-xs text-red-400">{errors.phone}</p>}
        </div>
      </div>
    </div>
  );
};
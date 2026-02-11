// src/renderer/pages/Settings/components/BookingTab.tsx
import React from 'react';
import { type BookingSettings } from '../../../api/system_config';

interface Props {
  settings: BookingSettings;
  onUpdate: (field: keyof BookingSettings, value: any) => void;
}

const BookingTab: React.FC<Props> = ({ settings, onUpdate }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-[var(--text-primary)]">Booking Settings</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-1">Default Check‑in Time</label>
          <input
            type="time"
            value={settings.default_checkin_time || '14:00'}
            onChange={(e) => onUpdate('default_checkin_time', e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-[var(--card-secondary-bg)] border border-[var(--border-color)]/20
                       text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--primary-color)]/50"
          />
        </div>
        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-1">Default Check‑out Time</label>
          <input
            type="time"
            value={settings.default_checkout_time || '12:00'}
            onChange={(e) => onUpdate('default_checkout_time', e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-[var(--card-secondary-bg)] border border-[var(--border-color)]/20
                       text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--primary-color)]/50"
          />
        </div>
        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-1">Cancellation Window (hours)</label>
          <input
            type="number"
            min="0"
            value={settings.cancellation_window_hours ?? 24}
            onChange={(e) => onUpdate('cancellation_window_hours', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 rounded-lg bg-[var(--card-secondary-bg)] border border-[var(--border-color)]/20
                       text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--primary-color)]/50"
          />
        </div>
        <div className="flex items-center">
          <label className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
            <input
              type="checkbox"
              checked={settings.auto_assign_rooms || false}
              onChange={(e) => onUpdate('auto_assign_rooms', e.target.checked)}
              className="w-4 h-4 rounded border-[var(--border-color)]/20 bg-[var(--card-secondary-bg)]
                         checked:bg-[var(--primary-color)] checked:border-[var(--primary-color)]
                         focus:ring-1 focus:ring-[var(--primary-color)]/50"
            />
            Auto‑assign rooms
          </label>
        </div>
        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-1">Default Booking Status</label>
          <select
            value={settings.default_booking_status || 'pending'}
            onChange={(e) => onUpdate('default_booking_status', e.target.value as 'pending' | 'confirmed')}
            className="w-full px-3 py-2 rounded-lg bg-[var(--card-secondary-bg)] border border-[var(--border-color)]/20
                       text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--primary-color)]/50"
          >
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default BookingTab;
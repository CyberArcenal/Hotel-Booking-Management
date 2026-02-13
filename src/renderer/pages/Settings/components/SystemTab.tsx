// src/renderer/pages/Settings/components/SystemTab.tsx
import React from 'react';
import { type SystemSettings } from '../../../api/system_config';

interface Props {
  settings: SystemSettings;
  onUpdate: (field: keyof SystemSettings, value: any) => void;
}

const SystemTab: React.FC<Props> = ({ settings, onUpdate }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-[var(--text-primary)]">System Settings</h3>
      <div className="space-y-3">
        <div className="flex items-center hidden">
          <label className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
            <input
              type="checkbox"
              checked={settings.debug_mode || false}
              onChange={(e) => onUpdate('debug_mode', e.target.checked)}
              className="w-4 h-4 rounded border-[var(--border-color)]/20 bg-[var(--card-secondary-bg)]
                         checked:bg-[var(--primary-color)] checked:border-[var(--primary-color)]
                         focus:ring-1 focus:ring-[var(--primary-color)]/50"
            />
            Debug Mode
          </label>
        </div>
        <div className="flex items-center">
          <label className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
            <input
              type="checkbox"
              checked={settings.audit_trail_enabled || false}
              onChange={(e) => onUpdate('audit_trail_enabled', e.target.checked)}
              className="w-4 h-4 rounded border-[var(--border-color)]/20 bg-[var(--card-secondary-bg)]
                         checked:bg-[var(--primary-color)] checked:border-[var(--primary-color)]
                         focus:ring-1 focus:ring-[var(--primary-color)]/50"
            />
            Enable Audit Trail
          </label>
        </div>
        <div className='hidden'>
          <label className="block text-sm text-[var(--text-secondary)] mb-1">Environment</label>
          <select
            value={settings.environment || 'development'}
            onChange={(e) => onUpdate('environment', e.target.value as 'production' | 'development')}
            className="w-full px-3 py-2 rounded-lg bg-[var(--card-secondary-bg)] border border-[var(--border-color)]/20
                       text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--primary-color)]/50"
          >
            <option value="development">Development</option>
            <option value="production">Production</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default SystemTab;
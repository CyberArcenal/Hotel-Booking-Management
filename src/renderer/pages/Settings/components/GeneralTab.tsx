// src/renderer/pages/Settings/components/GeneralTab.tsx
import React from 'react';
import { type GeneralSettings } from '../../../api/system_config';

interface Props {
  settings: GeneralSettings;
  onUpdate: (field: keyof GeneralSettings, value: any) => void;
}

const GeneralTab: React.FC<Props> = ({ settings, onUpdate }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-[var(--text-primary)]">General Settings</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-1">Currency</label>
          <select
            value={settings.currency || ''}
            onChange={(e) => onUpdate('currency', e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-[var(--card-secondary-bg)] border border-[var(--border-color)]/20
                       text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--primary-color)]/50"
          >
            {/* <option value="USD">USD</option> */}
            <option value="PHP">PHP</option>
            {/* <option value="EUR">EUR</option>
            <option value="JPY">JPY</option> */}
          </select>
        </div>
        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-1">Language</label>
          <select
            value={settings.language || 'en'}
            onChange={(e) => onUpdate('language', e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-[var(--card-secondary-bg)] border border-[var(--border-color)]/20
                       text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--primary-color)]/50"
          >
            <option value="en">English</option>
            {/* <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="zh">Chinese</option>
            <option value="ja">Japanese</option> */}
          </select>
        </div>
        <div>
          <label className="block text-sm text-[var(--text-secondary)] mb-1">Timezone</label>
          <input
            type="text"
            value={settings.timezone || ''}
            onChange={(e) => onUpdate('timezone', e.target.value)}
            placeholder="e.g. Asia/Manila"
            className="w-full px-3 py-2 rounded-lg bg-[var(--card-secondary-bg)] border border-[var(--border-color)]/20
                       text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--primary-color)]/50"
          />
        </div>
      </div>
    </div>
  );
};

export default GeneralTab;
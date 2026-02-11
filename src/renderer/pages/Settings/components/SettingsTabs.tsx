// src/renderer/pages/Settings/components/SettingsTabs.tsx
import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import { SettingType } from '../../../api/system_config';

const tabs: { id: SettingType; label: string }[] = [
  { id: 'general', label: 'General' },
  { id: 'booking', label: 'Booking' },
  { id: 'room', label: 'Room' },
  { id: 'notification', label: 'Notification' },
  { id: 'system', label: 'System' },
];

interface Props {
  activeTab: SettingType;
  onTabChange: (tab: SettingType) => void;
}

const SettingsTabs: React.FC<Props> = ({ activeTab, onTabChange }) => {
  return (
    <div className="border-b border-[var(--border-color)]/20 mb-6">
      <nav className="flex -mb-px space-x-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`py-2 px-1 inline-flex items-center gap-2 border-b-2 font-medium text-sm
              ${activeTab === tab.id
                ? 'border-[var(--primary-color)] text-[var(--primary-color)]'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-color)]'
              } transition-colors`}
          >
            <SettingsIcon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default SettingsTabs;
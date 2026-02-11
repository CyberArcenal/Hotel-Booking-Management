// src/renderer/pages/Settings/components/SystemInfoCard.tsx
import React from 'react';
import { type SystemInfoData } from '../../../api/system_config';

interface Props {
  info: SystemInfoData;
}

const SystemInfoCard: React.FC<Props> = ({ info }) => {
  return (
    <div className="mb-6 p-4 bg-[var(--card-bg)] border border-[var(--border-color)]/20 rounded-lg">
      <h3 className="text-sm font-medium text-[var(--text-primary)] mb-2">System Information</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <span className="text-[var(--text-tertiary)]">Version</span>
          <p className="text-[var(--text-primary)] font-medium">{info.version}</p>
        </div>
        <div>
          <span className="text-[var(--text-tertiary)]">Environment</span>
          <p className="text-[var(--text-primary)] font-medium">{info.environment}</p>
        </div>
        <div>
          <span className="text-[var(--text-tertiary)]">Debug Mode</span>
          <p className="text-[var(--text-primary)] font-medium">{info.debug_mode ? 'On' : 'Off'}</p>
        </div>
        <div>
          <span className="text-[var(--text-tertiary)]">Timezone</span>
          <p className="text-[var(--text-primary)] font-medium">{info.timezone}</p>
        </div>
      </div>
    </div>
  );
};

export default SystemInfoCard;
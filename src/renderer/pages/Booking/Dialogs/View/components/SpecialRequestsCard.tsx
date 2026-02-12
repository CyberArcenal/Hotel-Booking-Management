// src/renderer/components/Booking/View/sections/SpecialRequestsCard.tsx

import React from 'react';
import { FileText } from 'lucide-react';

interface Props {
  requests: string | null;
}

export const SpecialRequestsCard: React.FC<Props> = ({ requests }) => {
  if (!requests) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <FileText className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
        <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          Special Requests
        </h4>
      </div>
      <p
        className="text-sm p-3 rounded"
        style={{
          backgroundColor: 'var(--card-secondary-bg)',
          color: 'var(--text-primary)',
        }}
      >
        {requests}
      </p>
    </div>
  );
};
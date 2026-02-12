// src/renderer/components/Room/View/sections/AmenitiesCard.tsx

import React from 'react';
import { Sparkles } from 'lucide-react';

interface Props {
  amenities: string | null;
}

export const AmenitiesCard: React.FC<Props> = ({ amenities }) => {
  if (!amenities) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
          <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Amenities
          </h4>
        </div>
        <p className="text-sm italic" style={{ color: 'var(--text-tertiary)' }}>
          No amenities listed
        </p>
      </div>
    );
  }

  // Split amenities by comma or newline for better display
  const amenitiesList = amenities.split(',').map(item => item.trim());

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
        <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          Amenities
        </h4>
      </div>
      <div className="flex flex-wrap gap-2">
        {amenitiesList.map((amenity, index) => (
          <span
            key={index}
            className="text-xs px-2 py-1 rounded"
            style={{
              backgroundColor: 'rgba(212,175,55,0.1)',
              color: 'var(--text-secondary)',
            }}
          >
            {amenity}
          </span>
        ))}
      </div>
    </div>
  );
};
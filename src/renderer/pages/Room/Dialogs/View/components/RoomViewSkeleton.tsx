// src/renderer/components/Room/View/RoomViewSkeleton.tsx

import React from 'react';

export const RoomViewSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <div className="h-20 shimmer rounded" />
        </div>
        <div>
          <div className="h-20 shimmer rounded" />
        </div>
      </div>
      <div className="h-16 shimmer rounded" />
      <div className="h-32 shimmer rounded" />
    </div>
  );
};
// src/renderer/components/Guest/View/GuestViewSkeleton.tsx

import React from 'react';

export const GuestViewSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-6 w-32 shimmer rounded" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <div className="h-40 shimmer rounded" />
        </div>
        <div>
          <div className="h-32 shimmer rounded" />
        </div>
      </div>
      <div className="h-48 shimmer rounded" />
    </div>
  );
};
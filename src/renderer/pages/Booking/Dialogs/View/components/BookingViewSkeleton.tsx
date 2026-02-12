// src/renderer/components/Booking/View/BookingViewSkeleton.tsx

import React from 'react';

export const BookingViewSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-6 w-32 shimmer rounded" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="h-20 shimmer rounded" />
          <div className="h-32 shimmer rounded" />
        </div>
        <div className="space-y-4">
          <div className="h-40 shimmer rounded" />
          <div className="h-24 shimmer rounded" />
        </div>
      </div>
    </div>
  );
};
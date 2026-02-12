// src/renderer/components/Guest/Form/GuestFormSkeleton.tsx

import React from 'react';

export const GuestFormSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-6 w-40 shimmer rounded mb-4" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="h-12 shimmer rounded" />
        <div className="h-12 shimmer rounded" />
        <div className="h-12 shimmer rounded" />
        <div className="h-12 shimmer rounded" />
        <div className="h-12 shimmer rounded" />
        <div className="h-12 shimmer rounded" />
      </div>
      <div className="h-24 shimmer rounded" />
    </div>
  );
};
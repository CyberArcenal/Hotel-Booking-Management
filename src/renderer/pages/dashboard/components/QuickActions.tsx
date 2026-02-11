// src/renderer/components/Dashboard/QuickActions.tsx
import React from 'react';
import { LogIn, CalendarDays, FileText } from 'lucide-react';

export const QuickActions: React.FC = () => {
  return (
    <div className="flex flex-wrap gap-3">
      <button className="windows-btn windows-btn-primary flex items-center gap-2 px-4 py-2">
        <LogIn className="w-4 h-4" /> Check‑in
      </button>
      <button className="windows-btn windows-btn-secondary flex items-center gap-2 px-4 py-2">
        <CalendarDays className="w-4 h-4" /> New Booking
      </button>
      <button className="windows-btn windows-btn-secondary flex items-center gap-2 px-4 py-2">
        <FileText className="w-4 h-4" /> Export Report
      </button>
    </div>
  );
};
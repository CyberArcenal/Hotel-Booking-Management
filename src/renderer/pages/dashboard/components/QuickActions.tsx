// src/renderer/components/Dashboard/QuickActions.tsx
import React from "react";
import { LogIn, CalendarDays, FileText } from "lucide-react";

export interface QuickActionProps {
  onNewBooking: () => void;
  onExportReport: () => void;
  onCheckIn: () => void;
}

export const QuickActions: React.FC<QuickActionProps> = ({
  onNewBooking,
  onExportReport,
  onCheckIn,
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => {
          onCheckIn();
        }}
        className="windows-btn windows-btn-primary flex items-center gap-1.5 px-3 py-1.5 text-xs"
      >
        <LogIn className="w-3.5 h-3.5" /> Check‑in
      </button>
      <button
        onClick={() => {
          onNewBooking();
        }}
        className="windows-btn windows-btn-secondary flex items-center gap-1.5 px-3 py-1.5 text-xs"
      >
        <CalendarDays className="w-3.5 h-3.5" /> New Booking
      </button>
      <button
        onClick={() => {
          onExportReport();
        }}
        className="windows-btn windows-btn-secondary flex items-center gap-1.5 px-3 py-1.5 text-xs"
      >
        <FileText className="w-3.5 h-3.5" /> Export Report
      </button>
    </div>
  );
};

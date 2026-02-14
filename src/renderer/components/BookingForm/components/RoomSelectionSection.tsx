// src/renderer/components/Booking/Form/components/RoomSelectionSection.tsx
import React from 'react';
import { DoorOpen, AlertCircle, Loader } from 'lucide-react';
import RoomSelect from '../../Selects/Room';

interface Props {
  value: number | null;
  onChange: (roomId: number | null) => void;
  disabled?: boolean;
  error?: string;
  isChecking?: boolean;
  isUnavailable?: boolean;
}

const RoomSelectionSection: React.FC<Props> = ({
  value,
  onChange,
  disabled,
  error,
  isChecking,
  isUnavailable,
}) => {
  return (
    <div
      className={`p-4 rounded-lg transition-colors ${
        isUnavailable ? 'border border-red-500' : ''
      }`}
      style={isUnavailable ? { borderColor: 'var(--status-cancelled)' } : {}}
    >
      <div className="flex items-center gap-2 mb-3">
        <DoorOpen className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
        <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          Room Selection
        </h4>
        {isChecking && (
          <div className="ml-auto flex items-center gap-1">
            <Loader className="w-3 h-3 animate-spin" style={{ color: 'var(--text-tertiary)' }} />
            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Checking...</span>
          </div>
        )}
      </div>
      <RoomSelect
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder="Select a room"
        includeTypeFilter
        includeAvailabilityFilter
      />
      {error && (
        <p className="mt-1 text-xs flex items-center gap-1 text-red-400">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
      {isUnavailable && !error && (
        <p className="mt-1 text-xs flex items-center gap-1 text-red-400">
          <AlertCircle className="w-3 h-3" />
          Room not available for these dates
        </p>
      )}
    </div>
  );
};

export default RoomSelectionSection;
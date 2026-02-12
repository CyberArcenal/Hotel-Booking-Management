import React from 'react';
import { DoorOpen, AlertCircle } from 'lucide-react';
import RoomSelect from '../../Selects/Room';

interface Props {
  value: number | null;
  onChange: (roomId: number | null) => void;
  disabled?: boolean;
  error?: string;
}

const RoomSelectionSection: React.FC<Props> = ({ value, onChange, disabled, error }) => {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <DoorOpen className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
        <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Room Selection</h4>
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
    </div>
  );
};

export default RoomSelectionSection;
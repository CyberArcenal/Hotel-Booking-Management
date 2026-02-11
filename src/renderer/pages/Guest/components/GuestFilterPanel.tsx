import React, { useState } from 'react';
import { X, Filter } from 'lucide-react';

interface GuestFilterPanelProps {
  filters: any;
  onChange: (filters: any) => void;
  onClear: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

const GuestFilterPanel: React.FC<GuestFilterPanelProps> = ({
  filters,
  onChange,
  onClear,
  isOpen,
  onToggle,
}) => {
  const [localFilters, setLocalFilters] = useState({
    nationality: filters.nationality || '',
    hasBookings: filters.hasBookings || false,
    minBookings: filters.minBookings || '',
  });

  const handleApply = () => {
    onChange(localFilters);
    onToggle();
  };

  const handleClear = () => {
    setLocalFilters({ nationality: '', hasBookings: false, minBookings: '' });
    onClear();
    onToggle();
  };

  if (!isOpen) return null;

  return (
    <div className="mt-4 p-4 bg-[var(--card-bg)] border border-[var(--border-color)]/20 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-[var(--text-primary)] flex items-center gap-2">
          <Filter className="w-4 h-4" /> Filter Guests
        </h3>
        <button
          onClick={onToggle}
          className="p-1 rounded-lg hover:bg-[var(--card-hover-bg)] transition-colors"
        >
          <X className="w-4 h-4 text-[var(--text-tertiary)]" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Nationality Filter */}
        <div>
          <label className="block text-xs text-[var(--text-secondary)] mb-1">Nationality</label>
          <input
            type="text"
            value={localFilters.nationality}
            onChange={(e) => setLocalFilters((prev) => ({ ...prev, nationality: e.target.value }))}
            placeholder="e.g. Filipino"
            className="w-full px-3 py-2 rounded-lg bg-[var(--card-secondary-bg)] border border-[var(--border-color)]/20
                       text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--primary-color)]/50"
          />
        </div>

        {/* Has Bookings (checkbox) */}
        <div className="flex items-center">
          <label className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
            <input
              type="checkbox"
              checked={localFilters.hasBookings}
              onChange={(e) => setLocalFilters((prev) => ({ ...prev, hasBookings: e.target.checked }))}
              className="w-4 h-4 rounded border-[var(--border-color)]/20 bg-[var(--card-secondary-bg)]
                         checked:bg-[var(--primary-color)] checked:border-[var(--primary-color)]
                         focus:ring-1 focus:ring-[var(--primary-color)]/50"
            />
            Has bookings
          </label>
        </div>

        {/* Minimum Bookings */}
        <div>
          <label className="block text-xs text-[var(--text-secondary)] mb-1">Min. bookings</label>
          <input
            type="number"
            min="0"
            value={localFilters.minBookings}
            onChange={(e) => setLocalFilters((prev) => ({ ...prev, minBookings: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg bg-[var(--card-secondary-bg)] border border-[var(--border-color)]/20
                       text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--primary-color)]/50"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 mt-4">
        <button
          onClick={handleClear}
          className="px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          Clear
        </button>
        <button
          onClick={handleApply}
          className="px-4 py-2 text-sm bg-[var(--primary-color)] text-black font-medium rounded-lg
                     hover:bg-[var(--primary-hover)] transition-colors"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};

export default GuestFilterPanel;
import React, { useState } from 'react';
import { X, Calendar, Filter } from 'lucide-react';

interface BookingFilterPanelProps {
  filters: any;
  onChange: (filters: any) => void;
  onClear: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

const BookingFilterPanel: React.FC<BookingFilterPanelProps> = ({
  filters,
  onChange,
  onClear,
  isOpen,
  onToggle,
}) => {
  const [localFilters, setLocalFilters] = useState({
    status: filters.status || '',
    checkInDate: filters.checkInDate || '',
    checkOutDate: filters.checkOutDate || '',
  });

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'checked_in', label: 'Checked In' },
    { value: 'checked_out', label: 'Checked Out' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const handleApply = () => {
    onChange(localFilters);
    onToggle(); // close panel
  };

  const handleClear = () => {
    setLocalFilters({ status: '', checkInDate: '', checkOutDate: '' });
    onClear();
    onToggle();
  };

  if (!isOpen) return null;

  return (
    <div className="mt-4 p-4 bg-[var(--card-bg)] border border-[var(--border-color)]/20 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-[var(--text-primary)] flex items-center gap-2">
          <Filter className="w-4 h-4" /> Filter Bookings
        </h3>
        <button
          onClick={onToggle}
          className="p-1 rounded-lg hover:bg-[var(--card-hover-bg)] transition-colors"
        >
          <X className="w-4 h-4 text-[var(--text-tertiary)]" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Status Filter */}
        <div>
          <label className="block text-xs text-[var(--text-secondary)] mb-1">Status</label>
          <select
            value={localFilters.status}
            onChange={(e) => setLocalFilters((prev) => ({ ...prev, status: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg bg-[var(--card-secondary-bg)] border border-[var(--border-color)]/20
                       text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--primary-color)]/50"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range */}
        <div>
          <label className="block text-xs text-[var(--text-secondary)] mb-1">Check‑in From</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
            <input
              type="date"
              value={localFilters.checkInDate}
              onChange={(e) => setLocalFilters((prev) => ({ ...prev, checkInDate: e.target.value }))}
              className="w-full pl-10 pr-3 py-2 rounded-lg bg-[var(--card-secondary-bg)] border border-[var(--border-color)]/20
                         text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--primary-color)]/50"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-[var(--text-secondary)] mb-1">Check‑out To</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
            <input
              type="date"
              value={localFilters.checkOutDate}
              onChange={(e) => setLocalFilters((prev) => ({ ...prev, checkOutDate: e.target.value }))}
              className="w-full pl-10 pr-3 py-2 rounded-lg bg-[var(--card-secondary-bg)] border border-[var(--border-color)]/20
                         text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--primary-color)]/50"
            />
          </div>
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

export default BookingFilterPanel;
// src/pages/Audit/components/AuditFilterPanel.tsx
import React, { useState } from 'react';
import { X, Filter } from 'lucide-react';

interface AuditFilterPanelProps {
  filters: any;
  onChange: (filters: any) => void;
  onClear: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

const AuditFilterPanel: React.FC<AuditFilterPanelProps> = ({
  filters,
  onChange,
  onClear,
  isOpen,
  onToggle,
}) => {
  const [localFilters, setLocalFilters] = useState({
    entity: filters.entity || '',
    user: filters.user || '',
    action: filters.action || '',
    startDate: filters.startDate || '',
    endDate: filters.endDate || '',
  });

  const handleApply = () => {
    onChange(localFilters);
  };

  const handleClear = () => {
    setLocalFilters({ entity: '', user: '', action: '', startDate: '', endDate: '' });
    onClear();
  };

  if (!isOpen) return null;

  return (
    <div className="mt-4 p-4 bg-[var(--card-bg)] border border-[var(--border-color)]/20 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-[var(--text-primary)] flex items-center gap-2">
          <Filter className="w-4 h-4" /> Filter Audit Logs
        </h3>
        <button
          onClick={onToggle}
          className="p-1 rounded-lg hover:bg-[var(--card-hover-bg)] transition-colors"
        >
          <X className="w-4 h-4 text-[var(--text-tertiary)]" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <label className="block text-xs text-[var(--text-secondary)] mb-1">Entity</label>
          <input
            type="text"
            value={localFilters.entity}
            onChange={(e) => setLocalFilters((p) => ({ ...p, entity: e.target.value }))}
            placeholder="e.g. Room, Booking"
            className="w-full px-3 py-2 rounded-lg bg-[var(--card-secondary-bg)] border border-[var(--border-color)]/20
                       text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--primary-color)]/50"
          />
        </div>
        <div>
          <label className="block text-xs text-[var(--text-secondary)] mb-1">User</label>
          <input
            type="text"
            value={localFilters.user}
            onChange={(e) => setLocalFilters((p) => ({ ...p, user: e.target.value }))}
            placeholder="Username"
            className="w-full px-3 py-2 rounded-lg bg-[var(--card-secondary-bg)] border border-[var(--border-color)]/20
                       text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--primary-color)]/50"
          />
        </div>
        <div>
          <label className="block text-xs text-[var(--text-secondary)] mb-1">Action</label>
          <input
            type="text"
            value={localFilters.action}
            onChange={(e) => setLocalFilters((p) => ({ ...p, action: e.target.value }))}
            placeholder="CREATE, UPDATE, DELETE"
            className="w-full px-3 py-2 rounded-lg bg-[var(--card-secondary-bg)] border border-[var(--border-color)]/20
                       text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--primary-color)]/50"
          />
        </div>
        <div>
          <label className="block text-xs text-[var(--text-secondary)] mb-1">Start Date</label>
          <input
            type="date"
            value={localFilters.startDate}
            onChange={(e) => setLocalFilters((p) => ({ ...p, startDate: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg bg-[var(--card-secondary-bg)] border border-[var(--border-color)]/20
                       text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--primary-color)]/50"
          />
        </div>
        <div>
          <label className="block text-xs text-[var(--text-secondary)] mb-1">End Date</label>
          <input
            type="date"
            value={localFilters.endDate}
            onChange={(e) => setLocalFilters((p) => ({ ...p, endDate: e.target.value }))}
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

export default AuditFilterPanel;
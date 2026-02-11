import React, { useState, useEffect } from 'react';
import { Calendar, FileText, Filter } from 'lucide-react';
import { type ExportType, type ExportOptions } from '../hooks/useExport';

interface ExportFormProps {
  type: ExportType;
  onSubmit: (options: ExportOptions) => void;
  loading: boolean;
}

const ExportForm: React.FC<ExportFormProps> = ({ type, onSubmit, loading }) => {
  const [format, setFormat] = useState<'csv' | 'pdf' | 'excel'>('csv');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [showFilters, setShowFilters] = useState(false);

  // Set default date range based on type
  useEffect(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    setStartDate(firstDay.toISOString().split('T')[0]);
    setEndDate(lastDay.toISOString().split('T')[0]);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const options: ExportOptions = {
      type,
      format,
    };

    // Add date range for types that need it
    if (type === 'financial' || type === 'occupancy' || type === 'bookings' || type === 'guests' || type === 'rooms') {
      if (startDate && endDate) {
        options.dateRange = { startDate, endDate };
      }
    }

    // Add type-specific filters
    if (type === 'bookings') {
      options.filters = {
        status: filters.status || undefined,
      };
    }
    if (type === 'rooms') {
      options.filters = {
        type: filters.roomType || undefined,
        availableOnly: filters.availableOnly || false,
      };
    }
    if (type === 'guests') {
      options.filters = {
        nationality: filters.nationality || undefined,
        hasBookings: filters.hasBookings || false,
        minBookings: filters.minBookings || undefined,
      };
    }

    onSubmit(options);
  };

  // Render type-specific filter fields
  const renderFilters = () => {
    switch (type) {
      case 'bookings':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-[var(--text-secondary)] mb-1">Status</label>
              <select
                value={filters.status || ''}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--card-secondary-bg)] border border-[var(--border-color)]/20
                           text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)]/50"
              >
                <option value="">All Statuses</option>
                <option value="confirmed">Confirmed</option>
                <option value="checked_in">Checked In</option>
                <option value="checked_out">Checked Out</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        );
      case 'rooms':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-[var(--text-secondary)] mb-1">Room Type</label>
              <input
                type="text"
                value={filters.roomType || ''}
                onChange={(e) => setFilters({ ...filters, roomType: e.target.value })}
                placeholder="e.g. Deluxe, Suite"
                className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--card-secondary-bg)] border border-[var(--border-color)]/20
                           text-[var(--text-primary)] placeholder-[var(--text-tertiary)]
                           focus:outline-none focus:border-[var(--primary-color)]/50"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="availableOnly"
                checked={filters.availableOnly || false}
                onChange={(e) => setFilters({ ...filters, availableOnly: e.target.checked })}
                className="w-4 h-4 rounded border-[var(--border-color)]/20 bg-[var(--card-secondary-bg)]
                           checked:bg-[var(--primary-color)] checked:border-[var(--primary-color)]
                           focus:ring-1 focus:ring-[var(--primary-color)]/50"
              />
              <label htmlFor="availableOnly" className="text-sm text-[var(--text-primary)]">
                Available rooms only
              </label>
            </div>
          </div>
        );
      case 'guests':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-[var(--text-secondary)] mb-1">Nationality</label>
              <input
                type="text"
                value={filters.nationality || ''}
                onChange={(e) => setFilters({ ...filters, nationality: e.target.value })}
                placeholder="e.g. Filipino"
                className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--card-secondary-bg)] border border-[var(--border-color)]/20
                           text-[var(--text-primary)] placeholder-[var(--text-tertiary)]
                           focus:outline-none focus:border-[var(--primary-color)]/50"
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--text-secondary)] mb-1">Minimum Bookings</label>
              <input
                type="number"
                min="0"
                value={filters.minBookings || ''}
                onChange={(e) => setFilters({ ...filters, minBookings: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--card-secondary-bg)] border border-[var(--border-color)]/20
                           text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)]/50"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="hasBookings"
                checked={filters.hasBookings || false}
                onChange={(e) => setFilters({ ...filters, hasBookings: e.target.checked })}
                className="w-4 h-4 rounded border-[var(--border-color)]/20 bg-[var(--card-secondary-bg)]
                           checked:bg-[var(--primary-color)] checked:border-[var(--primary-color)]
                           focus:ring-1 focus:ring-[var(--primary-color)]/50"
              />
              <label htmlFor="hasBookings" className="text-sm text-[var(--text-primary)]">
                Has at least one booking
              </label>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Format Selection */}
      <div>
        <label className="block text-xs text-[var(--text-secondary)] mb-2">Export Format</label>
        <div className="flex flex-wrap gap-3">
          {['csv', 'pdf', 'excel'].map((fmt) => (
            <label
              key={fmt}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all
                ${format === fmt 
                  ? 'bg-[var(--primary-color)]/10 border-[var(--primary-color)] text-[var(--primary-color)]' 
                  : 'bg-[var(--card-secondary-bg)] border-[var(--border-color)]/20 text-[var(--text-secondary)] hover:border-[var(--border-color)]/40'
                }`}
            >
              <input
                type="radio"
                name="format"
                value={fmt}
                checked={format === fmt}
                onChange={(e) => setFormat(e.target.value as any)}
                className="sr-only"
              />
              <FileText className="w-4 h-4" />
              <span className="text-sm uppercase">{fmt}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Date Range (for most reports) */}
      {(type === 'financial' || type === 'occupancy' || type === 'bookings' || type === 'guests' || type === 'rooms') && (
        <div>
          <label className="block text-xs text-[var(--text-secondary)] mb-2">Date Range</label>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="relative flex-1">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-10 pr-3 py-2 text-sm rounded-lg bg-[var(--card-secondary-bg)] border border-[var(--border-color)]/20
                           text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)]/50"
                required
              />
            </div>
            <span className="text-[var(--text-secondary)]">–</span>
            <div className="relative flex-1">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full pl-10 pr-3 py-2 text-sm rounded-lg bg-[var(--card-secondary-bg)] border border-[var(--border-color)]/20
                           text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)]/50"
                required
              />
            </div>
          </div>
        </div>
      )}

      {/* Additional Filters Toggle (for types with extra filters) */}
      {(type === 'bookings' || type === 'rooms' || type === 'guests') && (
        <div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <Filter className="w-4 h-4" />
            {showFilters ? 'Hide' : 'Show'} additional filters
          </button>
          {showFilters && (
            <div className="mt-3 p-3 bg-[var(--card-secondary-bg)]/50 rounded-lg">
              {renderFilters()}
            </div>
          )}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-3 bg-[var(--primary-color)] text-black font-medium rounded-lg
                   hover:bg-[var(--primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed
                   transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <span className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent"></span>
            Exporting...
          </>
        ) : (
          <>
            <FileText className="w-4 h-4" />
            Export {type.charAt(0).toUpperCase() + type.slice(1)}
          </>
        )}
      </button>
    </form>
  );
};

export default ExportForm;
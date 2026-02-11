import React, { useState, useEffect } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onDateChange: (startDate: string, endDate: string) => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onDateChange,
}) => {
  const [localStart, setLocalStart] = useState(startDate);
  const [localEnd, setLocalEnd] = useState(endDate);

  useEffect(() => {
    setLocalStart(startDate);
    setLocalEnd(endDate);
  }, [startDate, endDate]);

  const handleApply = () => {
    onDateChange(localStart, localEnd);
  };

  const handlePreset = (preset: 'today' | 'week' | 'month' | 'quarter' | 'year') => {
    const today = new Date();
    let start = new Date();
    let end = new Date();

    switch (preset) {
      case 'today':
        start = today;
        end = today;
        break;
      case 'week':
        start = new Date(today.setDate(today.getDate() - today.getDay())); // Sunday
        end = new Date(today.setDate(today.getDate() - today.getDay() + 6)); // Saturday
        break;
      case 'month':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case 'quarter':
        const quarter = Math.floor(today.getMonth() / 3);
        start = new Date(today.getFullYear(), quarter * 3, 1);
        end = new Date(today.getFullYear(), quarter * 3 + 3, 0);
        break;
      case 'year':
        start = new Date(today.getFullYear(), 0, 1);
        end = new Date(today.getFullYear(), 11, 31);
        break;
    }

    setLocalStart(start.toISOString().split('T')[0]);
    setLocalEnd(end.toISOString().split('T')[0]);
    onDateChange(start.toISOString().split('T')[0], end.toISOString().split('T')[0]);
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-[var(--card-bg)] border border-[var(--border-color)]/20 rounded-lg p-3">
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Calendar className="w-4 h-4 text-[var(--text-tertiary)]" />
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={localStart}
            onChange={(e) => setLocalStart(e.target.value)}
            className="px-3 py-1.5 text-sm rounded-lg bg-[var(--card-secondary-bg)] border border-[var(--border-color)]/20
                       text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)]/50"
          />
          <span className="text-[var(--text-secondary)]">–</span>
          <input
            type="date"
            value={localEnd}
            onChange={(e) => setLocalEnd(e.target.value)}
            className="px-3 py-1.5 text-sm rounded-lg bg-[var(--card-secondary-bg)] border border-[var(--border-color)]/20
                       text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)]/50"
          />
        </div>
      </div>

      <button
        onClick={handleApply}
        className="px-4 py-1.5 text-sm bg-[var(--primary-color)] text-black font-medium rounded-lg
                   hover:bg-[var(--primary-hover)] transition-colors"
      >
        Apply
      </button>

      <div className="flex flex-wrap items-center gap-2 ml-auto">
        <button
          onClick={() => handlePreset('today')}
          className="px-3 py-1.5 text-xs rounded-lg bg-[var(--card-secondary-bg)] text-[var(--text-secondary)]
                     hover:bg-[var(--card-hover-bg)] hover:text-[var(--text-primary)] transition-colors"
        >
          Today
        </button>
        <button
          onClick={() => handlePreset('week')}
          className="px-3 py-1.5 text-xs rounded-lg bg-[var(--card-secondary-bg)] text-[var(--text-secondary)]
                     hover:bg-[var(--card-hover-bg)] hover:text-[var(--text-primary)] transition-colors"
        >
          This Week
        </button>
        <button
          onClick={() => handlePreset('month')}
          className="px-3 py-1.5 text-xs rounded-lg bg-[var(--card-secondary-bg)] text-[var(--text-secondary)]
                     hover:bg-[var(--card-hover-bg)] hover:text-[var(--text-primary)] transition-colors"
        >
          This Month
        </button>
        <button
          onClick={() => handlePreset('quarter')}
          className="px-3 py-1.5 text-xs rounded-lg bg-[var(--card-secondary-bg)] text-[var(--text-secondary)]
                     hover:bg-[var(--card-hover-bg)] hover:text-[var(--text-primary)] transition-colors"
        >
          This Quarter
        </button>
        <button
          onClick={() => handlePreset('year')}
          className="px-3 py-1.5 text-xs rounded-lg bg-[var(--card-secondary-bg)] text-[var(--text-secondary)]
                     hover:bg-[var(--card-hover-bg)] hover:text-[var(--text-primary)] transition-colors"
        >
          This Year
        </button>
      </div>
    </div>
  );
};

export default DateRangePicker;
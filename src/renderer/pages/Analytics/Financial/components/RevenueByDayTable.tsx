import React, { useMemo, useState } from 'react';
import { type FinancialSummary } from '../../../../api/dashboard';
import { Search } from 'lucide-react';

interface RevenueByDayTableProps {
  financialSummary: FinancialSummary | null;
  loading?: boolean;
}

const RevenueByDayTable: React.FC<RevenueByDayTableProps> = ({ financialSummary, loading }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const data = useMemo(() => {
    if (!financialSummary?.revenueByDay) return [];
    return financialSummary.revenueByDay;
  }, [financialSummary]);

  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    return data.filter((item) =>
      item.day.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [data, searchQuery]);

  if (loading) {
    return (
      <div className="bg-[var(--card-bg)] border border-[var(--border-color)]/20 rounded-lg p-6">
        <div className="text-[var(--text-secondary)]">Loading daily revenue...</div>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="bg-[var(--card-bg)] border border-[var(--border-color)]/20 rounded-lg p-6">
        <div className="text-[var(--text-secondary)]">No daily revenue data available</div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border-color)]/20 rounded-lg">
      <div className="p-4 border-b border-[var(--border-color)]/20 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h3 className="text-md font-medium text-[var(--text-primary)] flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary-color)]"></span>
          Daily Revenue Breakdown
        </h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
          <input
            type="text"
            placeholder="Search day..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-48 pl-9 pr-3 py-1.5 text-sm rounded-lg
                       bg-[var(--card-secondary-bg)] border border-[var(--border-color)]/20
                       text-[var(--text-primary)] placeholder-[var(--text-tertiary)]
                       focus:outline-none focus:border-[var(--primary-color)]/50"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-black text-[var(--text-primary)] border-b border-[var(--border-color)]/20">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Day</th>
              <th className="px-4 py-3 text-left font-medium">Bookings</th>
              <th className="px-4 py-3 text-left font-medium">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-[var(--text-tertiary)]">
                  No matching days found.
                </td>
              </tr>
            ) : (
              filteredData.map((item, idx) => (
                <tr
                  key={idx}
                  className="border-b border-[var(--border-color)]/10 hover:bg-[var(--card-hover-bg)]/20 transition-colors"
                >
                  <td className="px-4 py-3 text-[var(--text-primary)]">{item.day}</td>
                  <td className="px-4 py-3 text-[var(--text-primary)]">{item.bookings}</td>
                  <td className="px-4 py-3 text-[var(--text-primary)] font-medium">
                    ₱{item.revenue.toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RevenueByDayTable;
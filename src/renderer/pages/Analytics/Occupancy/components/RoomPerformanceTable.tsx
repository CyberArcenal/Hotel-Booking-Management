import React, { useMemo, useState } from 'react';
import { type RoomPerformanceItem } from '../../../../api/dashboard';
import { Search, ChevronDown } from 'lucide-react';
import { formatCurrency, formatPercentage } from '../../../../utils/formatters';

interface RoomPerformanceTableProps {
  data: RoomPerformanceItem[];
  loading?: boolean;
}

const RoomPerformanceTable: React.FC<RoomPerformanceTableProps> = ({ data, loading }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Get unique room types for filter dropdown
  const roomTypes = useMemo(() => {
    const types = data.map((room) => room.type);
    return ['all', ...Array.from(new Set(types))];
  }, [data]);

  // Filter data based on search and type
  const filteredData = useMemo(() => {
    return data.filter((room) => {
      const matchesSearch =
        room.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.type.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === 'all' || room.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [data, searchQuery, typeFilter]);

  if (loading) {
    return (
      <div className="bg-[var(--card-bg)] border border-[var(--border-color)]/20 rounded-lg p-6">
        <div className="text-[var(--text-secondary)]">Loading room performance...</div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border-color)]/20 rounded-lg">
      <div className="p-4 border-b border-[var(--border-color)]/20 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h3 className="text-md font-medium text-[var(--text-primary)] flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary-color)]"></span>
          Room Performance
        </h3>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
            <input
              type="text"
              placeholder="Search room..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-48 pl-9 pr-3 py-1.5 text-sm rounded-lg
                         bg-[var(--card-secondary-bg)] border border-[var(--border-color)]/20
                         text-[var(--text-primary)] placeholder-[var(--text-tertiary)]
                         focus:outline-none focus:border-[var(--primary-color)]/50"
            />
          </div>
          {/* Room type filter */}
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="appearance-none w-full sm:w-36 px-3 py-1.5 pr-8 text-sm rounded-lg
                         bg-[var(--card-secondary-bg)] border border-[var(--border-color)]/20
                         text-[var(--text-primary)]
                         focus:outline-none focus:border-[var(--primary-color)]/50"
            >
              {roomTypes.map((type) => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Types' : type}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)] pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-black text-[var(--text-primary)] border-b border-[var(--border-color)]/20">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Room</th>
              <th className="px-4 py-3 text-left font-medium">Type</th>
              <th className="px-4 py-3 text-left font-medium">Price/Night</th>
              <th className="px-4 py-3 text-left font-medium">Bookings</th>
              <th className="px-4 py-3 text-left font-medium">Revenue</th>
              <th className="px-4 py-3 text-left font-medium">Occupancy</th>
              <th className="px-4 py-3 text-left font-medium">Avg. Rate</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-[var(--text-tertiary)]">
                  No rooms found.
                </td>
              </tr>
            ) : (
              filteredData.map((room) => (
                <tr
                  key={room.roomId}
                  className="border-b border-[var(--border-color)]/10 hover:bg-[var(--card-hover-bg)]/20 transition-colors"
                >
                  <td className="px-4 py-3 text-[var(--text-primary)] font-medium">
                    {room.roomNumber}
                  </td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{room.type}</td>
                  <td className="px-4 py-3 text-[var(--text-primary)]">
                    {formatCurrency(room.pricePerNight)}
                  </td>
                  <td className="px-4 py-3 text-[var(--text-primary)]">{room.totalBookings}</td>
                  <td className="px-4 py-3 text-[var(--text-primary)]">
                    {formatCurrency(room.totalRevenue)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full
                      ${room.occupancyRate > 70 ? 'bg-green-500/20 text-green-500' : 
                        room.occupancyRate > 40 ? 'bg-yellow-500/20 text-yellow-500' : 
                        'bg-red-500/20 text-red-500'}`}>
                      {formatPercentage(room.occupancyRate)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--text-primary)]">
                    {formatCurrency(room.averageRate)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full
                      ${room.isAvailable 
                        ? 'bg-green-500/20 text-green-500 border border-green-500/30' 
                        : 'bg-red-500/20 text-red-500 border border-red-500/30'}`}>
                      {room.isAvailable ? 'Available' : 'Maintenance'}
                    </span>
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

export default RoomPerformanceTable;
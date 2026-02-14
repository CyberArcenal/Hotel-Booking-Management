import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, RefreshCw } from 'lucide-react';
import { useOccupancy } from './hooks/useOccupancy';
import OccupancyStats from './components/OccupancyStats';
import OccupancyTrendChart from './components/OccupancyTrendChart';
import OccupancyByRoomType from './components/OccupancyByRoomType';
import RoomPerformanceTable from './components/RoomPerformanceTable';

const OccupancyPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    occupancyData,
    roomPerformance,
    overview,
    today,
    loading,
    error,
    averageOccupancy,
    totalRooms,
    occupiedRooms,
    availableRooms,
    setParams,
    refetch,
  } = useOccupancy({ days: 30 });

  const [days, setDays] = useState(30);

  const handleDaysChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(e.target.value);
    setDays(value);
    setParams({ days: value });
  };

  return (
    <div className="min-h-screen bg-[var(--background-color)]">
      <main className="mx-auto px-2 py-2">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Occupancy Analytics</h2>
            <p className="text-[var(--text-secondary)] mt-1">
              Real‑time occupancy and room performance metrics
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Date range selector */}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[var(--text-tertiary)]" />
              <select
                value={days}
                onChange={handleDaysChange}
                className="px-3 py-2 rounded-lg bg-[var(--card-secondary-bg)] border border-[var(--border-color)]/20
                           text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--primary-color)]/50"
              >
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={60}>Last 60 days</option>
                <option value={90}>Last 90 days</option>
              </select>
            </div>
            <button
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg
                         bg-[var(--card-secondary-bg)] hover:bg-[var(--card-hover-bg)]
                         text-[var(--text-primary)] border border-[var(--border-color)]/20
                         hover:border-[var(--border-color)]/40 transition-all duration-200"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6 text-red-400">
            {error}
            <button onClick={refetch} className="ml-3 underline">
              Retry
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <OccupancyStats
          totalRooms={totalRooms}
          occupiedRooms={occupiedRooms}
          availableRooms={availableRooms}
          occupancyRate={today?.occupancyRate ?? 0}
          averageOccupancy={averageOccupancy}
          loading={loading}
        />

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <OccupancyTrendChart data={occupancyData} loading={loading} />
          </div>
          <div className="lg:col-span-1">
            <OccupancyByRoomType roomPerformance={roomPerformance} loading={loading} />
          </div>
        </div>

        {/* Room Performance Table */}
        <RoomPerformanceTable data={roomPerformance} loading={loading} />
      </main>
    </div>
  );
};

export default OccupancyPage;
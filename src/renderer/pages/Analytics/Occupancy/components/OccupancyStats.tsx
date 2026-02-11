import React from 'react';
import { 
  Home, 
  Users, 
  DoorOpen, 
  TrendingUp,
  CalendarDays
} from 'lucide-react';

interface OccupancyStatsProps {
  totalRooms: number;
  occupiedRooms: number;
  availableRooms: number;
  occupancyRate: number;
  averageOccupancy: number;
  loading?: boolean;
}

const OccupancyStats: React.FC<OccupancyStatsProps> = ({
  totalRooms,
  occupiedRooms,
  availableRooms,
  occupancyRate,
  averageOccupancy,
  loading,
}) => {
  const statCards = [
    {
      label: 'Today\'s Occupancy',
      value: `${occupancyRate.toFixed(1)}%`,
      sublabel: `${occupiedRooms} / ${totalRooms} rooms`,
      icon: Home,
      color: 'text-[var(--primary-color)]',
    },
    {
      label: 'Avg. Occupancy (30d)',
      value: `${averageOccupancy.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'text-[var(--primary-color)]',
    },
    {
      label: 'Occupied Rooms',
      value: occupiedRooms,
      sublabel: 'Currently in-house',
      icon: Users,
      color: 'text-[var(--primary-color)]',
    },
    {
      label: 'Available Rooms',
      value: availableRooms,
      sublabel: 'Ready for booking',
      icon: DoorOpen,
      color: 'text-[var(--primary-color)]',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statCards.map((stat, idx) => (
        <div
          key={idx}
          className="bg-[var(--card-bg)] border border-[var(--border-color)]/20 rounded-lg p-4 flex items-center gap-4
                     hover:border-[var(--border-color)]/40 transition-all duration-200"
        >
          <div className={`p-3 rounded-full bg-[var(--card-secondary-bg)] ${stat.color}`}>
            <stat.icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm text-[var(--text-secondary)]">{stat.label}</p>
            <p className="text-xl font-semibold text-[var(--text-primary)]">
              {loading ? '—' : stat.value}
            </p>
            {stat.sublabel && (
              <p className="text-xs text-[var(--text-tertiary)] mt-1">{stat.sublabel}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default OccupancyStats;
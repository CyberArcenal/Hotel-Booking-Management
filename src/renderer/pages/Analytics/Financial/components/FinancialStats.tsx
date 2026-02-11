import React from 'react';
import { 
  DollarSign, 
  CalendarCheck, 
  TrendingUp, 
  Users, 
  XCircle 
} from 'lucide-react';

interface FinancialStatsProps {
  totalRevenue: number;
  totalBookings: number;
  averageBookingValue: number;
  uniqueGuests: number;
  cancellationRate: number;
  loading?: boolean;
}

const FinancialStats: React.FC<FinancialStatsProps> = ({
  totalRevenue,
  totalBookings,
  averageBookingValue,
  uniqueGuests,
  cancellationRate,
  loading,
}) => {
  const formatCurrency = (value: number) => {
    return `₱${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const statCards = [
    {
      label: 'Total Revenue',
      value: formatCurrency(totalRevenue),
      icon: DollarSign,
      color: 'text-[var(--primary-color)]',
    },
    {
      label: 'Total Bookings',
      value: totalBookings.toLocaleString(),
      icon: CalendarCheck,
      color: 'text-[var(--primary-color)]',
    },
    {
      label: 'Avg. Booking Value',
      value: formatCurrency(averageBookingValue),
      icon: TrendingUp,
      color: 'text-[var(--primary-color)]',
    },
    {
      label: 'Unique Guests',
      value: uniqueGuests.toLocaleString(),
      icon: Users,
      color: 'text-[var(--primary-color)]',
    },
    {
      label: 'Cancellation Rate',
      value: `${cancellationRate.toFixed(1)}%`,
      icon: XCircle,
      color: 'text-[var(--primary-color)]',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
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
          </div>
        </div>
      ))}
    </div>
  );
};

export default FinancialStats;
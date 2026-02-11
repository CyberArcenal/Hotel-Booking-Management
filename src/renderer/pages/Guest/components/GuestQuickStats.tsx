import React, { useEffect, useState } from 'react';
import guestAPI from '../../../api/guest';
import { Users, UserCheck, UserPlus, Award } from 'lucide-react';

interface Stats {
  totalGuests: number;
  activeGuests: number;
  newThisMonth: number;
  loyaltyGuests: number;
}

const GuestQuickStats: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    totalGuests: 0,
    activeGuests: 0,
    newThisMonth: 0,
    loyaltyGuests: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get summary (total, active, new this month)
        const summaryRes = await guestAPI.getSummary();
        // Get loyalty guests (minBookings = 3)
        const loyaltyRes = await guestAPI.getLoyaltyGuests(3, 0);
        
        setStats({
          totalGuests: summaryRes.data?.totalGuests || 0,
          activeGuests: summaryRes.data?.activeGuests || 0,
          newThisMonth: summaryRes.data?.newThisMonth || 0,
          loyaltyGuests: loyaltyRes.data?.length || 0,
        });
      } catch (error) {
        console.error('Failed to load guest stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    {
      label: 'Total Guests',
      value: stats.totalGuests,
      icon: Users,
      color: 'text-[var(--primary-color)]',
    },
    {
      label: 'Active Guests',
      value: stats.activeGuests,
      icon: UserCheck,
      color: 'text-[var(--primary-color)]',
    },
    {
      label: 'New This Month',
      value: stats.newThisMonth,
      icon: UserPlus,
      color: 'text-[var(--primary-color)]',
    },
    {
      label: 'Loyalty Guests',
      value: stats.loyaltyGuests,
      icon: Award,
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
          </div>
        </div>
      ))}
    </div>
  );
};

export default GuestQuickStats;
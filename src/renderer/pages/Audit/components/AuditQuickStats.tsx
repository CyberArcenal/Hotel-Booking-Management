// src/pages/Audit/components/AuditQuickStats.tsx
import React, { useEffect, useState } from 'react';
import auditAPI from '../../../api/audit';
import { BarChart3, Calendar, Users, Activity } from 'lucide-react';

interface Stats {
  total: number;
  avgPerDay: number;
  mostActiveDay: { day: string; count: number } | null;
  uniqueUsers: number;
  dateRange?: { start: string; end: string } | null;
}

const AuditQuickStats: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    total: 0,
    avgPerDay: 0,
    mostActiveDay: null,
    uniqueUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await auditAPI.getStats();
        if (response.status) {
          setStats({
            total: response.data.total,
            avgPerDay: Number(response.data.avgPerDay) || 0,
            mostActiveDay: response.data.mostActiveDay
              ? {
                  day: response.data.mostActiveDay.day,
                  count: Number(response.data.mostActiveDay.count),
                }
              : null,
            uniqueUsers: response.data.uniqueUsers,
            dateRange: response.data.dateRange || null,
          });
        }
      } catch (error) {
        console.error('Failed to load audit stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    {
      label: 'Total Entries',
      value: stats.total,
      icon: BarChart3,
      color: 'text-[var(--primary-color)]',
    },
    {
      label: 'Avg. Per Day',
      value: stats.avgPerDay.toFixed(1),
      icon: Activity,
      color: 'text-[var(--primary-color)]',
    },
    {
      label: 'Most Active Day',
      value: stats.mostActiveDay
        ? `${new Date(stats.mostActiveDay.day).toLocaleDateString()} (${stats.mostActiveDay.count})`
        : '—',
      icon: Calendar,
      color: 'text-[var(--primary-color)]',
    },
    {
      label: 'Unique Users',
      value: stats.uniqueUsers,
      icon: Users,
      color: 'text-[var(--primary-color)]',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
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

export default AuditQuickStats;
// src/renderer/pages/Dashboard/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import {
  DollarSign,
  CalendarCheck,
  TrendingUp,
  BedDouble,
  Users,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import dashboardAPI, { type DashboardData } from '../../api/dashboard';
import { StatCard } from './components/StatCard';
import { QuickActions } from './components/QuickActions';
import { TodaySnapshot } from './components/TodaySnapshot';
import { RevenueChart } from './components/RevenueChart';
import { RoomTypeChart } from './components/RoomTypeChart';
import { BookingStatusList } from './components/BookingStatusList';
import { UpcomingBookingItem } from './components/UpcomingBookingItem';
import { GuestLoyaltyCard } from './components/GuestLoyaltyCard';


const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const response = await dashboardAPI.getDashboardData();
        if (response.status) {
          setData(response.data);
          setError(null);
        } else {
          setError('Failed to load dashboard data');
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
    const interval = setInterval(fetchDashboard, 300000);
    return () => clearInterval(interval);
  }, []);

  // Loading skeleton
  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse shimmer">
          <div className="h-8 w-48 rounded bg-gray-700 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 rounded-xl bg-gray-800" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-6">
            <div className="lg:col-span-2 h-96 rounded-xl bg-gray-800" />
            <div className="h-96 rounded-xl bg-gray-800" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <div
          className="windows-card p-8 text-center max-w-md"
          style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}
        >
          <p className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>⚠️ Dashboard Unavailable</p>
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>{error || 'No data received'}</p>
          <button
            onClick={() => window.location.reload()}
            className="windows-btn windows-btn-primary px-5 py-2"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { overview, today, bookingStatus, revenueTrend, upcomingBookings, roomTypes, guestLoyalty } = data;

  // Flatten upcoming bookings
  const upcomingList = upcomingBookings
    ?.flatMap(group => group.bookings?.map(b => ({ ...b, arrivalDate: group.date })) || [])
    .slice(0, 5);

  return (
    <div className="p-6 space-y-6 windows-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-3xl font-bold windows-title"
            style={{ color: 'var(--text-primary)', letterSpacing: '-0.025em' }}
          >
            Dashboard
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Welcome back! Here's what's happening at your hotel today.
          </p>
        </div>
        <div
          className="flex items-center gap-3 px-4 py-2 rounded-lg"
          style={{
            background: 'rgba(212,175,55,0.1)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-secondary)',
          }}
        >
          <Clock className="w-4 h-4" style={{ color: 'var(--primary-color)' }} />
          <span className="text-sm font-medium">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Total Revenue" value={overview.totalRevenue} icon={DollarSign} prefix="$" trend={12} color="gold" />
        <StatCard title="Bookings" value={overview.totalBookings} icon={CalendarCheck} trend={5} color="blue" />
        <StatCard title="Occupancy" value={overview.occupancyRate} icon={TrendingUp} suffix="%" trend={-2} color="green" />
        <StatCard title="Avg. Daily Rate" value={overview.averageDailyRate} icon={BedDouble} prefix="$" color="purple" />
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column (2/3) */}
        <div className="lg:col-span-2 space-y-5">
          <TodaySnapshot data={today} />

          <div className="windows-card p-5" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-md font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <TrendingUp className="w-5 h-5" style={{ color: 'var(--primary-color)' }} />
                Revenue Trend
              </h2>
              <span className="text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(212,175,55,0.1)', color: 'var(--primary-color)' }}>
                Last 6 periods
              </span>
            </div>
            <RevenueChart data={revenueTrend} />
          </div>

          {roomTypes && roomTypes.length > 0 && (
            <div className="windows-card p-5" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
              <h2 className="text-md font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <TrendingUp className="w-5 h-5" style={{ color: 'var(--primary-color)' }} />
                Room Type Distribution
              </h2>
              <RoomTypeChart data={roomTypes} />
            </div>
          )}
        </div>

        {/* Right Column (1/3) */}
        <div className="space-y-5">
          <div className="windows-card p-5" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
            <h2 className="text-md font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <CalendarCheck className="w-5 h-5" style={{ color: 'var(--primary-color)' }} />
              Booking Status
            </h2>
            <BookingStatusList data={bookingStatus} />
          </div>

          {guestLoyalty && <GuestLoyaltyCard data={guestLoyalty} />}

          <div className="windows-card p-5" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
            <h2 className="text-md font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Users className="w-5 h-5" style={{ color: 'var(--primary-color)' }} />
              Upcoming Arrivals
            </h2>
            <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1 custom-scroll">
              {upcomingList && upcomingList.length > 0 ? (
                upcomingList.map((booking, idx) => (
                  <UpcomingBookingItem key={idx} booking={booking} />
                ))
              ) : (
                <p className="text-sm text-center py-8" style={{ color: 'var(--text-tertiary)' }}>
                  No upcoming bookings
                </p>
              )}
            </div>
            <button
              className="windows-btn windows-btn-secondary w-full mt-4 py-2.5 text-sm font-medium flex items-center justify-center gap-2"
              onClick={() => (window.location.href = '/bookings')}
            >
              View All Bookings
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
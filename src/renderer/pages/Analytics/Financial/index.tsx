import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Download, TrendingUp } from 'lucide-react';
import { useFinancial } from './hooks/useFinancial';
import DateRangePicker from './components/DateRangePicker';
import FinancialStats from './components/FinancialStats';
import RevenueTrendChart from './components/RevenueTrendChart';
import RevenueByRoomTypeChart from './components/RevenueByRoomTypeChart';
import RevenueByDayTable from './components/RevenueByDayTable';
import dashboardAPI from '../../../api/dashboard';

const FinancialPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    financialSummary,
    revenueTrend,
    overview,
    loading,
    error,
    params,
    setDateRange,
    setTrendParams,
    refetch,
    totalRevenue,
    totalBookings,
    averageBookingValue,
    uniqueGuests,
    cancellationRate,
  } = useFinancial();

  const [trendPeriod, setTrendPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [trendCount, setTrendCount] = useState(6);

  const handleTrendPeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const period = e.target.value as 'day' | 'week' | 'month' | 'year';
    setTrendPeriod(period);
    setTrendParams(period, trendCount);
  };

  const handleTrendCountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const count = parseInt(e.target.value);
    setTrendCount(count);
    setTrendParams(trendPeriod, count);
  };

  const handleExportReport = async () => {
    try {
      const response = await dashboardAPI.generateReport({
        reportType: 'financial_summary',
        parameters: {
          startDate: params.startDate,
          endDate: params.endDate,
        },
        format: 'csv',
        user: 'admin',
      });
      if (response.status && response.data?.data) {
        // Simulate file download
        const blob = new Blob([response.data.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = response.data.filename || `financial_report_${params.startDate}_${params.endDate}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        alert('Export failed');
      }
    } catch (err) {
      console.error(err);
      alert('Export failed');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background-color)]">
      <main className="container mx-auto px-4 py-6 md:px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Financial Analytics</h2>
            <p className="text-[var(--text-secondary)] mt-1">
              Revenue, bookings, and financial performance metrics
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportReport}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg
                         bg-[var(--card-secondary-bg)] hover:bg-[var(--card-hover-bg)]
                         text-[var(--text-primary)] border border-[var(--border-color)]/20
                         hover:border-[var(--border-color)]/40 transition-all duration-200"
            >
              <Download className="w-4 h-4" />
              Export Report
            </button>
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

        {/* Date Range Picker */}
        <div className="mb-6">
          <DateRangePicker
            startDate={params.startDate || ''}
            endDate={params.endDate || ''}
            onDateChange={setDateRange}
          />
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
        <FinancialStats
          totalRevenue={totalRevenue}
          totalBookings={totalBookings}
          averageBookingValue={averageBookingValue}
          uniqueGuests={uniqueGuests}
          cancellationRate={cancellationRate}
          loading={loading}
        />

        {/* Revenue Trend Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[var(--text-tertiary)]" />
            <span className="text-sm text-[var(--text-secondary)]">Revenue Trend:</span>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={trendPeriod}
              onChange={handleTrendPeriodChange}
              className="px-3 py-1.5 text-sm rounded-lg bg-[var(--card-secondary-bg)] border border-[var(--border-color)]/20
                         text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)]/50"
            >
              <option value="day">Daily</option>
              <option value="week">Weekly</option>
              <option value="month">Monthly</option>
              <option value="year">Yearly</option>
            </select>
            <select
              value={trendCount}
              onChange={handleTrendCountChange}
              className="px-3 py-1.5 text-sm rounded-lg bg-[var(--card-secondary-bg)] border border-[var(--border-color)]/20
                         text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)]/50"
            >
              <option value={3}>Last 3</option>
              <option value={6}>Last 6</option>
              <option value={12}>Last 12</option>
              <option value={24}>Last 24</option>
            </select>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <RevenueTrendChart
              data={revenueTrend}
              period={trendPeriod}
              loading={loading}
            />
          </div>
          <div className="lg:col-span-1">
            <RevenueByRoomTypeChart
              financialSummary={financialSummary}
              loading={loading}
            />
          </div>
        </div>

        {/* Daily Revenue Table */}
        <RevenueByDayTable
          financialSummary={financialSummary}
          loading={loading}
        />
      </main>
    </div>
  );
};

export default FinancialPage;
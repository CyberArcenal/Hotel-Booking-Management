import { useState, useEffect, useCallback } from 'react';
import dashboardAPI, {
  type FinancialSummary,
  type RevenueTrendItem,
  type DashboardOverview,
  type SeasonalTrends,
} from '../../../../api/dashboard';

interface UseFinancialParams {
  startDate?: string;
  endDate?: string;
  trendPeriod?: 'day' | 'week' | 'month' | 'year';
  trendCount?: number;
}

interface UseFinancialReturn {
  financialSummary: FinancialSummary | null;
  revenueTrend: RevenueTrendItem[];
  overview: DashboardOverview | null;
  seasonalTrends: SeasonalTrends | null;
  loading: boolean;
  error: string | null;
  params: UseFinancialParams;
  setDateRange: (startDate: string, endDate: string) => void;
  setTrendParams: (period: UseFinancialParams['trendPeriod'], count: number) => void;
  refetch: () => Promise<void>;
  // Derived metrics
  totalRevenue: number;
  totalBookings: number;
  averageBookingValue: number;
  uniqueGuests: number;
  cancellationRate: number;
}

export const useFinancial = (initialParams?: UseFinancialParams): UseFinancialReturn => {
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const [params, setParams] = useState<UseFinancialParams>({
    startDate: firstDayOfMonth.toISOString().split('T')[0],
    endDate: lastDayOfMonth.toISOString().split('T')[0],
    trendPeriod: 'month',
    trendCount: 6,
    ...initialParams,
  });

  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);
  const [revenueTrend, setRevenueTrend] = useState<RevenueTrendItem[]>([]);
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [seasonalTrends, setSeasonalTrends] = useState<SeasonalTrends | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFinancialData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Financial summary for selected date range
      if (params.startDate && params.endDate) {
        const summaryRes = await dashboardAPI.getFinancialSummary({
          startDate: params.startDate,
          endDate: params.endDate,
        });
        if (summaryRes.status) {
          setFinancialSummary(summaryRes.data);
        } else {
          throw new Error(summaryRes.message || 'Failed to fetch financial summary');
        }
      }

      // 2. Revenue trend (default last 6 months)
      const trendRes = await dashboardAPI.getRevenueTrend({
        period: params.trendPeriod || 'month',
        count: params.trendCount || 6,
      });
      if (trendRes.status) {
        setRevenueTrend(trendRes.data);
      }

      // 3. Dashboard overview (for totalRevenue, totalBookings, etc.)
      const dashboardRes = await dashboardAPI.getDashboardData();
      if (dashboardRes.status) {
        setOverview(dashboardRes.data.overview);
      }

      // 4. Seasonal trends (optional, for additional insights)
      const seasonalRes = await dashboardAPI.getSeasonalTrends({ years: 2 });
      if (seasonalRes.status) {
        setSeasonalTrends(seasonalRes.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load financial data');
    } finally {
      setLoading(false);
    }
  }, [params.startDate, params.endDate, params.trendPeriod, params.trendCount]);

  useEffect(() => {
    fetchFinancialData();
  }, [fetchFinancialData]);

  const setDateRange = (startDate: string, endDate: string) => {
    setParams((prev) => ({ ...prev, startDate, endDate }));
  };

  const setTrendParams = (period: UseFinancialParams['trendPeriod'], count: number) => {
    setParams((prev) => ({ ...prev, trendPeriod: period, trendCount: count }));
  };

  const refetch = fetchFinancialData;

  // Derived metrics from financial summary
  const totalRevenue = financialSummary?.summary?.totalRevenue ?? overview?.totalRevenue ?? 0;
  const totalBookings = financialSummary?.summary?.totalBookings ?? overview?.totalBookings ?? 0;
  const averageBookingValue = financialSummary?.summary?.averageBookingValue ?? overview?.averageDailyRate ?? 0;
  const uniqueGuests = financialSummary?.summary?.uniqueGuests ?? 0;
  const cancellationRate = financialSummary?.summary?.cancellationRate ?? 0;

  return {
    financialSummary,
    revenueTrend,
    overview,
    seasonalTrends,
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
  };
};
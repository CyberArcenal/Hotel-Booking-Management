import { useState, useEffect, useCallback } from 'react';
import dashboardAPI, { 
  type OccupancyItem, 
  type RoomPerformanceItem,
  type DashboardOverview,
  type DashboardToday
} from '../../../../api/dashboard';

interface UseOccupancyParams {
  days?: number;
  startDate?: string;
  endDate?: string;
}

interface UseOccupancyReturn {
  occupancyData: OccupancyItem[];
  roomPerformance: RoomPerformanceItem[];
  overview: DashboardOverview | null;
  today: DashboardToday | null;
  loading: boolean;
  error: string | null;
  params: UseOccupancyParams;
  setParams: (params: Partial<UseOccupancyParams>) => void;
  refetch: () => Promise<void>;
  averageOccupancy: number;
  totalRooms: number;
  occupiedRooms: number;
  availableRooms: number;
}

export const useOccupancy = (initialParams?: UseOccupancyParams): UseOccupancyReturn => {
  const [params, setParamsState] = useState<UseOccupancyParams>({
    days: 30,
    ...initialParams,
  });

  const [occupancyData, setOccupancyData] = useState<OccupancyItem[]>([]);
  const [roomPerformance, setRoomPerformance] = useState<RoomPerformanceItem[]>([]);
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [today, setToday] = useState<DashboardToday | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOccupancyData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Occupancy report (daily occupancy for last N days)
      const occupancyRes = await dashboardAPI.getOccupancyReport({
        period: 'day',
        days: params.days || 30,
      });
      if (occupancyRes.status) {
        setOccupancyData(occupancyRes.data);
      } else {
        throw new Error(occupancyRes.message || 'Failed to fetch occupancy report');
      }

      // 2. Room performance metrics
      const roomPerfRes = await dashboardAPI.getRoomPerformance();
      if (roomPerfRes.status) {
        setRoomPerformance(roomPerfRes.data);
      } else {
        throw new Error(roomPerfRes.message || 'Failed to fetch room performance');
      }

      // 3. Dashboard overview & today (for summary stats)
      const dashboardRes = await dashboardAPI.getDashboardData();
      if (dashboardRes.status) {
        setOverview(dashboardRes.data.overview);
        setToday(dashboardRes.data.today);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load occupancy data');
    } finally {
      setLoading(false);
    }
  }, [params.days]);

  useEffect(() => {
    fetchOccupancyData();
  }, [fetchOccupancyData]);

  const setParams = (newParams: Partial<UseOccupancyParams>) => {
    setParamsState((prev) => ({ ...prev, ...newParams }));
  };

  const refetch = fetchOccupancyData;

  // Derived stats
  const averageOccupancy = occupancyData.length
    ? occupancyData.reduce((sum, item) => sum + item.occupancyRate, 0) / occupancyData.length
    : 0;

  const totalRooms = overview?.totalRooms || today?.availableRooms || 0;
  const occupiedRooms = today?.inHouse || 0;
  const availableRooms = today?.availableRooms || 0;

  return {
    occupancyData,
    roomPerformance,
    overview,
    today,
    loading,
    error,
    params,
    setParams,
    refetch,
    averageOccupancy,
    totalRooms,
    occupiedRooms,
    availableRooms,
  };
};
// src/renderer/api/dashboard.ts
// Dashboard API client – mirrors backend IPC methods with full type safety

// ----------------------------------------------------------------------
// 📦 Types & Interfaces (mirror backend service response shapes)
// ----------------------------------------------------------------------

// ----- Dashboard Overview -------------------------------------------------
export interface DashboardOverview {
  totalRevenue: number;
  totalBookings: number;
  totalRooms: number;
  totalGuests: number;
  occupancyRate: number;
  averageDailyRate: number;
}

export interface DashboardToday {
  arrivals: number;
  departures: number;
  inHouse: number;
  availableRooms: number;
  occupancyRate: number;
}

export interface BookingStatusCounts {
  confirmed: number;
  checked_in: number;
  checked_out: number;
  cancelled: number;
  no_show?: number;
}

export interface RevenueTrendItem {
  period: string;
  bookings: number;
  revenue: number;
  averageValue: number;
  growth: number;
}

export interface UpcomingBookingGroup {
  date: string;
  bookings: Array<any>;   // full booking objects, omit if not needed in summary
  count: number;
  totalRevenue: number;
}

export interface RoomTypeDistribution {
  type: string;
  count: number;
  percentage: number;
}

export interface GuestLoyalty {
  repeatGuests: number;
  newGuestsThisMonth: number;
  repeatRate: number;
}

export interface DashboardData {
  overview: DashboardOverview;
  today: DashboardToday;
  bookingStatus: BookingStatusCounts;
  revenueTrend: RevenueTrendItem[];
  upcomingBookings: UpcomingBookingGroup[];
  roomTypes: RoomTypeDistribution[];
  guestLoyalty: GuestLoyalty;
}

// ----- Booking Statistics ------------------------------------------------
export interface BookingStatistics {
  total: number;
  statusCounts: BookingStatusCounts;
  revenue: {
    total: number;
    average: number;
    byPeriod?: any;
  };
  // may include more fields from bookingService.getStatistics()
  [key: string]: any;
}

// ----- Occupancy Report --------------------------------------------------
export interface OccupancyItem {
  date: string;
  occupiedRooms: number;
  totalRooms: number;
  occupancyRate: number;
}

// ----- Room Performance --------------------------------------------------
export interface RoomPerformanceItem {
  roomId: number;
  roomNumber: string;
  type: string;
  pricePerNight: number;
  totalBookings: number;
  totalRevenue: number;
  averageRate: number;
  occupancyRate: number;
  isAvailable: boolean;
  lastBooking: string | null;
}

// ----- Guest Segmentation ------------------------------------------------
export interface GuestSegmentation {
  frequency: {
    firstTime: number;
    occasional: number;
    frequent: number;
    vip: number;
  };
  spending: {
    low: number;
    medium: number;
    high: number;
    premium: number;
  };
  recency: {
    active: number;
    recent: number;
    occasional: number;
    inactive: number;
  };
  topNationalities: Array<{ nationality: string; count: number }>;
  totalGuests: number;
}

// ----- Financial Summary -------------------------------------------------
export interface FinancialSummaryPeriod {
  startDate: string;
  endDate: string;
}

export interface FinancialSummaryTotals {
  totalBookings: number;
  totalRevenue: number;
  averageBookingValue: number;
  uniqueGuests: number;
  cancellationRate: number;
}

export interface RevenueByRoomTypeItem {
  roomType: string;
  bookings: number;
  revenue: number;
  averageRate: number;
}

export interface RevenueByDayItem {
  day: string;
  bookings: number;
  revenue: number;
}

export interface FinancialSummary {
  period: FinancialSummaryPeriod;
  summary: FinancialSummaryTotals;
  revenueByRoomType: RevenueByRoomTypeItem[];
  revenueByDay: RevenueByDayItem[];
}

// ----- Seasonal Trends ---------------------------------------------------
export interface MonthData {
  bookings: number;
  revenue: number;
  averageRate: number;
}

export interface YearData {
  year: number;
  months: Record<string, MonthData>; // e.g. { "Jan": {...}, "Feb": {...} }
}

export interface SeasonalTrends {
  trendsByYear: Record<string, YearData>;
  growthData: Record<string, Record<string, number>>; // year -> month -> growth %
  peakMonths: string[]; // top 3 months
  averageMonthlyRevenue: Record<string, number>; // month name -> average
}

// ----- Generated Report --------------------------------------------------
export interface GeneratedReport {
  success: boolean;
  data: any;            // raw report data (depends on type)
  format: string;
  filename: string;
  generatedAt: string;
}

// ----------------------------------------------------------------------
// 📨 Response Interfaces (IPC standard wrapper)
// ----------------------------------------------------------------------

export interface DashboardResponse<T = any> {
  status: boolean;
  message: string;
  data: T;
}

// Specialised response types
export interface DashboardDataResponse extends DashboardResponse<DashboardData> {}
export interface BookingStatisticsResponse extends DashboardResponse<BookingStatistics> {}
export interface RevenueTrendResponse extends DashboardResponse<RevenueTrendItem[]> {}
export interface OccupancyReportResponse extends DashboardResponse<OccupancyItem[]> {}
export interface RoomPerformanceResponse extends DashboardResponse<RoomPerformanceItem[]> {}
export interface GuestSegmentationResponse extends DashboardResponse<GuestSegmentation> {}
export interface UpcomingBookingsResponse extends DashboardResponse<UpcomingBookingGroup[]> {}
export interface FinancialSummaryResponse extends DashboardResponse<FinancialSummary> {}
export interface SeasonalTrendsResponse extends DashboardResponse<SeasonalTrends> {}
export interface GenerateReportResponse extends DashboardResponse<GeneratedReport> {}

// ----------------------------------------------------------------------
// 🧠 DashboardAPI Class – exactly mirrors audit.ts structure
// ----------------------------------------------------------------------

class DashboardAPI {
  // --------------------------------------------------------------------
  // 📊 DASHBOARD & OVERVIEW
  // --------------------------------------------------------------------

  /**
   * Get complete dashboard data (overview, today, trends, etc.)
   */
  async getDashboardData(): Promise<DashboardDataResponse> {
    try {
      if (!window.backendAPI?.dashboard) {
        throw new Error("Electron API (dashboard) not available");
      }

      const response = await window.backendAPI.dashboard({
        method: "getDashboardData",
        params: {},
      });

      if (response.status) {
        return response;
      }
      throw new Error(response.message || "Failed to fetch dashboard data");
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch dashboard data");
    }
  }

  /**
   * Get booking statistics (counts, revenue, status breakdown)
   * @param params.period - 'day', 'week', 'month', 'year' (optional)
   */
  async getBookingStatistics(params?: { period?: string }): Promise<BookingStatisticsResponse> {
    try {
      if (!window.backendAPI?.dashboard) {
        throw new Error("Electron API (dashboard) not available");
      }

      const response = await window.backendAPI.dashboard({
        method: "getBookingStatistics",
        params: params || {},
      });

      if (response.status) {
        return response;
      }
      throw new Error(response.message || "Failed to fetch booking statistics");
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch booking statistics");
    }
  }

  // --------------------------------------------------------------------
  // 📈 TREND & PERFORMANCE
  // --------------------------------------------------------------------

  /**
   * Get revenue trend over time
   * @param params.period - 'day', 'week', 'month', 'year' (default 'month')
   * @param params.count - Number of periods to return (default 6)
   */
  async getRevenueTrend(params?: { period?: string; count?: number }): Promise<RevenueTrendResponse> {
    try {
      if (!window.backendAPI?.dashboard) {
        throw new Error("Electron API (dashboard) not available");
      }

      const response = await window.backendAPI.dashboard({
        method: "getRevenueTrend",
        params: params || {},
      });

      if (response.status) {
        return response;
      }
      throw new Error(response.message || "Failed to fetch revenue trend");
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch revenue trend");
    }
  }

  /**
   * Get occupancy rates for a given period
   * @param params.period - 'day', 'week', 'month' (default 'day')
   * @param params.days - Number of days to analyze (default 30)
   */
  async getOccupancyReport(params?: { period?: string; days?: number }): Promise<OccupancyReportResponse> {
    try {
      if (!window.backendAPI?.dashboard) {
        throw new Error("Electron API (dashboard) not available");
      }

      const response = await window.backendAPI.dashboard({
        method: "getOccupancyReport",
        params: params || {},
      });

      if (response.status) {
        return response;
      }
      throw new Error(response.message || "Failed to fetch occupancy report");
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch occupancy report");
    }
  }

  /**
   * Get performance metrics per room
   */
  async getRoomPerformance(): Promise<RoomPerformanceResponse> {
    try {
      if (!window.backendAPI?.dashboard) {
        throw new Error("Electron API (dashboard) not available");
      }

      const response = await window.backendAPI.dashboard({
        method: "getRoomPerformance",
        params: {},
      });

      if (response.status) {
        return response;
      }
      throw new Error(response.message || "Failed to fetch room performance");
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch room performance");
    }
  }

  // --------------------------------------------------------------------
  // 👥 GUEST INSIGHTS
  // --------------------------------------------------------------------

  /**
   * Retrieve guest segmentation insights
   */
  async getGuestSegmentation(): Promise<GuestSegmentationResponse> {
    try {
      if (!window.backendAPI?.dashboard) {
        throw new Error("Electron API (dashboard) not available");
      }

      const response = await window.backendAPI.dashboard({
        method: "getGuestSegmentation",
        params: {},
      });

      if (response.status) {
        return response;
      }
      throw new Error(response.message || "Failed to fetch guest segmentation");
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch guest segmentation");
    }
  }

  /**
   * Get bookings for the next X days
   * @param params.days - Number of days ahead (default 7)
   */
  async getUpcomingBookings(params?: { days?: number }): Promise<UpcomingBookingsResponse> {
    try {
      if (!window.backendAPI?.dashboard) {
        throw new Error("Electron API (dashboard) not available");
      }

      const response = await window.backendAPI.dashboard({
        method: "getUpcomingBookings",
        params: params || {},
      });

      if (response.status) {
        return response;
      }
      throw new Error(response.message || "Failed to fetch upcoming bookings");
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch upcoming bookings");
    }
  }

  // --------------------------------------------------------------------
  // 💰 FINANCIAL & SEASONAL
  // --------------------------------------------------------------------

  /**
   * Generate financial summary for a date range
   * @param params.startDate - YYYY-MM-DD (required)
   * @param params.endDate   - YYYY-MM-DD (required)
   */
  async getFinancialSummary(params: { startDate: string; endDate: string }): Promise<FinancialSummaryResponse> {
    try {
      if (!window.backendAPI?.dashboard) {
        throw new Error("Electron API (dashboard) not available");
      }

      const response = await window.backendAPI.dashboard({
        method: "getFinancialSummary",
        params,
      });

      if (response.status) {
        return response;
      }
      throw new Error(response.message || "Failed to fetch financial summary");
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch financial summary");
    }
  }

  /**
   * Get seasonal trends over several years
   * @param params.years - Number of years to analyze (default 3)
   */
  async getSeasonalTrends(params?: { years?: number }): Promise<SeasonalTrendsResponse> {
    try {
      if (!window.backendAPI?.dashboard) {
        throw new Error("Electron API (dashboard) not available");
      }

      const response = await window.backendAPI.dashboard({
        method: "getSeasonalTrends",
        params: params || {},
      });

      if (response.status) {
        return response;
      }
      throw new Error(response.message || "Failed to fetch seasonal trends");
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch seasonal trends");
    }
  }

  // --------------------------------------------------------------------
  // 📄 REPORT GENERATION
  // --------------------------------------------------------------------

  /**
   * Generate and export a report (PDF/CSV)
   * @param params.reportType - e.g. 'financial_summary', 'occupancy_report', ...
   * @param params.parameters - Report‑specific parameters (object)
   * @param params.format     - 'pdf' or 'csv' (default 'pdf')
   * @param params.user       - User who requested the report (default 'system')
   */
  async generateReport(params: {
    reportType: string;
    parameters: Record<string, any>;
    format?: string;
    user?: string;
  }): Promise<GenerateReportResponse> {
    try {
      if (!window.backendAPI?.dashboard) {
        throw new Error("Electron API (dashboard) not available");
      }

      const response = await window.backendAPI.dashboard({
        method: "generateReport",
        params,
      });

      if (response.status) {
        return response;
      }
      throw new Error(response.message || "Failed to generate report");
    } catch (error: any) {
      throw new Error(error.message || "Failed to generate report");
    }
  }

  // --------------------------------------------------------------------
  // 🧰 UTILITY METHODS
  // --------------------------------------------------------------------

  /**
   * Check if the backend dashboard API is available
   */
  async isAvailable(): Promise<boolean> {
    return !!(window.backendAPI?.dashboard);
  }

  /**
   * Quick occupancy rate for today
   * Convenience wrapper that extracts today's occupancy from dashboard data
   */
  async getTodaysOccupancyRate(): Promise<number> {
    try {
      const dashboard = await this.getDashboardData();
      return dashboard.data.today.occupancyRate;
    } catch {
      return 0;
    }
  }

  /**
   * Quick total revenue for current month
   * Uses revenue trend with period='month', count=1
   */
  async getCurrentMonthRevenue(): Promise<number> {
    try {
      const trend = await this.getRevenueTrend({ period: 'month', count: 1 });
      return trend.data[0]?.revenue || 0;
    } catch {
      return 0;
    }
  }
}

// ----------------------------------------------------------------------
// 📤 Export singleton instance
// ----------------------------------------------------------------------

const dashboardAPI = new DashboardAPI();
export default dashboardAPI;
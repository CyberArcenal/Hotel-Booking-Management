// src/renderer/api/booking.ts
// Booking API – Frontend client for Electron IPC booking handlers

// ----------------------------------------------------------------------
// 📦 Types & Interfaces (mirror backend entities)
// ----------------------------------------------------------------------

export interface Guest {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  address?: string | null;
  idNumber?: string | null;
  createdAt: string; // ISO date
}

export interface Room {
  id: number;
  roomNumber: string;
  type: string;
  capacity: number;
  pricePerNight: number;
  isAvailable: boolean;
  amenities?: string | null;
  createdAt: string; // ISO date
}

export interface Booking {
  id: number;
  checkInDate: string; // YYYY-MM-DD
  checkOutDate: string; // YYYY-MM-DD
  numberOfGuests: number;
  totalPrice: number;
  status: "pending" |"confirmed" | "checked_in" | "checked_out" | "cancelled";
  paymentStatus: "pending" | "paid" | "failed";
  specialRequests?: string | null;
  createdAt: string; // ISO datetime
  room: Room;
  guest: Guest;
}

// ----------------------------------------------------------------------
// 📦 Request / Response DTOs
// ----------------------------------------------------------------------

export interface PaginatedBookings {
  items: Booking[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BookingStatistics {
  statusCounts: Array<{ status: string; count: number }>;
  revenue: {
    total: number;
    average: number;
    totalBookings: number;
  };
  monthlyTrends: Array<{ month: string; bookings: number; revenue: number }>;
  upcomingBookings: number;
}

export interface TodaysOperations {
  arrivals: Booking[];
  departures: Booking[];
  inHouse: Booking[];
  arrivalsCount: number;
  departuresCount: number;
  inHouseCount: number;
}

export interface OccupancyRate {
  startDate: string;
  endDate: string;
  totalRooms: number;
  occupiedRooms: number;
  occupancyRate: number;
}

export interface RevenueStats {
  totalRevenue: number;
  averageBookingValue: number;
  totalBookings: number;
  monthlyTrends: Array<{ month: string; bookings: number; revenue: number }>;
}

export interface Invoice {
  invoiceNumber: string;
  date: string;
  bookingId: number;
  guest: Pick<Guest, "fullName" | "email" | "phone">;
  room: Pick<Room, "roomNumber" | "type" | "capacity">;
  stay: {
    checkIn: string;
    checkOut: string;
    nights: number;
    guests: number;
  };
  charges: Array<{
    description: string;
    nights: number;
    rate: number;
    amount: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  status: string;
  paymentStatus: string;
  notes?: string | null;
}

export interface BookingReport {
  // Flexible; depends on reportType
  [key: string]: any;
}

// ----------------------------------------------------------------------
// 📨 IPC Response Interfaces
// ----------------------------------------------------------------------

export interface BookingsResponse {
  status: boolean;
  message: string;
  data: Booking[] | PaginatedBookings;
}

export interface BookingResponse {
  status: boolean;
  message: string;
  data: Booking;
}

export interface BookingStatisticsResponse {
  status: boolean;
  message: string;
  data: BookingStatistics;
}

export interface TodaysOperationsResponse {
  status: boolean;
  message: string;
  data: TodaysOperations;
}

export interface OccupancyRateResponse {
  status: boolean;
  message: string;
  data: OccupancyRate;
}

export interface RevenueStatsResponse {
  status: boolean;
  message: string;
  data: RevenueStats;
}

export interface InvoiceResponse {
  status: boolean;
  message: string;
  data: Invoice;
}

export interface BookingReportResponse {
  status: boolean;
  message: string;
  data: BookingReport | string; // string for CSV
}

export interface BulkOperationResult {
  created?: number;
  updated?: number;
  failed: number;
  errors: Array<{ id?: number; bookingData?: any; error: string }>;
}

export interface BulkOperationResponse {
  status: boolean;
  message: string;
  data: BulkOperationResult;
}

export interface ExportResult {
  filePath: string;
  count: number;
}

export interface ExportResponse {
  status: boolean;
  message: string;
  data: ExportResult;
}

export interface ImportResult {
  imported: number;
  failed: number;
  errors: Array<{ record: any; error: string }>;
}

export interface ImportResponse {
  status: boolean;
  message: string;
  data: ImportResult;
}

// ----------------------------------------------------------------------
// 🧠 BookingAPI Class
// ----------------------------------------------------------------------

class BookingAPI {
  // --------------------------------------------------------------------
  // 🔎 READ-ONLY METHODS
  // --------------------------------------------------------------------

  /**
   * Get all bookings with optional filtering, sorting, and pagination
   * @param params - Filter, sort, pagination options
   */
  async getAll(params?: {
    status?: string;
    statuses?: string[];
    roomId?: number;
    guestId?: number;
    checkInDate?: string;
    checkOutDate?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: "ASC" | "DESC";
    page?: number;
    limit?: number;
  }): Promise<BookingsResponse> {
    try {
      if (!window.backendAPI?.booking) {
        throw new Error("Electron API (booking) not available");
      }
      const response = await window.backendAPI.booking({
        method: "getAllBookings",
        params: params || {},
      });
      console.log(response)
      if (response.status) return response;
      throw new Error(response.message || "Failed to fetch bookings");
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch bookings");
    }
  }

  /**
   * Get a single booking by ID
   * @param id - Booking ID
   */
  async getById(id: number): Promise<BookingResponse> {
    try {
      if (!window.backendAPI?.booking) {
        throw new Error("Electron API (booking) not available");
      }
      const response = await window.backendAPI.booking({
        method: "getBookingById",
        params: { id },
      });
      if (response.status) return response;
      throw new Error(response.message || "Failed to fetch booking");
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch booking");
    }
  }

  /**
   * Get all bookings for a specific guest
   * @param guestId - Guest ID
   */
  async getByGuest(guestId: number): Promise<BookingsResponse> {
    try {
      if (!window.backendAPI?.booking) {
        throw new Error("Electron API (booking) not available");
      }
      const response = await window.backendAPI.booking({
        method: "getBookingByGuest",
        params: { guestId },
      });
      if (response.status) return response;
      throw new Error(response.message || "Failed to fetch guest bookings");
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch guest bookings");
    }
  }

  /**
   * Get all bookings for a specific room
   * @param roomId - Room ID
   */
  async getByRoom(roomId: number): Promise<BookingsResponse> {
    try {
      if (!window.backendAPI?.booking) {
        throw new Error("Electron API (booking) not available");
      }
      const response = await window.backendAPI.booking({
        method: "getBookingByRoom",
        params: { roomId },
      });
      console.log(response)
      if (response.status) return response;
      throw new Error(response.message || "Failed to fetch room bookings");
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch room bookings");
    }
  }

  /**
   * Get booking summary (statistics)
   */
  async getSummary(): Promise<BookingStatisticsResponse> {
    try {
      if (!window.backendAPI?.booking) {
        throw new Error("Electron API (booking) not available");
      }
      const response = await window.backendAPI.booking({
        method: "getBookingSummary",
        params: {},
      });
      if (response.status) return response;
      throw new Error(response.message || "Failed to fetch booking summary");
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch booking summary");
    }
  }

  /**
   * Get all active bookings (confirmed + checked_in)
   */
  async getActive(): Promise<BookingsResponse> {
    try {
      if (!window.backendAPI?.booking) {
        throw new Error("Electron API (booking) not available");
      }
      const response = await window.backendAPI.booking({
        method: "getActiveBookings",
        params: {},
      });
      if (response.status) return response;
      throw new Error(response.message || "Failed to fetch active bookings");
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch active bookings");
    }
  }

  /**
   * Get detailed booking statistics (alias for getSummary)
   */
  async getStats(): Promise<BookingStatisticsResponse> {
    return this.getSummary();
  }

  /**
   * Search bookings by guest name, email, or phone
   * @param query - Search term
   */
  async search(query: string): Promise<BookingsResponse> {
    try {
      if (!window.backendAPI?.booking) {
        throw new Error("Electron API (booking) not available");
      }
      const response = await window.backendAPI.booking({
        method: "searchBookings",
        params: { query },
      });
      if (response.status) return response;
      throw new Error(response.message || "Failed to search bookings");
    } catch (error: any) {
      throw new Error(error.message || "Failed to search bookings");
    }
  }

  /**
   * Get bookings within a specific date range
   * @param startDate - YYYY-MM-DD
   * @param endDate - YYYY-MM-DD
   */
  async getByDate(
    startDate: string,
    endDate: string,
  ): Promise<BookingsResponse> {
    try {
      if (!window.backendAPI?.booking) {
        throw new Error("Electron API (booking) not available");
      }
      const response = await window.backendAPI.booking({
        method: "getBookingsByDate",
        params: { startDate, endDate },
      });
      if (response.status) return response;
      throw new Error(response.message || "Failed to fetch bookings by date");
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch bookings by date");
    }
  }

  // --------------------------------------------------------------------
  // ✏️ WRITE OPERATIONS
  // --------------------------------------------------------------------

  /**
   * Create a new booking
   * @param bookingData - Booking data (see bookingService.create)
   * @param user - Optional username for audit
   */
  async create(bookingData: {
    checkInDate: string;
    checkOutDate: string;
    roomId: number;
    guestData: Omit<Guest, "id" | "createdAt"> | { id: number };
    numberOfGuests?: number;
    specialRequests?: string;
    user?: string;
  }): Promise<BookingResponse> {
    try {
      if (!window.backendAPI?.booking) {
        throw new Error("Electron API (booking) not available");
      }
      const response = await window.backendAPI.booking({
        method: "createBooking",
        params: bookingData,
      });
      if (response.status) return response;
      throw new Error(response.message || "Failed to create booking");
    } catch (error: any) {
      throw new Error(error.message || "Failed to create booking");
    }
  }

  /**
   * Update an existing booking
   * @param id - Booking ID
   * @param bookingData - Fields to update
   * @param user - Optional username for audit
   */
  async update(
    id: number,
    bookingData: Partial<
      Omit<Booking, "id" | "room" | "guest" | "createdAt">
    > & {
      roomId?: number;
      guestData?: Partial<Guest>;
    },
    user?: string,
  ): Promise<BookingResponse> {
    try {
      if (!window.backendAPI?.booking) {
        throw new Error("Electron API (booking) not available");
      }
      const response = await window.backendAPI.booking({
        method: "updateBooking",
        params: { id, bookingData, user },
      });
      if (response.status) return response;
      throw new Error(response.message || "Failed to update booking");
    } catch (error: any) {
      throw new Error(error.message || "Failed to update booking");
    }
  }

  /**
   * Delete a booking (permanent)
   * @param id - Booking ID
   * @param user - Optional username for audit
   */
  async delete(
    id: number,
    user?: string,
  ): Promise<{ status: boolean; message: string; data: null }> {
    try {
      if (!window.backendAPI?.booking) {
        throw new Error("Electron API (booking) not available");
      }
      const response = await window.backendAPI.booking({
        method: "deleteBooking",
        params: { id, user },
      });
      if (response.status) return response;
      throw new Error(response.message || "Failed to delete booking");
    } catch (error: any) {
      throw new Error(error.message || "Failed to delete booking");
    }
  }

  /**
   * Update only the status of a booking
   * @param id - Booking ID
   * @param status - New status
   * @param reason - Reason (for cancellation)
   * @param user - Optional username
   */
  async updateStatus(
    id: number,
    status: Booking["status"],
    reason?: string,
    user?: string,
  ): Promise<BookingResponse> {
    try {
      if (!window.backendAPI?.booking) {
        throw new Error("Electron API (booking) not available");
      }
      const response = await window.backendAPI.booking({
        method: "updateBookingStatus",
        params: { id, status, reason, user },
      });
      if (response.status) return response;
      throw new Error(response.message || "Failed to update booking status");
    } catch (error: any) {
      throw new Error(error.message || "Failed to update booking status");
    }
  }

  /**
   * Cancel a booking
   * @param id - Booking ID
   * @param reason - Cancellation reason
   * @param user - Optional username
   */
  async cancel(
    id: number,
    reason?: string,
    user?: string,
  ): Promise<BookingResponse> {
    try {
      if (!window.backendAPI?.booking) {
        throw new Error("Electron API (booking) not available");
      }
      const response = await window.backendAPI.booking({
        method: "cancelBooking",
        params: { id, reason, user },
      });
      if (response.status) return response;
      throw new Error(response.message || "Failed to cancel booking");
    } catch (error: any) {
      throw new Error(error.message || "Failed to cancel booking");
    }
  }

  /**
   * Check in a guest
   * @param id - Booking ID
   * @param user - Optional username
   */
  async checkIn(id: number, user?: string): Promise<BookingResponse> {
    try {
      if (!window.backendAPI?.booking) {
        throw new Error("Electron API (booking) not available");
      }
      const response = await window.backendAPI.booking({
        method: "checkInBooking",
        params: { id, user },
      });
      if (response.status) return response;
      throw new Error(response.message || "Failed to check in");
    } catch (error: any) {
      throw new Error(error.message || "Failed to check in");
    }
  }

  /**
   * Check out a guest
   * @param id - Booking ID
   * @param notes - Check-out notes
   * @param user - Optional username
   */
  async checkOut(
    id: number,
    notes?: string,
    user?: string,
  ): Promise<BookingResponse> {
    try {
      if (!window.backendAPI?.booking) {
        throw new Error("Electron API (booking) not available");
      }
      const response = await window.backendAPI.booking({
        method: "checkOutBooking",
        params: { id, notes, user },
      });
      if (response.status) return response;
      throw new Error(response.message || "Failed to check out");
    } catch (error: any) {
      throw new Error(error.message || "Failed to check out");
    }
  }

  async markAsPaid(id: number, reason?: string): Promise<BookingResponse> {
    try {
      if (!window.backendAPI?.booking) {
        throw new Error("Electron API (booking) not available");
      }
      const response = await window.backendAPI.booking({
        method: "markAsPaid",
        params: { id, reason },
      });
      console.log(response)
      if (response.status) return response;
      throw new Error(response.message || "Failed to mark As Paid");
    } catch (error: any) {
      throw new Error(error.message || "Failed to mark As Paid");
    }
  }

  async markAsFailed(id: number, reason?: string): Promise<BookingResponse> {
    try {
      if (!window.backendAPI?.booking) {
        throw new Error("Electron API (booking) not available");
      }
      const response = await window.backendAPI.booking({
        method: "markAsFailed",
        params: { id, reason },
      });
      if (response.status) return response;
      throw new Error(response.message || "Failed to mark As Paid");
    } catch (error: any) {
      throw new Error(error.message || "Failed to mark As Paid");
    }
  }

  // --------------------------------------------------------------------
  // 📊 STATISTICS METHODS
  // --------------------------------------------------------------------

  /**
   * Get revenue statistics
   */
  async getRevenue(): Promise<RevenueStatsResponse> {
    try {
      if (!window.backendAPI?.booking) {
        throw new Error("Electron API (booking) not available");
      }
      const response = await window.backendAPI.booking({
        method: "getBookingRevenue",
        params: {},
      });
      if (response.status) return response;
      throw new Error(response.message || "Failed to fetch revenue stats");
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch revenue stats");
    }
  }

  /**
   * Get occupancy rates for a date range
   * @param startDate - YYYY-MM-DD
   * @param endDate - YYYY-MM-DD
   */
  async getOccupancyRates(
    startDate: string,
    endDate: string,
  ): Promise<OccupancyRateResponse> {
    try {
      if (!window.backendAPI?.booking) {
        throw new Error("Electron API (booking) not available");
      }
      const response = await window.backendAPI.booking({
        method: "getOccupancyRates",
        params: { startDate, endDate },
      });
      if (response.status) return response;
      throw new Error(response.message || "Failed to fetch occupancy rates");
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch occupancy rates");
    }
  }

  // --------------------------------------------------------------------
  // 🔄 BATCH OPERATIONS
  // --------------------------------------------------------------------

  /**
   * Create multiple bookings at once
   * @param bookings - Array of booking creation objects
   * @param user - Optional username for audit
   */
  async bulkCreate(
    bookings: Array<Parameters<BookingAPI["create"]>[0]>,
    user?: string,
  ): Promise<BulkOperationResponse> {
    try {
      if (!window.backendAPI?.booking) {
        throw new Error("Electron API (booking) not available");
      }
      const response = await window.backendAPI.booking({
        method: "bulkCreateBookings",
        params: { bookings, user },
      });
      if (response.status) return response;
      throw new Error(response.message || "Failed to bulk create bookings");
    } catch (error: any) {
      throw new Error(error.message || "Failed to bulk create bookings");
    }
  }

  /**
   * Update multiple bookings in bulk
   * @param updates - Array of { id, bookingData }
   * @param user - Optional username
   */
  async bulkUpdate(
    updates: Array<{
      id: number;
      bookingData: Parameters<BookingAPI["update"]>[1];
    }>,
    user?: string,
  ): Promise<BulkOperationResponse> {
    try {
      if (!window.backendAPI?.booking) {
        throw new Error("Electron API (booking) not available");
      }
      const response = await window.backendAPI.booking({
        method: "bulkUpdateBookings",
        params: { updates, user },
      });
      if (response.status) return response;
      throw new Error(response.message || "Failed to bulk update bookings");
    } catch (error: any) {
      throw new Error(error.message || "Failed to bulk update bookings");
    }
  }

  /**
   * Import bookings from a CSV file
   * @param filePath - Absolute path to CSV file
   * @param user - Optional username
   */
  async importCSV(filePath: string, user?: string): Promise<ImportResponse> {
    try {
      if (!window.backendAPI?.booking) {
        throw new Error("Electron API (booking) not available");
      }
      const response = await window.backendAPI.booking({
        method: "importBookingsFromCSV",
        params: { filePath, user },
      });
      if (response.status) return response;
      throw new Error(response.message || "Failed to import CSV");
    } catch (error: any) {
      throw new Error(error.message || "Failed to import CSV");
    }
  }

  /**
   * Export bookings to CSV file
   * @param filePath - Destination file path
   * @param filters - Optional filter options (same as getAll)
   * @param user - Optional username
   */
  async exportCSV(
    filePath: string,
    filters?: Parameters<BookingAPI["getAll"]>[0],
    user?: string,
  ): Promise<ExportResponse> {
    try {
      if (!window.backendAPI?.booking) {
        throw new Error("Electron API (booking) not available");
      }
      const response = await window.backendAPI.booking({
        method: "exportBookingsToCSV",
        params: { filePath, filters, user },
      });
      if (response.status) return response;
      throw new Error(response.message || "Failed to export CSV");
    } catch (error: any) {
      throw new Error(error.message || "Failed to export CSV");
    }
  }

  // --------------------------------------------------------------------
  // 📄 REPORT METHODS
  // --------------------------------------------------------------------

  /**
   * Generate an invoice for a booking
   * @param bookingId - Booking ID
   */
  async generateInvoice(bookingId: number): Promise<InvoiceResponse> {
    try {
      if (!window.backendAPI?.booking) {
        throw new Error("Electron API (booking) not available");
      }
      const response = await window.backendAPI.booking({
        method: "generateInvoice",
        params: { bookingId },
      });
      if (response.status) return response;
      throw new Error(response.message || "Failed to generate invoice");
    } catch (error: any) {
      throw new Error(error.message || "Failed to generate invoice");
    }
  }

  /**
   * Generate a custom booking report
   * @param reportType - 'summary', 'detailed', 'revenue', 'occupancy'
   * @param startDate - YYYY-MM-DD
   * @param endDate - YYYY-MM-DD
   * @param format - 'json' or 'csv' (default 'json')
   */
  async generateReport(
    reportType: "summary" | "detailed" | "revenue" | "occupancy",
    startDate: string,
    endDate: string,
    format?: "json" | "csv",
  ): Promise<BookingReportResponse> {
    try {
      if (!window.backendAPI?.booking) {
        throw new Error("Electron API (booking) not available");
      }
      const response = await window.backendAPI.booking({
        method: "generateBookingReport",
        params: { reportType, startDate, endDate, format },
      });
      if (response.status) return response;
      throw new Error(response.message || "Failed to generate report");
    } catch (error: any) {
      throw new Error(error.message || "Failed to generate report");
    }
  }

  // --------------------------------------------------------------------
  // 🧰 UTILITY METHODS
  // --------------------------------------------------------------------

  /**
   * Get today's operations (arrivals, departures, in-house)
   */
  async getTodaysOperations(): Promise<TodaysOperationsResponse> {
    // This method is provided by bookingService but not directly exposed in index.ipc.
    // We add it here as a convenience; you can expose it via IPC if needed.
    // For now, we simulate by calling getBookingsByDate and filtering.
    const today = new Date().toISOString().split("T")[0];
    try {
      const arrivals = await this.getByDate(today, today);
      const inHouse = await this.getAll({
        checkInDate: today,
        checkOutDate: today,
        status: "checked_in",
      });
      const departures = await this.getByDate(today, today);
      // This is a placeholder; ideally you'd have a dedicated IPC method.
      return {
        status: true,
        message: "Todays operations retrieved",
        data: {
          arrivals: arrivals.data as Booking[],
          departures: departures.data as Booking[],
          inHouse: inHouse.data as Booking[],
          arrivalsCount: (arrivals.data as Booking[]).length,
          departuresCount: (departures.data as Booking[]).length,
          inHouseCount: (inHouse.data as Booking[]).length,
        },
      };
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch todays operations");
    }
  }

  /**
   * Check if the booking API is available
   */
  async isAvailable(): Promise<boolean> {
    return !!window.backendAPI?.booking;
  }

  /**
   * Validate room availability for a date range
   * @param roomId - Room ID
   * @param checkInDate - YYYY-MM-DD
   * @param checkOutDate - YYYY-MM-DD
   * @param excludeBookingId - Optional booking ID to exclude
   */
  async checkAvailability(
    roomId: number,
    checkInDate: string,
    checkOutDate: string,
    excludeBookingId?: number,
  ): Promise<boolean> {
    // This uses bookingService.checkRoomAvailability, not directly exposed.
    // You can add an IPC handler for it, or here we simulate via getAll.
    try {
      const conflicting = await this.getAll({
        roomId,
        checkInDate,
        checkOutDate,
        statuses: ["confirmed", "checked_in", "pending"],
      });
      if (excludeBookingId) {
        const filtered = (conflicting.data as Booking[]).filter(
          (b) => b.id !== excludeBookingId,
        );
        return filtered.length === 0;
      }
      return (conflicting.data as Booking[]).length === 0;
    } catch (error) {
      console.error("Error checking availability:", error);
      return false;
    }
  }
}

// ----------------------------------------------------------------------
// 📤 Export singleton instance
// ----------------------------------------------------------------------

const bookingAPI = new BookingAPI();
export default bookingAPI;

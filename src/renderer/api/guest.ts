// src/renderer/api/guest.ts
// Guest Management Frontend API – mirrors backend IPC handlers
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
  updatedAt?: string;
  bookings?: BookingSummary[];
}

export interface BookingSummary {
  id: number;
  checkInDate: string;
  checkOutDate: string;
  status: string;
  totalPrice: number;
  room?: { id: number; roomNumber: string; type: string };
}

export interface GuestWithStats extends Guest {
  totalBookings?: number;
  activeBookings?: number;
  totalSpent?: number;
  lastVisit?: string | null;
}

export interface GuestSummary {
  totalGuests: number;
  activeGuests: number;
  newThisMonth: number;
  recentGuests: Guest[];
}

export interface GuestStatistics {
  totalGuests: number;
  guestsWithBookings: number;
  repeatGuests: number;
  newGuestsThisMonth: number;
  repeatRate: string;
  nationalities: Array<{ nationality: string; count: string | number }>;
  bookingFrequency: {
    average: string;
    distribution: Record<string, number>;
  };
}

export interface PaginatedGuests {
  guests: GuestWithStats[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BookingHistoryResult {
  bookings: BookingSummary[];
  summary: {
    totalBookings: number;
    totalSpent: number;
    avgNights: string;
    firstBooking: string | null;
    lastBooking: string | null;
  };
}

export interface VIPGuest {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  bookingCount: string | number;
  totalSpent: string | number;
}

export interface MergeResult {
  success: boolean;
  masterGuest: Guest;
  mergedCount: number;
  deletedGuestIds: number[];
}

export interface BulkOperationResult {
  created?: Guest[];
  updated?: Guest[];
  errors: Array<{ row?: number; id?: number; data?: any; error: string }>;
}

export interface FileExportResult {
  format: "csv" | "json";
  data: string; // CSV content or JSON string
  filename: string;
}

// ----------------------------------------------------------------------
// 📨 Response Interfaces (IPC response shape)
// ----------------------------------------------------------------------

export interface GuestResponse {
  status: boolean;
  message: string;
  data: Guest;
}

export interface GuestsResponse {
  status: boolean;
  message: string;
  data: Guest[] | GuestWithStats[]; // for simple list
}

export interface PaginatedGuestsResponse {
  status: boolean;
  message: string;
  data: PaginatedGuests;
}

export interface GuestSummaryResponse {
  status: boolean;
  message: string;
  data: GuestSummary;
}

export interface GuestStatsResponse {
  status: boolean;
  message: string;
  data: GuestStatistics;
}

export interface BookingHistoryResponse {
  status: boolean;
  message: string;
  data: BookingHistoryResult;
}

export interface VIPGuestsResponse {
  status: boolean;
  message: string;
  data: VIPGuest[];
}

export interface GuestFrequencyResponse {
  status: boolean;
  message: string;
  data: {
    average: string;
    distribution: Record<string, number>;
  };
}

export interface MergeResultResponse {
  status: boolean;
  message: string;
  data: MergeResult;
}

export interface BulkOperationResponse {
  status: boolean;
  message: string;
  data: BulkOperationResult;
}

export interface FileExportResponse {
  status: boolean;
  message: string;
  data: FileExportResult;
}

export interface DeleteResponse {
  status: boolean;
  message: string;
  data: { deleted: boolean };
}

// ----------------------------------------------------------------------
// 🧠 GuestAPI Class – all methods align with backend IPC handlers
// ----------------------------------------------------------------------

class GuestAPI {
  // --------------------------------------------------------------------
  // 🔎 READ-ONLY METHODS
  // --------------------------------------------------------------------

  /**
   * Get all guests with optional filters (no pagination – use search for pagination)
   * @param filters - Optional filter object (passed to service.findAll)
   */
  async getAll(filters?: Record<string, any>): Promise<GuestsResponse> {
    try {
      if (!window.backendAPI?.guest) {
        throw new Error("Electron API (guest) not available");
      }
      const response = await window.backendAPI.guest({
        method: "getAllGuests",
        params: { filters: filters || {} },
      });
      if (response.status) return response;
      throw new Error(response.message || "Failed to fetch guests");
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch guests");
    }
  }

  /**
   * Get a single guest by ID with optional booking history
   * @param id - Guest ID
   * @param includeBookings - Whether to include bookings (default true)
   */
  async getById(id: number, includeBookings = true): Promise<GuestResponse> {
    try {
      if (!window.backendAPI?.guest)
        throw new Error("Electron API (guest) not available");
      const response = await window.backendAPI.guest({
        method: "getGuestById",
        params: { id, includeBookings },
      });
      if (response.status) return response;
      throw new Error(response.message || "Failed to fetch guest");
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch guest");
    }
  }

  /**
   * Find a guest by exact email
   * @param email - Guest email
   * @param includeBookings - Include booking history (default false)
   */
  async getByEmail(
    email: string,
    includeBookings = false,
  ): Promise<GuestResponse> {
    try {
      if (!window.backendAPI?.guest)
        throw new Error("Electron API (guest) not available");
      const response = await window.backendAPI.guest({
        method: "getGuestByEmail",
        params: { email, includeBookings },
      });
      if (response.status) return response;
      throw new Error(response.message || "Failed to fetch guest by email");
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch guest by email");
    }
  }

  /**
   * Find a guest by phone number (exact match via search)
   * @param phone - Phone number
   */
  async getByPhone(phone: string): Promise<GuestResponse> {
    try {
      if (!window.backendAPI?.guest)
        throw new Error("Electron API (guest) not available");
      const response = await window.backendAPI.guest({
        method: "getGuestByPhone",
        params: { phone },
      });
      if (response.status) return response;
      throw new Error(response.message || "Failed to fetch guest by phone");
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch guest by phone");
    }
  }

  /**
   * Get dashboard summary (totals, new this month, recent guests)
   */
  async getSummary(): Promise<GuestSummaryResponse> {
    try {
      if (!window.backendAPI?.guest)
        throw new Error("Electron API (guest) not available");
      const response = await window.backendAPI.guest({
        method: "getGuestSummary",
        params: {},
      });
      if (response.status) return response;
      throw new Error(response.message || "Failed to fetch guest summary");
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch guest summary");
    }
  }

  /**
   * Get guests with active bookings (currently checked-in or confirmed)
   * @param page - Page number (default 1)
   * @param limit - Items per page (default 20)
   */
  async getActiveGuests(
    page = 1,
    limit = 20,
  ): Promise<PaginatedGuestsResponse> {
    try {
      if (!window.backendAPI?.guest)
        throw new Error("Electron API (guest) not available");
      const response = await window.backendAPI.guest({
        method: "getActiveGuests",
        params: { page, limit },
      });
      if (response.status) return response;
      throw new Error(response.message || "Failed to fetch active guests");
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch active guests");
    }
  }

  /**
   * Get comprehensive guest statistics
   */
  async getStats(): Promise<GuestStatsResponse> {
    try {
      if (!window.backendAPI?.guest)
        throw new Error("Electron API (guest) not available");
      const response = await window.backendAPI.guest({
        method: "getGuestStats",
        params: {},
      });
      if (response.status) return response;
      throw new Error(response.message || "Failed to fetch guest statistics");
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch guest statistics");
    }
  }

  /**
   * Advanced search with pagination and filtering
   * @param criteria - Search criteria (see GuestService.search)
   */
  async search(criteria: {
    search?: string;
    name?: string;
    email?: string;
    phone?: string;
    nationality?: string;
    hasBookings?: boolean;
    minBookings?: number;
    lastVisitAfter?: string;
    sortBy?: string;
    sortOrder?: "ASC" | "DESC";
    page?: number;
    limit?: number;
  }): Promise<PaginatedGuestsResponse> {
    try {
      if (!window.backendAPI?.guest)
        throw new Error("Electron API (guest) not available");
      const response = await window.backendAPI.guest({
        method: "searchGuests",
        params: criteria,
      });
      if (response.status) return response;
      throw new Error(response.message || "Failed to search guests");
    } catch (error: any) {
      throw new Error(error.message || "Failed to search guests");
    }
  }

  /**
   * Get full booking history for a specific guest
   * @param guestId - Guest ID
   * @param options - Filtering and pagination options
   */
  async getBookingHistory(
    guestId: number,
    options?: {
      status?: string;
      fromDate?: string;
      toDate?: string;
      sortBy?: string;
      sortOrder?: "ASC" | "DESC";
      page?: number;
      limit?: number;
    },
  ): Promise<BookingHistoryResponse> {
    try {
      if (!window.backendAPI?.guest)
        throw new Error("Electron API (guest) not available");
      const response = await window.backendAPI.guest({
        method: "getGuestBookings",
        params: { guestId, options: options || {} },
      });
      if (response.status) return response;
      throw new Error(response.message || "Failed to fetch booking history");
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch booking history");
    }
  }

  // --------------------------------------------------------------------
  // 📊 STATISTICS & ANALYTICS
  // --------------------------------------------------------------------

  /**
   * Get VIP/loyalty guests based on booking count and total spent
   * @param minBookings - Minimum bookings (default 3)
   * @param minSpent - Minimum total spent (default 10000)
   */
  async getLoyaltyGuests(
    minBookings = 3,
    minSpent = 10000,
  ): Promise<VIPGuestsResponse> {
    try {
      if (!window.backendAPI?.guest)
        throw new Error("Electron API (guest) not available");
      const response = await window.backendAPI.guest({
        method: "getGuestLoyalty",
        params: { minBookings, minSpent },
      });
      if (response.status) return response;
      throw new Error(response.message || "Failed to fetch loyalty guests");
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch loyalty guests");
    }
  }

  /**
   * Get guest booking frequency distribution
   */
  async getFrequency(): Promise<GuestFrequencyResponse> {
    try {
      if (!window.backendAPI?.guest)
        throw new Error("Electron API (guest) not available");
      const response = await window.backendAPI.guest({
        method: "getGuestFrequency",
        params: {},
      });
      if (response.status) return response;
      throw new Error(response.message || "Failed to fetch guest frequency");
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch guest frequency");
    }
  }

  // --------------------------------------------------------------------
  // ✏️ WRITE OPERATIONS (transactional)
  // --------------------------------------------------------------------

  /**
   * Create a new guest
   * @param guestData - Guest information (fullName, email, phone are required)
   * @param user - Username (default 'system')
   */
  async create(
    guestData: {
      fullName: string;
      email: string;
      phone: string;
      address?: string;
      idNumber?: string;
    },
    user = "system",
  ): Promise<GuestResponse> {
    try {
      if (!window.backendAPI?.guest)
        throw new Error("Electron API (guest) not available");
      const response = await window.backendAPI.guest({
        method: "createGuest",
        params: { guestData, user },
      });
      if (response.status) return response;
      throw new Error(response.message || "Failed to create guest");
    } catch (error: any) {
      throw new Error(error.message || "Failed to create guest");
    }
  }

  /**
   * Update an existing guest
   * @param id - Guest ID
   * @param guestData - Partial guest data to update
   * @param user - Username (default 'system')
   */
  async update(
    id: number,
    guestData: Partial<{
      fullName: string;
      email: string;
      phone: string;
      address: string;
      idNumber: string;
    }>,
    user = "system",
  ): Promise<GuestResponse> {
    try {
      if (!window.backendAPI?.guest)
        throw new Error("Electron API (guest) not available");
      const response = await window.backendAPI.guest({
        method: "updateGuest",
        params: { id, guestData, user },
      });
      if (response.status) return response;
      throw new Error(response.message || "Failed to update guest");
    } catch (error: any) {
      throw new Error(error.message || "Failed to update guest");
    }
  }

  /**
   * Delete a guest (only if no active bookings)
   * @param id - Guest ID
   * @param user - Username (default 'system')
   */
  async delete(id: number, user = "system"): Promise<DeleteResponse> {
    try {
      if (!window.backendAPI?.guest)
        throw new Error("Electron API (guest) not available");
      const response = await window.backendAPI.guest({
        method: "deleteGuest",
        params: { id, user },
      });
      if (response.status) return response;
      throw new Error(response.message || "Failed to delete guest");
    } catch (error: any) {
      throw new Error(error.message || "Failed to delete guest");
    }
  }

  /**
   * Update guest status (⚠️ NOT IMPLEMENTED – kept for future use)
   * @deprecated Guest entity has no status field
   */
  async updateStatus(
    id: number,
    status: string,
    user = "system",
  ): Promise<any> {
    console.warn("Guest status update is not implemented");
    return {
      status: false,
      message:
        "Guest status update is not implemented – entity has no status field.",
      data: null,
    };
  }

  /**
   * Merge duplicate guest profiles
   * @param guestIds - Array of guest IDs to merge (first is kept as master)
   * @param masterData - Optional data to override on master guest
   * @param user - Username (default 'system')
   */
  async mergeProfiles(
    guestIds: number[],
    masterData: Partial<Guest> = {},
    user = "system",
  ): Promise<MergeResultResponse> {
    try {
      if (!window.backendAPI?.guest)
        throw new Error("Electron API (guest) not available");
      const response = await window.backendAPI.guest({
        method: "mergeGuestProfiles",
        params: { guestIds, masterData, user },
      });
      if (response.status) return response;
      throw new Error(response.message || "Failed to merge guest profiles");
    } catch (error: any) {
      throw new Error(error.message || "Failed to merge guest profiles");
    }
  }

  // --------------------------------------------------------------------
  // 🔄 BATCH OPERATIONS
  // --------------------------------------------------------------------

  /**
   * Bulk create multiple guests
   * @param guests - Array of guest data objects
   * @param user - Username (default 'system')
   */
  async bulkCreate(
    guests: Array<{
      fullName: string;
      email: string;
      phone: string;
      address?: string;
      idNumber?: string;
    }>,
    user = "system",
  ): Promise<BulkOperationResponse> {
    try {
      if (!window.backendAPI?.guest)
        throw new Error("Electron API (guest) not available");
      const response = await window.backendAPI.guest({
        method: "bulkCreateGuests",
        params: { guests, user },
      });
      if (response.status) return response;
      throw new Error(response.message || "Failed to bulk create guests");
    } catch (error: any) {
      throw new Error(error.message || "Failed to bulk create guests");
    }
  }

  /**
   * Bulk update multiple guests
   * @param updates - Array of { id, data } objects
   * @param user - Username (default 'system')
   */
  async bulkUpdate(
    updates: Array<{ id: number; data: Partial<Guest> }>,
    user = "system",
  ): Promise<BulkOperationResponse> {
    try {
      if (!window.backendAPI?.guest)
        throw new Error("Electron API (guest) not available");
      const response = await window.backendAPI.guest({
        method: "bulkUpdateGuests",
        params: { updates, user },
      });
      if (response.status) return response;
      throw new Error(response.message || "Failed to bulk update guests");
    } catch (error: any) {
      throw new Error(error.message || "Failed to bulk update guests");
    }
  }

  /**
   * Import guests from CSV string
   * @param csvData - Raw CSV content (first row must be headers)
   * @param user - Username (default 'system')
   */
  async importFromCSV(
    csvData: string,
    user = "system",
  ): Promise<BulkOperationResponse> {
    try {
      if (!window.backendAPI?.guest)
        throw new Error("Electron API (guest) not available");
      const response = await window.backendAPI.guest({
        method: "importGuestsFromCSV",
        params: { csvData, user },
      });
      if (response.status) return response;
      throw new Error(response.message || "Failed to import guests from CSV");
    } catch (error: any) {
      throw new Error(error.message || "Failed to import guests from CSV");
    }
  }

  /**
   * Export guests to CSV file
   * @param filters - Optional filters to limit exported data
   * @param user - Username (default 'system')
   */
  async exportToCSV(
    filters?: Record<string, any>,
    user = "system",
  ): Promise<FileExportResponse> {
    try {
      if (!window.backendAPI?.guest)
        throw new Error("Electron API (guest) not available");
      const response = await window.backendAPI.guest({
        method: "exportGuestsToCSV",
        params: { filters: filters || {}, user },
      });
      if (response.status) return response;
      throw new Error(response.message || "Failed to export guests to CSV");
    } catch (error: any) {
      throw new Error(error.message || "Failed to export guests to CSV");
    }
  }

  // --------------------------------------------------------------------
  // 🧰 UTILITY METHODS
  // --------------------------------------------------------------------

  /**
   * Check if the backend guest API is available
   */
  async isAvailable(): Promise<boolean> {
    return !!window.backendAPI?.guest;
  }

  /**
   * Quick check if a guest exists by email
   */
  async existsByEmail(email: string): Promise<boolean> {
    try {
      const res = await this.getByEmail(email, false);
      return res.status && !!res.data;
    } catch {
      return false;
    }
  }

  /**
   * Quick check if a guest exists by ID
   */
  async existsById(id: number): Promise<boolean> {
    try {
      const res = await this.getById(id, false);
      return res.status && !!res.data;
    } catch {
      return false;
    }
  }
}

// ----------------------------------------------------------------------
// 📤 Export singleton instance
// ----------------------------------------------------------------------

const guestAPI = new GuestAPI();
export default guestAPI;

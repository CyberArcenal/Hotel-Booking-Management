// src/renderer/api/room.ts
// ----------------------------------------------------------------------
// 📦 Types & Interfaces (based on backend Room entity and IPC responses)
// ----------------------------------------------------------------------

import type { Guest } from "./booking";

export interface Room {
  id: number;
  roomNumber: string;
  type:
    | "standard"
    | "single"
    | "double"
    | "twin"
    | "suite"
    | "deluxe"
    | "family"
    | "studio"
    | "executive";
  capacity: number;
  pricePerNight: number;
  /** @deprecated Use `status` instead – kept for backward compatibility */
  isAvailable: boolean;
  /** Current room status: available, occupied, maintenance */
  status: "available" | "occupied" | "maintenance";
  amenities: string | null;
  createdAt: string; // ISO date string
  bookings?: Booking[]; // optional relation
}

export interface Booking {
  id: number;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  totalPrice: number;
  status: string;
  specialRequests: string | null;
  createdAt: string;
  roomId: number;
  guestId: number;
  guest: Guest;
}

// ----------------------------------------------------------------------
// 📨 Request parameter interfaces
// ----------------------------------------------------------------------

// src/renderer/api/room.ts

export interface GetAllRoomsParams {
  search?: string;
  type?: string;
  minCapacity?: number;
  maxPrice?: number;
  /** @deprecated Use `status: 'available'` instead */
  availableOnly?: boolean;   // kept for backward compatibility, but avoid using
  /** Filter by exact room status */
  status?: "available" | "occupied" | "maintenance";
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  // optional pagination if your backend supports it
  limit?: number;
  offset?: number;
}

export interface GetAvailableRoomsParams {
  checkInDate: string;
  checkOutDate: string;
  filters?: {
    type?: string;
    minCapacity?: number;
    maxPrice?: number;
  };
}

export interface SearchRoomsParams {
  query: string;
}

/**
 * Data for creating a new room.
 * - Use `status` to set the initial status (defaults to "available").
 * - `isAvailable` is derived from `status`; avoid using it directly.
 */
export interface CreateRoomParams {
  roomData: Omit<Room, "id" | "createdAt" | "bookings" | "isAvailable"> & {
    status?: "available" | "occupied" | "maintenance";
    /** @deprecated Use `status` instead – will be converted automatically */
    isAvailable?: boolean;
  };
  user?: string;
}

export interface UpdateRoomParams {
  id: number;
  updates: Partial<
    Omit<Room, "id" | "createdAt" | "bookings" | "isAvailable"> & {
      status?: "available" | "occupied" | "maintenance";
      /** @deprecated Use `status` instead – will be converted automatically */
      isAvailable?: boolean;
    }
  >;
  user?: string;
}

export interface DeleteRoomParams {
  id: number;
  user?: string;
}

/**
 * Set room availability using a boolean flag.
 * This toggles `isAvailable` and automatically sets `status` to
 * "available" (true) or "occupied" (false).
 */
export interface SetRoomAvailabilityParams {
  id: number;
  isAvailable: boolean;
  user?: string;
}

/**
 * Update the room status using the exact enum value.
 * Allowed values: "available", "occupied", "maintenance".
 */
export interface UpdateRoomStatusParams {
  id: number;
  status: "available" | "occupied" | "maintenance";
  user?: string;
}

export interface BulkCreateRoomsParams {
  rooms: Array<
    Omit<Room, "id" | "createdAt" | "bookings" | "isAvailable"> & {
      status?: "available" | "occupied" | "maintenance";
      /** @deprecated Use `status` instead – will be converted automatically */
      isAvailable?: boolean;
    }
  >;
  user?: string;
}

export interface BulkUpdateRoomsParams {
  updates: Array<{
    id: number;
    updates: Partial<
      Omit<Room, "id" | "createdAt" | "bookings" | "isAvailable"> & {
        status?: "available" | "occupied" | "maintenance";
        /** @deprecated Use `status` instead – will be converted automatically */
        isAvailable?: boolean;
      }
    >;
  }>;
  user?: string;
}

export interface ImportRoomsFromCSVParams {
  csvData: string;
  user?: string;
}

export interface ExportRoomsToCSVParams {
  filters?: GetAllRoomsParams;
  user?: string;
}

// ----------------------------------------------------------------------
// 📨 Response Interfaces (mirror backend IPC format)
// ----------------------------------------------------------------------

export interface BaseResponse<T = any> {
  status: boolean;
  message: string;
  data: T | null;
}

export interface RoomResponse extends BaseResponse<Room> {}
export interface RoomsResponse extends BaseResponse<Room[]> {}
export interface AvailableRoomsResponse extends BaseResponse<Room[]> {}
export interface SearchRoomsResponse extends BaseResponse<Room[]> {}

export interface RoomSummary {
  totalRooms: number;
  availableRooms: number;
  occupiedRooms: number;
  occupancyRate: string | number;
}

export interface RoomSummaryResponse extends BaseResponse<RoomSummary> {}

export interface RoomStats {
  totalRooms: number;
  availableRooms: number;
  occupiedRooms: number;
  occupancyRate: string | number;
  typeDistribution: Array<{ type: string; count: number }>;
  priceStats: {
    minPrice: number;
    maxPrice: number;
    avgPrice: number;
  };
}

export interface RoomStatsResponse extends BaseResponse<RoomStats> {}

export interface OccupancyResponse extends BaseResponse<{
  totalRooms: number;
  availableRooms: number;
  occupiedRooms: number;
  occupancyRate: string | number;
}> {}

export interface TypeDistributionResponse extends BaseResponse<
  Array<{ type: string; count: number }>
> {}

export interface BulkOperationResult {
  success: Array<{ id: number; roomNumber: string }>;
  failed: Array<{ id?: number; data?: any; error: string }>;
}

export interface BulkCreateResponse extends BaseResponse<BulkOperationResult> {}
export interface BulkUpdateResponse extends BaseResponse<BulkOperationResult> {}

export interface ImportCSVResult {
  imported: number;
  failed: Array<{ row: number; data: any; error: string }>;
}

export interface ImportCSVResponse extends BaseResponse<ImportCSVResult> {}

export interface ExportCSVResult {
  format: string;
  data: string;
  filename: string;
}

export interface ExportCSVResponse extends BaseResponse<ExportCSVResult> {}

// ----------------------------------------------------------------------
// 🧠 RoomAPI Class (frontend client for electron IPC "room" channel)
// ----------------------------------------------------------------------

class RoomAPI {
  // --------------------------------------------------------------------
  // 🔎 READ-ONLY METHODS
  // --------------------------------------------------------------------

  /**
   * Get all rooms with optional filtering and sorting.
   * @param params - Filter and sort options.
   */
  async getAll(params?: GetAllRoomsParams): Promise<RoomsResponse> {
    try {
      if (!window.backendAPI?.room) {
        throw new Error("Electron API (room) not available");
      }

      const response = await window.backendAPI.room({
        method: "getAllRooms",
        params: params || {},
      });

      if (response.status) {
        return response;
      }
      throw new Error(response.message || "Failed to fetch rooms");
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch rooms");
    }
  }

  /**
   * Get a single room by its ID.
   * @param id - Room ID.
   */
  async getById(id: number): Promise<RoomResponse> {
    try {
      if (!window.backendAPI?.room) {
        throw new Error("Electron API (room) not available");
      }

      const response = await window.backendAPI.room({
        method: "getRoomById",
        params: { id },
      });

      if (response.status) {
        return response;
      }
      throw new Error(response.message || "Failed to fetch room");
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch room");
    }
  }

  /**
   * Get a single room by its room number.
   * @param roomNumber - Unique room number.
   */
  async getByRoomNumber(roomNumber: string): Promise<RoomResponse> {
    try {
      if (!window.backendAPI?.room) {
        throw new Error("Electron API (room) not available");
      }

      const response = await window.backendAPI.room({
        method: "getRoomByNumber",
        params: { roomNumber },
      });

      if (response.status) {
        return response;
      }
      throw new Error(response.message || "Failed to fetch room by number");
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch room by number");
    }
  }

  /**
   * Get rooms available for a specific date range.
   * @param params - Check-in/out dates and optional filters.
   */
  async getAvailable(
    params: GetAvailableRoomsParams,
  ): Promise<AvailableRoomsResponse> {
    try {
      if (!window.backendAPI?.room) {
        throw new Error("Electron API (room) not available");
      }

      const response = await window.backendAPI.room({
        method: "getAvailableRooms",
        params,
      });

      if (response.status) {
        return response;
      }
      throw new Error(response.message || "Failed to fetch available rooms");
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch available rooms");
    }
  }

  /**
   * Get a lightweight summary of room statistics.
   */
  async getSummary(): Promise<RoomSummaryResponse> {
    try {
      if (!window.backendAPI?.room) {
        throw new Error("Electron API (room) not available");
      }

      const response = await window.backendAPI.room({
        method: "getRoomSummary",
        params: {},
      });

      if (response.status) {
        return response;
      }
      throw new Error(response.message || "Failed to fetch room summary");
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch room summary");
    }
  }

  /**
   * Retrieve all rooms that are currently marked as available.
   */
  async getActive(): Promise<RoomsResponse> {
    try {
      if (!window.backendAPI?.room) {
        throw new Error("Electron API (room) not available");
      }

      const response = await window.backendAPI.room({
        method: "getActiveRooms",
        params: {},
      });

      if (response.status) {
        return response;
      }
      throw new Error(response.message || "Failed to fetch active rooms");
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch active rooms");
    }
  }

  /**
   * Get comprehensive room statistics.
   */
  async getStats(): Promise<RoomStatsResponse> {
    try {
      if (!window.backendAPI?.room) {
        throw new Error("Electron API (room) not available");
      }

      const response = await window.backendAPI.room({
        method: "getRoomStats",
        params: {},
      });

      if (response.status) {
        return response;
      }
      throw new Error(response.message || "Failed to fetch room stats");
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch room stats");
    }
  }

  /**
   * Search rooms by a text query (room number, type, or amenities).
   * @param params - Object containing the search query.
   */
  async search(params: SearchRoomsParams): Promise<SearchRoomsResponse> {
    try {
      if (!window.backendAPI?.room) {
        throw new Error("Electron API (room) not available");
      }

      const response = await window.backendAPI.room({
        method: "searchRooms",
        params,
      });

      if (response.status) {
        return response;
      }
      throw new Error(response.message || "Failed to search rooms");
    } catch (error: any) {
      throw new Error(error.message || "Failed to search rooms");
    }
  }

  /**
   * Get current room occupancy statistics.
   */
  async getOccupancy(): Promise<OccupancyResponse> {
    try {
      if (!window.backendAPI?.room) {
        throw new Error("Electron API (room) not available");
      }

      const response = await window.backendAPI.room({
        method: "getRoomOccupancy",
        params: {},
      });

      if (response.status) {
        return response;
      }
      throw new Error(response.message || "Failed to fetch occupancy");
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch occupancy");
    }
  }

  /**
   * Get distribution of rooms by type.
   */
  async getTypeDistribution(): Promise<TypeDistributionResponse> {
    try {
      if (!window.backendAPI?.room) {
        throw new Error("Electron API (room) not available");
      }

      const response = await window.backendAPI.room({
        method: "getRoomTypeDistribution",
        params: {},
      });

      if (response.status) {
        return response;
      }
      throw new Error(
        response.message || "Failed to fetch room type distribution",
      );
    } catch (error: any) {
      throw new Error(
        error.message || "Failed to fetch room type distribution",
      );
    }
  }

  // --------------------------------------------------------------------
  // ✏️ WRITE OPERATIONS
  // --------------------------------------------------------------------

  /**
   * Create a new room.
   * @param params - Room data and optional username.
   */
  async create(params: CreateRoomParams): Promise<RoomResponse> {
    try {
      if (!window.backendAPI?.room) {
        throw new Error("Electron API (room) not available");
      }

      const response = await window.backendAPI.room({
        method: "createRoom",
        params,
      });

      if (response.status) {
        return response;
      }
      throw new Error(response.message || "Failed to create room");
    } catch (error: any) {
      throw new Error(error.message || "Failed to create room");
    }
  }

  /**
   * Update an existing room.
   * @param params - Room ID, updates, and optional username.
   */
  async update(params: UpdateRoomParams): Promise<RoomResponse> {
    try {
      if (!window.backendAPI?.room) {
        throw new Error("Electron API (room) not available");
      }

      const response = await window.backendAPI.room({
        method: "updateRoom",
        params,
      });

      if (response.status) {
        return response;
      }
      throw new Error(response.message || "Failed to update room");
    } catch (error: any) {
      throw new Error(error.message || "Failed to update room");
    }
  }

  /**
   * Delete a room (only if no active bookings).
   * @param params - Room ID and optional username.
   */
  async delete(params: DeleteRoomParams): Promise<BaseResponse<null>> {
    try {
      if (!window.backendAPI?.room) {
        throw new Error("Electron API (room) not available");
      }

      const response = await window.backendAPI.room({
        method: "deleteRoom",
        params,
      });

      if (response.status) {
        return response;
      }
      throw new Error(response.message || "Failed to delete room");
    } catch (error: any) {
      throw new Error(error.message || "Failed to delete room");
    }
  }

  /**
   * Set room availability using a boolean flag.
   * This toggles `isAvailable` and automatically sets `status` to
   * "available" (true) or "occupied" (false).
   *
   * @param params - Room ID, new availability flag, optional username.
   */
  async setAvailability(
    params: SetRoomAvailabilityParams,
  ): Promise<RoomResponse> {
    try {
      if (!window.backendAPI?.room) {
        throw new Error("Electron API (room) not available");
      }

      const response = await window.backendAPI.room({
        method: "setRoomAvailability",
        params,
      });

      if (response.status) {
        return response;
      }
      throw new Error(response.message || "Failed to set room availability");
    } catch (error: any) {
      throw new Error(error.message || "Failed to set room availability");
    }
  }

  /**
   * Update the room status using the exact enum value.
   * Allowed values: "available", "occupied", "maintenance".
   *
   * @param params - Room ID, new status, optional username.
   */
  async updateStatus(params: UpdateRoomStatusParams): Promise<RoomResponse> {
    try {
      if (!window.backendAPI?.room) {
        throw new Error("Electron API (room) not available");
      }

      const response = await window.backendAPI.room({
        method: "updateRoomStatus",
        params,
      });

      if (response.status) {
        return response;
      }
      throw new Error(response.message || "Failed to update room status");
    } catch (error: any) {
      throw new Error(error.message || "Failed to update room status");
    }
  }

  // --------------------------------------------------------------------
  // 🔄 BATCH OPERATIONS
  // --------------------------------------------------------------------

  /**
   * Create multiple rooms in one operation.
   * @param params - Array of room data and optional username.
   */
  async bulkCreate(params: BulkCreateRoomsParams): Promise<BulkCreateResponse> {
    try {
      if (!window.backendAPI?.room) {
        throw new Error("Electron API (room) not available");
      }

      const response = await window.backendAPI.room({
        method: "bulkCreateRooms",
        params,
      });

      if (response.status) {
        return response;
      }
      throw new Error(response.message || "Failed to bulk create rooms");
    } catch (error: any) {
      throw new Error(error.message || "Failed to bulk create rooms");
    }
  }

  /**
   * Bulk update multiple rooms.
   * @param params - Array of {id, updates} and optional username.
   */
  async bulkUpdate(params: BulkUpdateRoomsParams): Promise<BulkUpdateResponse> {
    try {
      if (!window.backendAPI?.room) {
        throw new Error("Electron API (room) not available");
      }

      const response = await window.backendAPI.room({
        method: "bulkUpdateRooms",
        params,
      });

      if (response.status) {
        return response;
      }
      throw new Error(response.message || "Failed to bulk update rooms");
    } catch (error: any) {
      throw new Error(error.message || "Failed to bulk update rooms");
    }
  }

  /**
   * Import rooms from a CSV string.
   * @param params - Raw CSV data and optional username.
   */
  async importFromCSV(
    params: ImportRoomsFromCSVParams,
  ): Promise<ImportCSVResponse> {
    try {
      if (!window.backendAPI?.room) {
        throw new Error("Electron API (room) not available");
      }

      const response = await window.backendAPI.room({
        method: "importRoomsFromCSV",
        params,
      });

      if (response.status) {
        return response;
      }
      throw new Error(response.message || "Failed to import rooms from CSV");
    } catch (error: any) {
      throw new Error(error.message || "Failed to import rooms from CSV");
    }
  }

  /**
   * Export rooms to a CSV file.
   * @param params - Optional filters and username.
   */
  async exportToCSV(
    params?: ExportRoomsToCSVParams,
  ): Promise<ExportCSVResponse> {
    try {
      if (!window.backendAPI?.room) {
        throw new Error("Electron API (room) not available");
      }

      const response = await window.backendAPI.room({
        method: "exportRoomsToCSV",
        params: params || {},
      });

      if (response.status) {
        return response;
      }
      throw new Error(response.message || "Failed to export rooms to CSV");
    } catch (error: any) {
      throw new Error(error.message || "Failed to export rooms to CSV");
    }
  }

  // --------------------------------------------------------------------
  // 🧰 UTILITY METHODS (simplified wrappers)
  // --------------------------------------------------------------------

  /**
   * Check if the backend room API is available.
   */
  async isAvailable(): Promise<boolean> {
    return !!window.backendAPI?.room;
  }

  /**
   * Check if there is at least one room.
   */
  async hasRooms(): Promise<boolean> {
    try {
      const response = await this.getAll({ limit: 1 } as any);
      return response.data ? response.data.length > 0 : false;
    } catch (error) {
      console.error("Error checking rooms existence:", error);
      return false;
    }
  }

  /**
   * Get the latest created room (by ID or createdAt).
   */
  async getLatestRoom(): Promise<Room | null> {
    try {
      const response = await this.getAll({ sortBy: "id", sortOrder: "DESC" });
      return response.data && response.data.length > 0
        ? response.data[0]
        : null;
    } catch (error) {
      console.error("Error fetching latest room:", error);
      return null;
    }
  }
}

// ----------------------------------------------------------------------
// 📤 Export singleton instance
// ----------------------------------------------------------------------

const roomAPI = new RoomAPI();
export default roomAPI;

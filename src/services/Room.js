//@ts-check
const { AppDataSource } = require("../main/db/datasource");
const { Room } = require("../entities/Room");

const { validateRoomData } = require("../utils/validation");
const auditLogger = require("../utils/auditLogger");

class RoomService {
  constructor() {
    this.repository = null;
  }

  async initialize() {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    this.repository = AppDataSource.getRepository(Room);
    console.log("RoomService initialized");
  }

  /**
   * Get repository instance
   */
  async getRepository() {
    if (!this.repository) {
      await this.initialize();
    }
    return this.repository;
  }

  /**
   * Create a new room
   * @param {Object} roomData - Room data
   * @param {string} user - User performing the action
   * @returns {Promise<Room>} Created room
   */
  async create(roomData, user = "system") {
    
    const { saveDb, updateDb } = require("../utils/dbUtils/dbActions");
    try {
      const repo = await this.getRepository();

      // Validate room data
      const validation = validateRoomData(roomData);
      // @ts-ignore
      if (!validation.valid) {
        // @ts-ignore
        throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
      }

      // Normalize room number (case-insensitive check)
      // @ts-ignore
      const normalizedRoomNumber = roomData.roomNumber.trim().toUpperCase();

      // Check if room number already exists
      // @ts-ignore
      const existingRoom = await repo.findOne({
        where: { roomNumber: normalizedRoomNumber },
      });
      if (existingRoom) {
        // @ts-ignore
        throw new Error(`Room number ${roomData.roomNumber} already exists`);
      }

      // Determine status and isAvailable
      // @ts-ignore
      const status = roomData.status || "available";
      const isAvailable =
        // @ts-ignore
        roomData.isAvailable !== undefined
          ? // @ts-ignore
            roomData.isAvailable
          : status === "available"; // default: true if status = available

      // Create room with defaults
      // @ts-ignore
      const room = repo.create({
        ...roomData,
        roomNumber: normalizedRoomNumber,
        status,
        isAvailable,
        createdAt: new Date(),
      });

      // @ts-ignore
      const savedRoom = await saveDb(repo, room);

      // Log audit trail
      await auditLogger.logCreate("Room", savedRoom.id, savedRoom, user);

      console.log(
        `Room created: ${savedRoom.roomNumber} (ID: ${savedRoom.id})`,
      );
      // @ts-ignore
      return savedRoom;
    } catch (error) {
      // @ts-ignore
      console.error("Failed to create room:", error.message);
      throw error;
    }
  }

  /**
   * Update an existing room
   * @param {number} id - Room ID
   * @param {Object} roomData - Updated room data
   * @param {string} user - User performing the action
   * @returns {Promise<Room>} Updated room
   */
  async update(id, roomData, user = "system") {
    
    const { saveDb, updateDb } = require("../utils/dbUtils/dbActions");
    try {
      const repo = await this.getRepository();

      // Find existing room with bookings
      // @ts-ignore
      const existingRoom = await repo.findOne({
        where: { id },
        relations: ["bookings"],
      });
      if (!existingRoom) {
        throw new Error(`Room with ID ${id} not found`);
      }

      const oldData = { ...existingRoom };

      // Normalize room number if provided
      // @ts-ignore
      if (roomData.roomNumber) {
        // @ts-ignore
        roomData.roomNumber = roomData.roomNumber.trim().toUpperCase();
      }

      // If room number is being changed, check for duplicates
      if (
        // @ts-ignore
        roomData.roomNumber &&
        // @ts-ignore
        roomData.roomNumber !== existingRoom.roomNumber
      ) {
        // @ts-ignore
        const duplicateRoom = await repo.findOne({
          // @ts-ignore
          where: { roomNumber: roomData.roomNumber },
        });
        if (duplicateRoom) {
          // @ts-ignore
          throw new Error(`Room number ${roomData.roomNumber} already exists`);
        }
      }

      // Rule: cannot reduce capacity below current setting if active bookings exist
      // @ts-ignore
      if (roomData.capacity && roomData.capacity < existingRoom.capacity) {
        // @ts-ignore
        const hasActiveBookings = existingRoom.bookings.some((b) =>
          ["confirmed", "checked_in"].includes(b.status),
        );
        if (hasActiveBookings) {
          throw new Error(
            "Cannot reduce room capacity while active bookings exist",
          );
        }
      }

      // Rule: cannot set status = "available" if active bookings exist
      // @ts-ignore
      if (roomData.status === "available") {
        // @ts-ignore
        const hasActiveBookings = existingRoom.bookings.some((b) =>
          ["confirmed", "checked_in"].includes(b.status),
        );
        if (hasActiveBookings) {
          throw new Error(
            "Cannot mark room as available while active bookings exist",
          );
        }
      }

      // Sync status & isAvailable if either is being updated
      // @ts-ignore
      if (roomData.status !== undefined || roomData.isAvailable !== undefined) {
        // If status is explicitly changed, derive isAvailable
        // @ts-ignore
        if (roomData.status !== undefined) {
          // @ts-ignore
          roomData.isAvailable = roomData.status === "available";
        }
        // If isAvailable is explicitly changed (and status not already set), derive status
        // @ts-ignore
        else if (roomData.isAvailable !== undefined) {
          // @ts-ignore
          roomData.status = roomData.isAvailable ? "available" : "occupied";
        }
      }

      // Validate updated data if provided
      const validationData = { ...existingRoom, ...roomData };
      const validation = validateRoomData(validationData, true);
      // @ts-ignore
      if (!validation.valid) {
        // @ts-ignore
        throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
      }

      // Merge updates
      // @ts-ignore
      const updatedRoom = repo.merge(existingRoom, roomData);

      // @ts-ignore
      const savedRoom = await updateDb(repo, updatedRoom);

      // Log audit trail
      await auditLogger.logUpdate("Room", id, oldData, savedRoom, user);

      console.log(`Room updated: ${savedRoom.roomNumber} (ID: ${id})`);
      // @ts-ignore
      return savedRoom;
    } catch (error) {
      // @ts-ignore
      console.error("Failed to update room:", error.message);
      throw error;
    }
  }

  /**
   * Delete a room
   * @param {number} id - Room ID
   * @param {string} user - User performing the action
   * @returns {Promise<boolean>} Success status
   */
  async delete(id, user = "system") {
    
    const { saveDb, updateDb } = require("../utils/dbUtils/dbActions");
    try {
      const repo = await this.getRepository();

      // Find room
      // @ts-ignore
      const room = await repo.findOne({
        where: { id },
        relations: ["bookings"],
      });

      if (!room) {
        throw new Error(`Room with ID ${id} not found`);
      }

      // Check if room has active bookings
      const hasActiveBookings =
        // @ts-ignore
        room.bookings &&
        // @ts-ignore
        room.bookings.some(
          // @ts-ignore
          (booking) =>
            booking.status === "confirmed" || booking.status === "checked_in",
        );

      if (hasActiveBookings) {
        throw new Error(
          `Cannot delete room ${room.roomNumber} with active bookings`,
        );
      }

      // Store room data for audit log
      const roomData = { ...room };

      // Delete room (cascade will delete associated bookings)
      // @ts-ignore
      await repo.remove(room);

      // Log audit trail
      await auditLogger.logDelete("Room", id, roomData, user);

      console.log(`Room deleted: ${roomData.roomNumber} (ID: ${id})`);
      return true;
    } catch (error) {
      // @ts-ignore
      console.error("Failed to delete room:", error.message);
      throw error;
    }
  }

  /**
   * Find room by ID
   * @param {number} id - Room ID
   * @returns {Promise<Room>} Room object
   */
  async findById(id) {
    try {
      const repo = await this.getRepository();
      // @ts-ignore
      const room = await repo.findOne({
        where: { id },
        relations: ["bookings"],
      });

      if (!room) {
        throw new Error(`Room with ID ${id} not found`);
      }

      // Log view action
      // @ts-ignore
      await auditLogger.logView("Room", id, "system");

      // @ts-ignore
      return room;
    } catch (error) {
      // @ts-ignore
      console.error("Failed to find room:", error.message);
      throw error;
    }
  }

  /**
   * Find room by room number
   * @param {string} roomNumber - Room number
   * @returns {Promise<Room>} Room object
   */
  async findByRoomNumber(roomNumber) {
    try {
      const repo = await this.getRepository();
      // @ts-ignore
      const room = await repo.findOne({
        where: { roomNumber },
        relations: ["bookings"],
      });

      if (!room) {
        throw new Error(`Room ${roomNumber} not found`);
      }

      // @ts-ignore
      return room;
    } catch (error) {
      // @ts-ignore
      console.error("Failed to find room by number:", error.message);
      throw error;
    }
  }

  /**
   * Get all rooms with optional filtering
   * @param {Object} options - Filter options
   * @param {string} options.type - Filter by room type
   * @param {number} options.minCapacity - Minimum capacity
   * @param {number} options.maxPrice - Maximum price per night
   * @param {boolean} options.availableOnly - Show only available rooms
   * @param {string} options.sortBy - Sort field
   * @param {string} options.status - Filter by room status
   * @param {string} options.sortOrder - 'ASC' or 'DESC'
   * @returns {Promise<Room[]>} Array of rooms
   */
  // @ts-ignore
  async findAll(options = {}) {
    
    const { saveDb, updateDb } = require("../utils/dbUtils/dbActions");
    try {
      const repo = await this.getRepository();
      // @ts-ignore
      const queryBuilder = repo.createQueryBuilder("room");

      // Join related entities
      queryBuilder
        .leftJoinAndSelect("room.bookings", "bookings")
        .leftJoinAndSelect("bookings.guest", "guest");

      // Apply filters
      if (options.type) {
        queryBuilder.andWhere("room.type = :type", { type: options.type });
      }

      if (options.minCapacity) {
        queryBuilder.andWhere("room.capacity >= :minCapacity", {
          minCapacity: options.minCapacity,
        });
      }

      if (options.maxPrice) {
        queryBuilder.andWhere("room.pricePerNight <= :maxPrice", {
          maxPrice: options.maxPrice,
        });
      }

      if (options.availableOnly === true) {
        queryBuilder.andWhere("room.isAvailable = :available", {
          available: true,
        });
      }

      if (options.status) {
        queryBuilder.andWhere("room.status = :status", {
          status: options.status,
        });
      }

      // Apply sorting
      if (options.sortBy) {
        const order = options.sortOrder === "DESC" ? "DESC" : "ASC";
        queryBuilder.orderBy(`room.${options.sortBy}`, order);
      } else {
        queryBuilder.orderBy("room.roomNumber", "ASC");
      }

      const rooms = await queryBuilder.getMany();

      // Log view action
      await auditLogger.logView("Room", null, "system");

      // @ts-ignore
      return rooms;
    } catch (error) {
      console.error("Failed to fetch rooms:", error);
      throw error;
    }
  }

  /**
   * Get available rooms for date range
   * @param {string} checkInDate - Check-in date (YYYY-MM-DD)
   * @param {string} checkOutDate - Check-out date (YYYY-MM-DD)
   * @param {Object} filters - Additional filters
   * @returns {Promise<Room[]>} Available rooms
   */
  async getAvailableRooms(checkInDate, checkOutDate, filters = {}) {
    try {
      const repo = await this.getRepository();

      // Build query for available rooms
      const query = `
        SELECT r.* FROM rooms r
        WHERE r.isAvailable = 1
        AND r.id NOT IN (
          SELECT b.roomId FROM bookings b
          WHERE b.status IN ('confirmed', 'checked_in')
          AND (
            (b.checkInDate <= :checkOutDate AND b.checkOutDate >= :checkInDate)
          )
        )
        ${
          // @ts-ignore
          filters.type
            ? "AND r.type = :type"
            : ""
        }
        ${
          // @ts-ignore
          filters.minCapacity
            ? "AND r.capacity >= :minCapacity"
            : ""
        }
        ${
          // @ts-ignore
          filters.maxPrice
            ? "AND r.pricePerNight <= :maxPrice"
            : ""
        }
        ORDER BY r.roomNumber ASC
      `;

      // @ts-ignore
      const rooms = await repo.query(query, {
        // @ts-ignore
        checkInDate,
        checkOutDate,
        // @ts-ignore
        type: filters.type,
        // @ts-ignore
        minCapacity: filters.minCapacity,
        // @ts-ignore
        maxPrice: filters.maxPrice,
      });

      console.log(
        `Found ${rooms.length} available rooms for ${checkInDate} to ${checkOutDate}`,
      );
      return rooms;
    } catch (error) {
      console.error("Failed to get available rooms:", error);
      throw error;
    }
  }

  /**
   * Toggle room availability
   * @param {number} id - Room ID
   * @param {boolean} isAvailable - New availability status
   * @param {string} user - User performing the action
   * @returns {Promise<Room>} Updated room
   */
  async setAvailability(id, isAvailable, user = "system") {
    
    const { saveDb, updateDb } = require("../utils/dbUtils/dbActions");
    try {
      const repo = await this.getRepository();

      // @ts-ignore
      const room = await repo.findOne({ where: { id } });
      if (!room) {
        throw new Error(`Room with ID ${id} not found`);
      }

      // Store old data for audit
      const oldData = { ...room };

      // Update both fields to stay consistent
      room.isAvailable = isAvailable;
      room.status = isAvailable ? "available" : "occupied";

      // @ts-ignore
      const updatedRoom = await updateDb(repo, room);

      // Log audit trail
      await auditLogger.logUpdate("Room", id, oldData, updatedRoom, user);

      console.log(
        `Room ${room.roomNumber} availability set to: ${isAvailable}`,
      );
      // @ts-ignore
      return updatedRoom;
    } catch (error) {
      console.error("Failed to set room availability:", error);
      throw error;
    }
  }

  /**
   * Get room statistics
   * @returns {Promise<Object>} Room statistics
   */
  async getStatistics() {
    try {
      const repo = await this.getRepository();

      // @ts-ignore
      const totalRooms = await repo.count();
      // @ts-ignore
      const availableRooms = await repo.count({ where: { isAvailable: true } });
      const occupiedRooms = totalRooms - availableRooms;

      // Get room type distribution
      const typeQuery = `
        SELECT type, COUNT(*) as count
        FROM rooms
        GROUP BY type
        ORDER BY count DESC
      `;
      // @ts-ignore
      const typeDistribution = await repo.query(typeQuery);

      // Get price statistics
      const priceQuery = `
        SELECT 
          MIN(pricePerNight) as minPrice,
          MAX(pricePerNight) as maxPrice,
          AVG(pricePerNight) as avgPrice
        FROM rooms
      `;
      // @ts-ignore
      const priceStats = await repo.query(priceQuery);

      return {
        totalRooms,
        availableRooms,
        occupiedRooms,
        occupancyRate:
          totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(2) : 0,
        typeDistribution,
        priceStats: priceStats[0],
      };
    } catch (error) {
      console.error("Failed to get room statistics:", error);
      throw error;
    }
  }

  /**
   * Export rooms to CSV/JSON
   * @param {string} format - 'csv' or 'json'
   * @param {Object} filters - Export filters
   * @param {string} user - User performing export
   * @returns {Promise<Object>} Export data
   */
  async exportRooms(format = "json", filters = {}, user = "system") {
    try {
      // @ts-ignore
      const rooms = await this.findAll(filters);

      let exportData;
      if (format === "csv") {
        // Convert to CSV
        const headers = [
          "Room Number",
          "Type",
          "Capacity",
          "Price",
          "Status", // now using actual status
          "Amenities",
        ];
        const rows = rooms.map((room) => [
          // @ts-ignore
          room.roomNumber,
          // @ts-ignore
          room.type,
          // @ts-ignore
          room.capacity,
          // @ts-ignore
          room.pricePerNight,
          // @ts-ignore
          room.status, // export the real status value
          // @ts-ignore
          room.amenities || "N/A",
        ]);

        exportData = {
          format: "csv",
          data: [headers, ...rows].map((row) => row.join(",")).join("\n"),
          filename: `rooms_export_${new Date().toISOString().split("T")[0]}.csv`,
        };
      } else {
        // JSON format
        exportData = {
          format: "json",
          data: rooms,
          filename: `rooms_export_${new Date().toISOString().split("T")[0]}.json`,
        };
      }

      // Log export action
      // @ts-ignore
      await auditLogger.logExport("Room", format, filters, user);

      console.log(`Exported ${rooms.length} rooms in ${format} format`);
      return exportData;
    } catch (error) {
      console.error("Failed to export rooms:", error);
      throw error;
    }
  }

  /**
   * Bulk update rooms (for maintenance, price changes, etc.)
   * @param {string} user - User performing bulk update
   * @returns {Promise<Object>} Results
   * @param {string | any[]} updates
   */
  async bulkUpdate(updates, user = "system") {
    
    const { saveDb, updateDb } = require("../utils/dbUtils/dbActions");
    try {
      // @ts-ignore
      const repo = await this.getRepository();
      const results = {
        success: [],
        failed: [],
      };

      for (const update of updates) {
        try {
          const room = await this.update(update.id, update.updates, user);
          // @ts-ignore
          results.success.push({
            id: update.id,
            // @ts-ignore
            roomNumber: room.roomNumber,
            updates: update.updates,
          });
        } catch (error) {
          // @ts-ignore
          results.failed.push({
            id: update.id,
            // @ts-ignore
            error: error.message,
          });
        }
      }

      // Log bulk action
      await auditLogger.log({
        action: "BULK_UPDATE",
        entity: "Room",
        // @ts-ignore
        entityId: null,
        newData: {
          total: updates.length,
          success: results.success.length,
          failed: results.failed.length,
        },
        user,
      });

      console.log(
        `Bulk update completed: ${results.success.length} successful, ${results.failed.length} failed`,
      );
      return results;
    } catch (error) {
      console.error("Failed to perform bulk update:", error);
      throw error;
    }
  }
}

// Create singleton instance
const roomService = new RoomService();

module.exports = roomService;

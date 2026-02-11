
const { AppDataSource } = require('../main/db/datasource');
const { Room } = require('../entities/Room');
const auditLogger = require('../utils/auditLogger');
const { validateRoomData } = require('../utils/validation');

class RoomService {
  constructor() {
    this.repository = null;
  }

  async initialize() {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    this.repository = AppDataSource.getRepository(Room);
    console.log('RoomService initialized');
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
  async create(roomData, user = 'system') {
    try {
      const repo = await this.getRepository();
      
      // Validate room data
      const validation = validateRoomData(roomData);
      if (!validation.valid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // Check if room number already exists
      const existingRoom = await repo.findOne({ 
        where: { roomNumber: roomData.roomNumber } 
      });
      
      if (existingRoom) {
        throw new Error(`Room number ${roomData.roomNumber} already exists`);
      }

      // Create room
      const room = repo.create({
        ...roomData,
        isAvailable: roomData.isAvailable !== undefined ? roomData.isAvailable : true,
        createdAt: new Date()
      });

      const savedRoom = await repo.save(room);
      
      // Log audit trail
      await auditLogger.logCreate('Room', savedRoom.id, savedRoom, user);
      
      console.log(`Room created: ${savedRoom.roomNumber} (ID: ${savedRoom.id})`);
      return savedRoom;
    } catch (error) {
      console.error('Failed to create room:', error.message);
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
  async update(id, roomData, user = 'system') {
    try {
      const repo = await this.getRepository();
      
      // Find existing room
      const existingRoom = await repo.findOne({ where: { id } });
      if (!existingRoom) {
        throw new Error(`Room with ID ${id} not found`);
      }

      // If room number is being changed, check for duplicates
      if (roomData.roomNumber && roomData.roomNumber !== existingRoom.roomNumber) {
        const duplicateRoom = await repo.findOne({ 
          where: { roomNumber: roomData.roomNumber } 
        });
        if (duplicateRoom) {
          throw new Error(`Room number ${roomData.roomNumber} already exists`);
        }
      }

      // Validate updated data if provided
      if (roomData.roomNumber || roomData.pricePerNight || roomData.capacity) {
        const validationData = { ...existingRoom, ...roomData };
        const validation = validateRoomData(validationData, true);
        if (!validation.valid) {
          throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
        }
      }

      // Update room
      const updatedRoom = repo.merge(existingRoom, {
        ...roomData,
        updatedAt: new Date()
      });

      const savedRoom = await repo.save(updatedRoom);
      
      // Log audit trail
      await auditLogger.logUpdate('Room', id, existingRoom, savedRoom, user);
      
      console.log(`Room updated: ${savedRoom.roomNumber} (ID: ${id})`);
      return savedRoom;
    } catch (error) {
      console.error('Failed to update room:', error.message);
      throw error;
    }
  }

  /**
   * Delete a room
   * @param {number} id - Room ID
   * @param {string} user - User performing the action
   * @returns {Promise<boolean>} Success status
   */
  async delete(id, user = 'system') {
    try {
      const repo = await this.getRepository();
      
      // Find room
      const room = await repo.findOne({ 
        where: { id },
        relations: ['bookings'] 
      });
      
      if (!room) {
        throw new Error(`Room with ID ${id} not found`);
      }

      // Check if room has active bookings
      const hasActiveBookings = room.bookings && room.bookings.some(
        booking => booking.status === 'confirmed' || booking.status === 'checked_in'
      );
      
      if (hasActiveBookings) {
        throw new Error(`Cannot delete room ${room.roomNumber} with active bookings`);
      }

      // Store room data for audit log
      const roomData = { ...room };
      
      // Delete room (cascade will delete associated bookings)
      await repo.remove(room);
      
      // Log audit trail
      await auditLogger.logDelete('Room', id, roomData, user);
      
      console.log(`Room deleted: ${roomData.roomNumber} (ID: ${id})`);
      return true;
    } catch (error) {
      console.error('Failed to delete room:', error.message);
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
      const room = await repo.findOne({ 
        where: { id },
        relations: ['bookings'] 
      });
      
      if (!room) {
        throw new Error(`Room with ID ${id} not found`);
      }
      
      // Log view action
      await auditLogger.logView('Room', id, 'system');
      
      return room;
    } catch (error) {
      console.error('Failed to find room:', error.message);
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
      const room = await repo.findOne({ 
        where: { roomNumber },
        relations: ['bookings'] 
      });
      
      if (!room) {
        throw new Error(`Room ${roomNumber} not found`);
      }
      
      return room;
    } catch (error) {
      console.error('Failed to find room by number:', error.message);
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
   * @param {string} options.sortOrder - 'ASC' or 'DESC'
   * @returns {Promise<Room[]>} Array of rooms
   */
  async findAll(options = {}) {
    try {
      const repo = await this.getRepository();
      const queryBuilder = repo.createQueryBuilder('room');
      
      // Apply filters
      if (options.type) {
        queryBuilder.andWhere('room.type = :type', { type: options.type });
      }
      
      if (options.minCapacity) {
        queryBuilder.andWhere('room.capacity >= :minCapacity', { 
          minCapacity: options.minCapacity 
        });
      }
      
      if (options.maxPrice) {
        queryBuilder.andWhere('room.pricePerNight <= :maxPrice', { 
          maxPrice: options.maxPrice 
        });
      }
      
      if (options.availableOnly === true) {
        queryBuilder.andWhere('room.isAvailable = :available', { available: true });
      }
      
      // Apply sorting
      if (options.sortBy) {
        const order = options.sortOrder === 'DESC' ? 'DESC' : 'ASC';
        queryBuilder.orderBy(`room.${options.sortBy}`, order);
      } else {
        queryBuilder.orderBy('room.roomNumber', 'ASC');
      }
      
      const rooms = await queryBuilder.getMany();
      
      // Log view action
      await auditLogger.logView('Room', null, 'system');
      
      return rooms;
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
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
        ${filters.type ? 'AND r.type = :type' : ''}
        ${filters.minCapacity ? 'AND r.capacity >= :minCapacity' : ''}
        ${filters.maxPrice ? 'AND r.pricePerNight <= :maxPrice' : ''}
        ORDER BY r.roomNumber ASC
      `;
      
      const rooms = await repo.query(query, {
        checkInDate,
        checkOutDate,
        type: filters.type,
        minCapacity: filters.minCapacity,
        maxPrice: filters.maxPrice
      });
      
      console.log(`Found ${rooms.length} available rooms for ${checkInDate} to ${checkOutDate}`);
      return rooms;
    } catch (error) {
      console.error('Failed to get available rooms:', error);
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
  async setAvailability(id, isAvailable, user = 'system') {
    try {
      const repo = await this.getRepository();
      
      const room = await repo.findOne({ where: { id } });
      if (!room) {
        throw new Error(`Room with ID ${id} not found`);
      }
      
      // Store old data for audit
      const oldData = { ...room };
      
      // Update availability
      room.isAvailable = isAvailable;
      room.updatedAt = new Date();
      
      const updatedRoom = await repo.save(room);
      
      // Log audit trail
      await auditLogger.logUpdate('Room', id, oldData, updatedRoom, user);
      
      console.log(`Room ${room.roomNumber} availability set to: ${isAvailable}`);
      return updatedRoom;
    } catch (error) {
      console.error('Failed to set room availability:', error);
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
      
      const totalRooms = await repo.count();
      const availableRooms = await repo.count({ where: { isAvailable: true } });
      const occupiedRooms = totalRooms - availableRooms;
      
      // Get room type distribution
      const typeQuery = `
        SELECT type, COUNT(*) as count
        FROM rooms
        GROUP BY type
        ORDER BY count DESC
      `;
      const typeDistribution = await repo.query(typeQuery);
      
      // Get price statistics
      const priceQuery = `
        SELECT 
          MIN(pricePerNight) as minPrice,
          MAX(pricePerNight) as maxPrice,
          AVG(pricePerNight) as avgPrice
        FROM rooms
      `;
      const priceStats = await repo.query(priceQuery);
      
      return {
        totalRooms,
        availableRooms,
        occupiedRooms,
        occupancyRate: totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(2) : 0,
        typeDistribution,
        priceStats: priceStats[0]
      };
    } catch (error) {
      console.error('Failed to get room statistics:', error);
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
  async exportRooms(format = 'json', filters = {}, user = 'system') {
    try {
      const rooms = await this.findAll(filters);
      
      let exportData;
      if (format === 'csv') {
        // Convert to CSV
        const headers = ['Room Number', 'Type', 'Capacity', 'Price', 'Availability', 'Amenities'];
        const rows = rooms.map(room => [
          room.roomNumber,
          room.type,
          room.capacity,
          room.pricePerNight,
          room.isAvailable ? 'Available' : 'Occupied',
          room.amenities || 'N/A'
        ]);
        
        exportData = {
          format: 'csv',
          data: [headers, ...rows].map(row => row.join(',')).join('\n'),
          filename: `rooms_export_${new Date().toISOString().split('T')[0]}.csv`
        };
      } else {
        // JSON format
        exportData = {
          format: 'json',
          data: rooms,
          filename: `rooms_export_${new Date().toISOString().split('T')[0]}.json`
        };
      }
      
      // Log export action
      await auditLogger.logExport('Room', format, filters, user);
      
      console.log(`Exported ${rooms.length} rooms in ${format} format`);
      return exportData;
    } catch (error) {
      console.error('Failed to export rooms:', error);
      throw error;
    }
  }

  /**
   * Bulk update rooms (for maintenance, price changes, etc.)
   * @param {Array} updates - Array of update objects {id, updates}
   * @param {string} user - User performing bulk update
   * @returns {Promise<Object>} Results
   */
  async bulkUpdate(updates, user = 'system') {
    try {
      const repo = await this.getRepository();
      const results = {
        success: [],
        failed: []
      };
      
      for (const update of updates) {
        try {
          const room = await this.update(update.id, update.updates, user);
          results.success.push({
            id: update.id,
            roomNumber: room.roomNumber,
            updates: update.updates
          });
        } catch (error) {
          results.failed.push({
            id: update.id,
            error: error.message
          });
        }
      }
      
      // Log bulk action
      await auditLogger.log({
        action: 'BULK_UPDATE',
        entity: 'Room',
        entityId: null,
        newData: { total: updates.length, success: results.success.length, failed: results.failed.length },
        user
      });
      
      console.log(`Bulk update completed: ${results.success.length} successful, ${results.failed.length} failed`);
      return results;
    } catch (error) {
      console.error('Failed to perform bulk update:', error);
      throw error;
    }
  }
}

// Create singleton instance
const roomService = new RoomService();

module.exports = roomService;
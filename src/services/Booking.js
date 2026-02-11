// bookingService.js placeholder
const { AppDataSource } = require('../main/db/datasource');
const { Booking } = require('../entities/Booking');
const { Room } = require('../entities/Room');
const { Guest } = require('../entities/Guest');
const auditLogger = require('../utils/auditLogger');
const roomService = require('./Room');
const { validateBookingData, calculateTotalPrice } = require('../utils/bookingUtils');

class BookingService {
  constructor() {
    this.bookingRepository = null;
    this.roomRepository = null;
    this.guestRepository = null;
  }

  async initialize() {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    this.bookingRepository = AppDataSource.getRepository(Booking);
    this.roomRepository = AppDataSource.getRepository(Room);
    this.guestRepository = AppDataSource.getRepository(Guest);
    console.log('BookingService initialized');
  }

  async getRepositories() {
    if (!this.bookingRepository) {
      await this.initialize();
    }
    return {
      booking: this.bookingRepository,
      room: this.roomRepository,
      guest: this.guestRepository
    };
  }

  /**
   * Create a new booking
   * @param {Object} bookingData - Booking data
   * @param {string} user - User performing the action
   * @returns {Promise<Booking>} Created booking
   */
  async create(bookingData, user = 'system') {
    const { booking: bookingRepo, room: roomRepo, guest: guestRepo } = await this.getRepositories();
    
    try {
      // Validate booking data
      const validation = validateBookingData(bookingData);
      if (!validation.valid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      const { checkInDate, checkOutDate, roomId, guestData, numberOfGuests = 1 } = bookingData;

      // Check room exists and is available
      const room = await roomRepo.findOne({ 
        where: { id: roomId },
        relations: ['bookings']
      });
      
      if (!room) {
        throw new Error(`Room with ID ${roomId} not found`);
      }
      
      if (!room.isAvailable) {
        throw new Error(`Room ${room.roomNumber} is not available for booking`);
      }

      // Check room capacity
      if (numberOfGuests > room.capacity) {
        throw new Error(`Room ${room.roomNumber} capacity (${room.capacity}) exceeded by ${numberOfGuests} guests`);
      }

      // Check date availability
      const isAvailable = await this.checkRoomAvailability(roomId, checkInDate, checkOutDate);
      if (!isAvailable) {
        throw new Error(`Room ${room.roomNumber} is not available for the selected dates`);
      }

      // Find or create guest
      let guest;
      if (guestData.id) {
        // Existing guest
        guest = await guestRepo.findOne({ where: { id: guestData.id } });
        if (!guest) {
          throw new Error(`Guest with ID ${guestData.id} not found`);
        }
      } else {
        // New guest - check if email exists
        const existingGuest = await guestRepo.findOne({ where: { email: guestData.email } });
        if (existingGuest) {
          guest = existingGuest;
          console.log(`Using existing guest: ${guest.fullName}`);
        } else {
          // Create new guest
          guest = guestRepo.create({
            ...guestData,
            createdAt: new Date()
          });
          await guestRepo.save(guest);
          
          await auditLogger.logCreate('Guest', guest.id, guest, user);
          console.log(`New guest created: ${guest.fullName}`);
        }
      }

      // Calculate total price
      const nights = this.calculateNights(checkInDate, checkOutDate);
      const totalPrice = room.pricePerNight * nights;

      // Create booking
      const booking = bookingRepo.create({
        checkInDate,
        checkOutDate,
        numberOfGuests,
        totalPrice,
        status: 'confirmed',
        specialRequests: bookingData.specialRequests || null,
        room: room,
        guest: guest,
        createdAt: new Date()
      });

      const savedBooking = await bookingRepo.save(booking);
      
      // Log audit trail
      await auditLogger.logCreate('Booking', savedBooking.id, savedBooking, user);
      
      console.log(`Booking created: #${savedBooking.id} for ${guest.fullName} (Room: ${room.roomNumber})`);
      return savedBooking;
    } catch (error) {
      console.error('Failed to create booking:', error.message);
      throw error;
    }
  }

  /**
   * Check room availability for date range
   * @param {number} roomId - Room ID
   * @param {string} checkInDate - Check-in date (YYYY-MM-DD)
   * @param {string} checkOutDate - Check-out date (YYYY-MM-DD)
   * @param {number} excludeBookingId - Booking ID to exclude (for updates)
   * @returns {Promise<boolean>} True if available
   */
  async checkRoomAvailability(roomId, checkInDate, checkOutDate, excludeBookingId = null) {
    try {
      const { booking: bookingRepo } = await this.getRepositories();
      
      const query = bookingRepo.createQueryBuilder('booking')
        .where('booking.roomId = :roomId', { roomId })
        .andWhere('booking.status IN (:...statuses)', { 
          statuses: ['confirmed', 'checked_in'] 
        })
        .andWhere(
          '(booking.checkInDate < :checkOutDate AND booking.checkOutDate > :checkInDate)'
        );
      
      if (excludeBookingId) {
        query.andWhere('booking.id != :excludeBookingId', { excludeBookingId });
      }
      
      const conflictingBookings = await query.getCount();
      
      return conflictingBookings === 0;
    } catch (error) {
      console.error('Failed to check room availability:', error);
      throw error;
    }
  }

  /**
   * Calculate number of nights between dates
   * @param {string} checkInDate - Check-in date
   * @param {string} checkOutDate - Check-out date
   * @returns {number} Number of nights
   */
  calculateNights(checkInDate, checkOutDate) {
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const diffTime = Math.abs(checkOut - checkIn);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Update booking
   * @param {number} id - Booking ID
   * @param {Object} bookingData - Updated booking data
   * @param {string} user - User performing the action
   * @returns {Promise<Booking>} Updated booking
   */
  async update(id, bookingData, user = 'system') {
    const { booking: bookingRepo, room: roomRepo, guest: guestRepo } = await this.getRepositories();
    
    try {
      // Find existing booking with relations
      const existingBooking = await bookingRepo.findOne({
        where: { id },
        relations: ['room', 'guest']
      });
      
      if (!existingBooking) {
        throw new Error(`Booking with ID ${id} not found`);
      }

      // Store old data for audit
      const oldData = { ...existingBooking };

      // Check if booking can be modified
      if (existingBooking.status === 'checked_out' || existingBooking.status === 'cancelled') {
        throw new Error(`Cannot modify a ${existingBooking.status} booking`);
      }

      let roomChanged = false;
      let datesChanged = false;

      // Handle room change
      if (bookingData.roomId && bookingData.roomId !== existingBooking.room.id) {
        roomChanged = true;
        const newRoom = await roomRepo.findOne({ where: { id: bookingData.roomId } });
        if (!newRoom) {
          throw new Error(`Room with ID ${bookingData.roomId} not found`);
        }
        
        // Check new room availability
        const checkInDate = bookingData.checkInDate || existingBooking.checkInDate;
        const checkOutDate = bookingData.checkOutDate || existingBooking.checkOutDate;
        const isAvailable = await this.checkRoomAvailability(
          bookingData.roomId, 
          checkInDate, 
          checkOutDate, 
          id
        );
        
        if (!isAvailable) {
          throw new Error(`New room is not available for the selected dates`);
        }
        
        existingBooking.room = newRoom;
      }

      // Handle date change
      if (bookingData.checkInDate || bookingData.checkOutDate) {
        datesChanged = true;
        const checkInDate = bookingData.checkInDate || existingBooking.checkInDate;
        const checkOutDate = bookingData.checkOutDate || existingBooking.checkOutDate;
        
        // Validate new dates
        if (new Date(checkInDate) >= new Date(checkOutDate)) {
          throw new Error('Check-out date must be after check-in date');
        }
        
        // Check availability for new dates
        const roomId = bookingData.roomId || existingBooking.room.id;
        const isAvailable = await this.checkRoomAvailability(
          roomId, 
          checkInDate, 
          checkOutDate, 
          id
        );
        
        if (!isAvailable) {
          throw new Error(`Room is not available for the new dates`);
        }
        
        existingBooking.checkInDate = checkInDate;
        existingBooking.checkOutDate = checkOutDate;
      }

      // Handle guest info update
      if (bookingData.guestData) {
        const guest = existingBooking.guest;
        Object.assign(guest, bookingData.guestData);
        await guestRepo.save(guest);
      }

      // Update other fields
      if (bookingData.numberOfGuests !== undefined) {
        if (bookingData.numberOfGuests > existingBooking.room.capacity) {
          throw new Error(`Room capacity (${existingBooking.room.capacity}) exceeded`);
        }
        existingBooking.numberOfGuests = bookingData.numberOfGuests;
      }

      if (bookingData.specialRequests !== undefined) {
        existingBooking.specialRequests = bookingData.specialRequests;
      }

      // Recalculate price if room or dates changed
      if (roomChanged || datesChanged) {
        const nights = this.calculateNights(
          existingBooking.checkInDate,
          existingBooking.checkOutDate
        );
        existingBooking.totalPrice = existingBooking.room.pricePerNight * nights;
      }

      const savedBooking = await bookingRepo.save(existingBooking);
      
      // Log audit trail
      await auditLogger.logUpdate('Booking', id, oldData, savedBooking, user);
      
      console.log(`Booking updated: #${id}`);
      return savedBooking;
    } catch (error) {
      console.error('Failed to update booking:', error.message);
      throw error;
    }
  }

  /**
   * Cancel a booking
   * @param {number} id - Booking ID
   * @param {string} reason - Cancellation reason
   * @param {string} user - User performing the action
   * @returns {Promise<Booking>} Cancelled booking
   */
  async cancel(id, reason = null, user = 'system') {
    const { booking: bookingRepo } = await this.getRepositories();
    
    try {
      const booking = await bookingRepo.findOne({
        where: { id },
        relations: ['room', 'guest']
      });
      
      if (!booking) {
        throw new Error(`Booking with ID ${id} not found`);
      }

      if (booking.status === 'cancelled') {
        throw new Error('Booking is already cancelled');
      }

      if (booking.status === 'checked_out') {
        throw new Error('Cannot cancel a checked-out booking');
      }

      // Store old data for audit
      const oldData = { ...booking };
      
      // Update booking status
      booking.status = 'cancelled';
      if (reason) {
        booking.specialRequests = booking.specialRequests 
          ? `${booking.specialRequests}\nCancellation reason: ${reason}`
          : `Cancellation reason: ${reason}`;
      }
      
      const savedBooking = await bookingRepo.save(booking);
      
      // Log audit trail
      await auditLogger.logDelete('Booking', id, oldData, user);
      
      console.log(`Booking cancelled: #${id} for ${booking.guest.fullName}`);
      return savedBooking;
    } catch (error) {
      console.error('Failed to cancel booking:', error.message);
      throw error;
    }
  }

  /**
   * Check in guest
   * @param {number} id - Booking ID
   * @param {string} user - User performing the action
   * @returns {Promise<Booking>} Updated booking
   */
  async checkIn(id, user = 'system') {
    const { booking: bookingRepo } = await this.getRepositories();
    
    try {
      const booking = await bookingRepo.findOne({
        where: { id },
        relations: ['room', 'guest']
      });
      
      if (!booking) {
        throw new Error(`Booking with ID ${id} not found`);
      }

      if (booking.status !== 'confirmed') {
        throw new Error(`Cannot check in a ${booking.status} booking`);
      }

      const today = new Date().toISOString().split('T')[0];
      if (booking.checkInDate !== today) {
        console.warn(`Checking in early/late. Booking check-in date: ${booking.checkInDate}`);
      }

      // Store old data for audit
      const oldData = { ...booking };
      
      // Update booking status
      booking.status = 'checked_in';
      const savedBooking = await bookingRepo.save(booking);
      
      // Log audit trail
      await auditLogger.logUpdate('Booking', id, oldData, savedBooking, user);
      
      console.log(`Guest checked in: #${id} - ${booking.guest.fullName}`);
      return savedBooking;
    } catch (error) {
      console.error('Failed to check in:', error.message);
      throw error;
    }
  }

  /**
   * Check out guest
   * @param {number} id - Booking ID
   * @param {string} notes - Check-out notes
   * @param {string} user - User performing the action
   * @returns {Promise<Booking>} Updated booking
   */
  async checkOut(id, notes = null, user = 'system') {
    const { booking: bookingRepo } = await this.getRepositories();
    
    try {
      const booking = await bookingRepo.findOne({
        where: { id },
        relations: ['room', 'guest']
      });
      
      if (!booking) {
        throw new Error(`Booking with ID ${id} not found`);
      }

      if (booking.status !== 'checked_in') {
        throw new Error(`Cannot check out a ${booking.status} booking`);
      }

      // Store old data for audit
      const oldData = { ...booking };
      
      // Update booking status
      booking.status = 'checked_out';
      if (notes) {
        booking.specialRequests = booking.specialRequests 
          ? `${booking.specialRequests}\nCheck-out notes: ${notes}`
          : `Check-out notes: ${notes}`;
      }
      
      const savedBooking = await bookingRepo.save(booking);
      
      // Log audit trail
      await auditLogger.logUpdate('Booking', id, oldData, savedBooking, user);
      
      console.log(`Guest checked out: #${id} - ${booking.guest.fullName}`);
      return savedBooking;
    } catch (error) {
      console.error('Failed to check out:', error.message);
      throw error;
    }
  }

  /**
   * Find booking by ID
   * @param {number} id - Booking ID
   * @returns {Promise<Booking>} Booking object
   */
  async findById(id) {
    const { booking: bookingRepo } = await this.getRepositories();
    
    try {
      const booking = await bookingRepo.findOne({
        where: { id },
        relations: ['room', 'guest']
      });
      
      if (!booking) {
        throw new Error(`Booking with ID ${id} not found`);
      }
      
      // Log view action
      await auditLogger.logView('Booking', id, 'system');
      
      return booking;
    } catch (error) {
      console.error('Failed to find booking:', error.message);
      throw error;
    }
  }

  /**
   * Get all bookings with optional filters
   * @param {Object} options - Filter options
   * @returns {Promise<Booking[]>} Array of bookings
   */
  async findAll(options = {}) {
    const { booking: bookingRepo } = await this.getRepositories();
    
    try {
      const queryBuilder = bookingRepo.createQueryBuilder('booking')
        .leftJoinAndSelect('booking.room', 'room')
        .leftJoinAndSelect('booking.guest', 'guest');
      
      // Apply filters
      if (options.status) {
        queryBuilder.andWhere('booking.status = :status', { status: options.status });
      }
      
      if (options.roomId) {
        queryBuilder.andWhere('booking.roomId = :roomId', { roomId: options.roomId });
      }
      
      if (options.guestId) {
        queryBuilder.andWhere('booking.guestId = :guestId', { guestId: options.guestId });
      }
      
      if (options.checkInDate) {
        queryBuilder.andWhere('booking.checkInDate >= :checkInDate', { 
          checkInDate: options.checkInDate 
        });
      }
      
      if (options.checkOutDate) {
        queryBuilder.andWhere('booking.checkOutDate <= :checkOutDate', { 
          checkOutDate: options.checkOutDate 
        });
      }
      
      if (options.search) {
        queryBuilder.andWhere(
          '(guest.fullName LIKE :search OR guest.email LIKE :search OR guest.phone LIKE :search)',
          { search: `%${options.search}%` }
        );
      }
      
      // Apply sorting
      const sortBy = options.sortBy || 'createdAt';
      const sortOrder = options.sortOrder === 'ASC' ? 'ASC' : 'DESC';
      queryBuilder.orderBy(`booking.${sortBy}`, sortOrder);
      
      // Pagination
      if (options.page && options.limit) {
        const offset = (options.page - 1) * options.limit;
        queryBuilder.skip(offset).take(options.limit);
      }
      
      const bookings = await queryBuilder.getMany();
      
      // Log view action
      await auditLogger.logView('Booking', null, 'system');
      
      return bookings;
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      throw error;
    }
  }

  /**
   * Get booking summary/statistics
   * @returns {Promise<Object>} Booking statistics
   */
  async getStatistics() {
    const { booking: bookingRepo } = await this.getRepositories();
    
    try {
      // Get counts by status
      const statusCounts = await bookingRepo
        .createQueryBuilder('booking')
        .select('booking.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .groupBy('booking.status')
        .getRawMany();
      
      // Get revenue statistics
      const revenueQuery = await bookingRepo
        .createQueryBuilder('booking')
        .select([
          'SUM(booking.totalPrice) as totalRevenue',
          'AVG(booking.totalPrice) as averageBookingValue',
          'COUNT(*) as totalBookings'
        ])
        .where('booking.status IN (:...statuses)', {
          statuses: ['confirmed', 'checked_in', 'checked_out']
        })
        .getRawOne();
      
      // Get monthly trends
      const monthlyTrends = await bookingRepo
        .createQueryBuilder('booking')
        .select([
          "strftime('%Y-%m', booking.checkInDate) as month",
          'COUNT(*) as bookings',
          'SUM(booking.totalPrice) as revenue'
        ])
        .where('booking.checkInDate >= date("now", "-6 months")')
        .groupBy("strftime('%Y-%m', booking.checkInDate)")
        .orderBy('month', 'DESC')
        .getRawMany();
      
      // Get upcoming bookings
      const today = new Date().toISOString().split('T')[0];
      const upcomingBookings = await bookingRepo
        .createQueryBuilder('booking')
        .where('booking.checkInDate >= :today', { today })
        .andWhere('booking.status = :status', { status: 'confirmed' })
        .orderBy('booking.checkInDate', 'ASC')
        .getCount();
      
      return {
        statusCounts,
        revenue: {
          total: parseFloat(revenueQuery.totalRevenue) || 0,
          average: parseFloat(revenueQuery.averageBookingValue) || 0,
          totalBookings: parseInt(revenueQuery.totalBookings) || 0
        },
        monthlyTrends,
        upcomingBookings
      };
    } catch (error) {
      console.error('Failed to get booking statistics:', error);
      throw error;
    }
  }

  /**
   * Get today's arrivals, departures, and in-house guests
   * @returns {Promise<Object>} Today's operations
   */
  async getTodaysOperations() {
    const { booking: bookingRepo } = await this.getRepositories();
    const today = new Date().toISOString().split('T')[0];
    
    try {
      const arrivals = await bookingRepo
        .createQueryBuilder('booking')
        .leftJoinAndSelect('booking.room', 'room')
        .leftJoinAndSelect('booking.guest', 'guest')
        .where('booking.checkInDate = :today', { today })
        .andWhere('booking.status = :status', { status: 'confirmed' })
        .getMany();
      
      const departures = await bookingRepo
        .createQueryBuilder('booking')
        .leftJoinAndSelect('booking.room', 'room')
        .leftJoinAndSelect('booking.guest', 'guest')
        .where('booking.checkOutDate = :today', { today })
        .andWhere('booking.status IN (:...statuses)', {
          statuses: ['confirmed', 'checked_in']
        })
        .getMany();
      
      const inHouse = await bookingRepo
        .createQueryBuilder('booking')
        .leftJoinAndSelect('booking.room', 'room')
        .leftJoinAndSelect('booking.guest', 'guest')
        .where('booking.checkInDate <= :today', { today })
        .andWhere('booking.checkOutDate > :today', { today })
        .andWhere('booking.status = :status', { status: 'checked_in' })
        .getMany();
      
      return {
        arrivals,
        departures,
        inHouse,
        arrivalsCount: arrivals.length,
        departuresCount: departures.length,
        inHouseCount: inHouse.length
      };
    } catch (error) {
      console.error('Failed to get todays operations:', error);
      throw error;
    }
  }

  /**
   * Export bookings to CSV/JSON
   * @param {string} format - 'csv' or 'json'
   * @param {Object} filters - Export filters
   * @param {string} user - User performing export
   * @returns {Promise<Object>} Export data
   */
  async exportBookings(format = 'json', filters = {}, user = 'system') {
    try {
      const bookings = await this.findAll(filters);
      
      let exportData;
      if (format === 'csv') {
        // Convert to CSV
        const headers = [
          'Booking ID', 'Guest Name', 'Room Number', 'Check-In', 'Check-Out', 
          'Nights', 'Guests', 'Total Price', 'Status', 'Created Date'
        ];
        
        const rows = bookings.map(booking => [
          booking.id,
          booking.guest?.fullName || 'N/A',
          booking.room?.roomNumber || 'N/A',
          booking.checkInDate,
          booking.checkOutDate,
          this.calculateNights(booking.checkInDate, booking.checkOutDate),
          booking.numberOfGuests,
          booking.totalPrice,
          booking.status,
          new Date(booking.createdAt).toLocaleDateString()
        ]);
        
        exportData = {
          format: 'csv',
          data: [headers, ...rows].map(row => row.join(',')).join('\n'),
          filename: `bookings_export_${new Date().toISOString().split('T')[0]}.csv`
        };
      } else {
        // JSON format
        exportData = {
          format: 'json',
          data: bookings,
          filename: `bookings_export_${new Date().toISOString().split('T')[0]}.json`
        };
      }
      
      // Log export action
      await auditLogger.logExport('Booking', format, filters, user);
      
      console.log(`Exported ${bookings.length} bookings in ${format} format`);
      return exportData;
    } catch (error) {
      console.error('Failed to export bookings:', error);
      throw error;
    }
  }

  /**
   * Generate booking invoice/slip
   * @param {number} bookingId - Booking ID
   * @returns {Promise<Object>} Invoice data
   */
  async generateInvoice(bookingId) {
    try {
      const booking = await this.findById(bookingId);
      
      const invoice = {
        invoiceNumber: `INV-${booking.id.toString().padStart(6, '0')}`,
        date: new Date().toISOString().split('T')[0],
        bookingId: booking.id,
        guest: {
          name: booking.guest.fullName,
          email: booking.guest.email,
          phone: booking.guest.phone
        },
        room: {
          number: booking.room.roomNumber,
          type: booking.room.type,
          capacity: booking.room.capacity
        },
        stay: {
          checkIn: booking.checkInDate,
          checkOut: booking.checkOutDate,
          nights: this.calculateNights(booking.checkInDate, booking.checkOutDate),
          guests: booking.numberOfGuests
        },
        charges: [
          {
            description: `Room ${booking.room.roomNumber} (${booking.room.type})`,
            nights: this.calculateNights(booking.checkInDate, booking.checkOutDate),
            rate: booking.room.pricePerNight,
            amount: booking.totalPrice
          }
        ],
        subtotal: booking.totalPrice,
        tax: 0, // Add tax calculation if needed
        total: booking.totalPrice,
        status: booking.status,
        paymentStatus: 'pending', // You can add payment module later
        notes: booking.specialRequests
      };
      
      // Log invoice generation
      await auditLogger.log({
        action: 'GENERATE_INVOICE',
        entity: 'Booking',
        entityId: bookingId,
        newData: { invoiceNumber: invoice.invoiceNumber },
        user: 'system'
      });
      
      return invoice;
    } catch (error) {
      console.error('Failed to generate invoice:', error);
      throw error;
    }
  }
}

// Create singleton instance
const bookingService = new BookingService();

module.exports = bookingService;
// bookingService.js placeholder
//@ts-check
const { AppDataSource } = require("../main/db/datasource");

const {
  validateBookingData,
  // @ts-ignore
  calculateTotalPrice,
} = require("../utils/bookingUtils");
const auditLogger = require("../utils/auditLogger");

class BookingService {
  constructor() {
    this.bookingRepository = null;
    this.roomRepository = null;
    this.guestRepository = null;
  }

  async initialize() {
    const { Booking } = require("../entities/Booking");
    const { Room } = require("../entities/Room");
    const { Guest } = require("../entities/Guest");
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    this.bookingRepository = AppDataSource.getRepository(Booking);
    this.roomRepository = AppDataSource.getRepository(Room);
    this.guestRepository = AppDataSource.getRepository(Guest);
    console.log("BookingService initialized");
  }

  async getRepositories() {
    if (!this.bookingRepository) {
      await this.initialize();
    }
    return {
      booking: this.bookingRepository,
      room: this.roomRepository,
      guest: this.guestRepository,
    };
  }

  /**
   * Create a new booking
   * @param {Object} bookingData - Booking data
   * @param {string} user - User performing the action
   */
  async create(bookingData, user = "system") {
    const { updateDb, saveDb } = require("../utils/dbUtils/dbActions");
    const {
      booking: bookingRepo,
      room: roomRepo,
      guest: guestRepo,
    } = await this.getRepositories();

    try {
      // Validate booking data
      const validation = await validateBookingData(bookingData);
      // @ts-ignore
      if (!validation.valid) {
        // @ts-ignore
        throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
      }

      const {
        // @ts-ignore
        checkInDate,
        // @ts-ignore
        checkOutDate,
        // @ts-ignore
        roomId,
        // @ts-ignore
        guestData,
        // @ts-ignore
        numberOfGuests = 1,
      } = bookingData;

      console.log(
        `Creating booking: Room ID ${roomId}, Guest ${guestData.fullName}, Check-in ${checkInDate}, Check-out ${checkOutDate}, Guests ${numberOfGuests}`,
      );

      // Check room exists and availability
      // @ts-ignore
      const room = await roomRepo.findOne({
        where: { id: roomId },
      });
      if (!room) throw new Error(`Room with ID ${roomId} not found`);

      if (room.status !== "available") {
        throw new Error(`Room ${room.roomNumber} is not available for booking`);
      }

      // Capacity check
      // @ts-ignore
      if (numberOfGuests > room.capacity) {
        throw new Error(
          `Room ${room.roomNumber} capacity (${room.capacity}) exceeded by ${numberOfGuests} guests`,
        );
      }

      // Date availability check
      const isAvailable = await this.checkRoomAvailability(
        roomId,
        checkInDate,
        checkOutDate,
      );
      if (!isAvailable) {
        throw new Error(
          `Room ${room.roomNumber} is not available for the selected dates`,
        );
      }

      // Find or create guest
      let guest;
      if (guestData.id) {
        // @ts-ignore
        guest = await guestRepo.findOne({ where: { id: guestData.id } });
        if (!guest) throw new Error(`Guest with ID ${guestData.id} not found`);
      } else {
        const normalizedEmail = guestData.email.toLowerCase();
        // @ts-ignore
        const existingGuest = await guestRepo.findOne({
          where: { email: normalizedEmail },
        });
        if (existingGuest) {
          guest = existingGuest;
          console.log(`Using existing guest: ${guest.fullName}`);
        } else {
          // @ts-ignore
          guest = guestRepo.create({
            ...guestData,
            email: normalizedEmail,
            // @ts-ignore
            guestReference: generateGuestReference(),
            createdAt: new Date(),
          });
          // @ts-ignore
          await saveDb(guestRepo, guest);
          // @ts-ignore
          await auditLogger.logCreate("Guest", guest.id, guest, user);
          // @ts-ignore
          console.log(`New guest created: ${guest.fullName}`);
        }
      }

      // Calculate total price
      const nights = this.calculateNights(checkInDate, checkOutDate);
      // @ts-ignore
      const totalPrice = room.pricePerNight * nights;

      console.log(
        // @ts-ignore
        `Creating booking for ${guest.fullName} in room ${room.roomNumber} from ${checkInDate} to ${checkOutDate} (${nights} nights, $${totalPrice.toFixed(2)})`,
      );

      // Create booking
      // @ts-ignore
      const booking = bookingRepo.create({
        checkInDate: checkInDate,
        checkOutDate: checkOutDate,
        numberOfGuests: numberOfGuests,
        totalPrice: totalPrice,
        status: "pending",
        // @ts-ignore
        specialRequests: bookingData.specialRequests || null,
        room: room,
        guest: guest,
        createdAt: new Date(),
      });

      console.log(booking);

      // @ts-ignore
      const savedBooking = await saveDb(bookingRepo, booking);

      // Update room lifecycle
      // const oldRoomData = { ...room };
      // room.status = "occupied"; // use new enum field
      // @ts-ignore
      // const savedRoom = await updateDb(roomRepo, room);

      // Log audit trail
      // await auditLogger.logUpdate(
      //   "Room",
      //   room.id,
      //   oldRoomData,
      //   savedRoom,
      //   user,
      // );
      await auditLogger.logCreate(
        "Booking",
        // @ts-ignore
        savedBooking.id,
        savedBooking,
        user,
      );

      console.log(
        // @ts-ignore
        `Booking created: #${savedBooking.id} for ${guest.fullName} (Room: ${room.roomNumber})`,
      );
      // @ts-ignore
      return savedBooking;
    } catch (error) {
      // @ts-ignore
      console.error("Failed to create booking:", error.message);
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
  async checkRoomAvailability(
    roomId,
    // @ts-ignore
    checkInDate,
    // @ts-ignore
    checkOutDate,
    // @ts-ignore
    excludeBookingId = null,
  ) {
    try {
      const { booking: bookingRepo, room: roomRepo } =
        await this.getRepositories();

      // Step 1: Check global availability flag
      // @ts-ignore
      const room = await roomRepo.findOne({ where: { id: roomId } });
      if (!room) {
        throw new Error(`Room with ID ${roomId} not found`);
      }
      if (!room.isAvailable) {
        return false; // globally unavailable (maintenance, cleaning, etc.)
      }

      // Step 2: Check date overlaps with active bookings
      // @ts-ignore
      const query = bookingRepo
        .createQueryBuilder("booking")
        .where("booking.roomId = :roomId", { roomId })
        .andWhere("booking.status IN (:...statuses)", {
          statuses: ["confirmed", "checked_in"],
        })
        .andWhere(
          "(booking.checkInDate < :checkOutDate AND booking.checkOutDate > :checkInDate)",
        );

      if (excludeBookingId) {
        query.andWhere("booking.id != :excludeBookingId", { excludeBookingId });
      }

      const conflictingBookings = await query.getCount();

      return conflictingBookings === 0;
    } catch (error) {
      console.error("Failed to check room availability:", error);
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
    // @ts-ignore
    const diffTime = Math.abs(checkOut - checkIn);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Update booking
   * @param {number} id - Booking ID
   * @param {Object} bookingData - Updated booking data
   * @param {string} user - User performing the action
   */
  async update(id, bookingData, user = "system") {
    const { updateDb, saveDb } = require("../utils/dbUtils/dbActions");

    const {
      booking: bookingRepo,
      room: roomRepo,
      guest: guestRepo,
    } = await this.getRepositories();

    try {
      // Find existing booking with relations
      // @ts-ignore
      const existingBooking = await bookingRepo.findOne({
        where: { id },
        relations: ["room", "guest"],
      });

      if (!existingBooking) {
        throw new Error(`Booking with ID ${id} not found`);
      }

      // Store old data for audit
      const oldData = { ...existingBooking };

      // Check if booking can be modified
      if (
        existingBooking.status === "checked_out" ||
        existingBooking.status === "cancelled"
      ) {
        throw new Error(`Cannot modify a ${existingBooking.status} booking`);
      }

      let roomChanged = false;
      let datesChanged = false;

      // Handle room change
      if (
        // @ts-ignore
        bookingData.roomId &&
        // @ts-ignore
        bookingData.roomId !== existingBooking.room.id
      ) {
        roomChanged = true;
        // @ts-ignore
        const newRoom = await roomRepo.findOne({
          // @ts-ignore
          where: { id: bookingData.roomId },
        });
        if (!newRoom) {
          // @ts-ignore
          throw new Error(`Room with ID ${bookingData.roomId} not found`);
        }

        // Check new room availability
        const checkInDate =
          // @ts-ignore
          bookingData.checkInDate || existingBooking.checkInDate;
        const checkOutDate =
          // @ts-ignore
          bookingData.checkOutDate || existingBooking.checkOutDate;
        const isAvailable = await this.checkRoomAvailability(
          // @ts-ignore
          bookingData.roomId,
          checkInDate,
          checkOutDate,
          id,
        );

        if (!isAvailable) {
          throw new Error(`New room is not available for the selected dates`);
        }

        // @ts-ignore
        existingBooking.room = newRoom;
      }

      // Handle date change
      // @ts-ignore
      if (bookingData.checkInDate || bookingData.checkOutDate) {
        datesChanged = true;
        const checkInDate =
          // @ts-ignore
          bookingData.checkInDate || existingBooking.checkInDate;
        const checkOutDate =
          // @ts-ignore
          bookingData.checkOutDate || existingBooking.checkOutDate;

        // Validate new dates
        if (new Date(checkInDate) >= new Date(checkOutDate)) {
          throw new Error("Check-out date must be after check-in date");
        }

        // Check availability for new dates
        // @ts-ignore
        const roomId = bookingData.roomId || existingBooking.room.id;
        const isAvailable = await this.checkRoomAvailability(
          roomId,
          checkInDate,
          checkOutDate,
          id,
        );

        if (!isAvailable) {
          throw new Error(`Room is not available for the new dates`);
        }

        existingBooking.checkInDate = checkInDate;
        existingBooking.checkOutDate = checkOutDate;
      }

      // Handle guest info update
      // @ts-ignore
      if (bookingData.guestData) {
        // @ts-ignore
        const guest = existingBooking.guest;
        // @ts-ignore
        Object.assign(guest, bookingData.guestData);
        // @ts-ignore
        await updateDb(guestRepo, guest);
      }

      // Update other fields
      // @ts-ignore
      if (bookingData.numberOfGuests !== undefined) {
        // @ts-ignore
        if (bookingData.numberOfGuests > existingBooking.room.capacity) {
          throw new Error(
            // @ts-ignore
            `Room capacity (${existingBooking.room.capacity}) exceeded`,
          );
        }
        // @ts-ignore
        existingBooking.numberOfGuests = bookingData.numberOfGuests;
      }

      // @ts-ignore
      if (bookingData.specialRequests !== undefined) {
        // @ts-ignore
        existingBooking.specialRequests = bookingData.specialRequests;
      }

      // Recalculate price if room or dates changed
      if (roomChanged || datesChanged) {
        const nights = this.calculateNights(
          // @ts-ignore
          existingBooking.checkInDate,
          existingBooking.checkOutDate,
        );
        existingBooking.totalPrice =
          // @ts-ignore
          existingBooking.room.pricePerNight * nights;
      }

      // @ts-ignore
      const savedBooking = await updateDb(bookingRepo, existingBooking);

      // Handle room availability lifecycle if room changed
      if (roomChanged) {
        // Old room availability check
        // @ts-ignore
        const oldRoom = oldData.room;
        const stillBooked = await this.checkRoomAvailability(
          oldRoom.id,
          oldRoom.checkInDate,
          oldRoom.checkOutDate,
          id,
        );
        oldRoom.isAvailable = stillBooked ? false : true;
        // @ts-ignore
        await updateDb(roomRepo, oldRoom);

        // New room should be unavailable
        // @ts-ignore
        existingBooking.room.isAvailable = false;
        // @ts-ignore
        await updateDb(roomRepo, existingBooking.room);
      }

      // Log audit trail

      await auditLogger.logUpdate("Booking", id, oldData, savedBooking, user);

      console.log(`Booking updated: #${id}`);
      // @ts-ignore
      return savedBooking;
    } catch (error) {
      // @ts-ignore
      console.error("Failed to update booking:", error.message);
      throw error;
    }
  }

  /**
   * Cancel a booking
   * @param {number} id - Booking ID
   * @param {string} reason - Cancellation reason
   * @param {string} user - User performing the action
   */
  // @ts-ignore
  async cancel(id, reason = null, user = "system") {
    const { saveDb, updateDb } = require("../utils/dbUtils/dbActions");

    const { booking: bookingRepo } = await this.getRepositories();

    try {
      // @ts-ignore
      const booking = await bookingRepo.findOne({
        where: { id },
        relations: ["room", "guest"],
      });

      if (!booking) {
        throw new Error(`Booking with ID ${id} not found`);
      }

      if (booking.status === "cancelled") {
        throw new Error("Booking is already cancelled");
      }

      if (booking.status === "checked_out") {
        throw new Error("Cannot cancel a checked_out booking");
      }

      // Store old data for audit
      const oldData = { ...booking };

      // Update booking status
      booking.status = "cancelled";
      if (reason) {
        booking.specialRequests = booking.specialRequests
          ? `${booking.specialRequests}\nCancellation reason: ${reason}`
          : `Cancellation reason: ${reason}`;
      }

      // @ts-ignore
      const savedBooking = await saveDb(bookingRepo, booking);

      // @ts-ignore
      await saveDb(roomRepo, booking.room);

      // @ts-ignore
      await auditLogger.logUpdate("Room", booking.room.id, booking.room, user);

      // Log audit trail
      await auditLogger.logDelete("Booking", id, oldData, user);

      // @ts-ignore
      console.log(`Booking cancelled: #${id} for ${booking.guest.fullName}`);
      // @ts-ignore
      return savedBooking;
    } catch (error) {
      // @ts-ignore
      console.error("Failed to cancel booking:", error.message);
      throw error;
    }
  }

  /**
   * Check in guest
   * @param {number} id - Booking ID
   * @param {string} user - User performing the action
   */
  async checkIn(id, user = "system") {
    const { saveDb, updateDb } = require("../utils/dbUtils/dbActions");

    const { booking: bookingRepo } = await this.getRepositories();

    try {
      // @ts-ignore
      const booking = await bookingRepo.findOne({
        where: { id },
        relations: ["room", "guest"],
      });

      if (!booking) {
        throw new Error(`Booking with ID ${id} not found`);
      }

      if (booking.status !== "confirmed") {
        throw new Error(`Cannot check in a ${booking.status} booking`);
      }

      const today = new Date().toISOString().split("T")[0];
      if (booking.checkInDate !== today) {
        console.warn(
          `Checking in early/late. Booking check-in date: ${booking.checkInDate}`,
        );
      }

      // Store old data for audit
      const oldData = { ...booking };

      // Update booking status
      booking.status = "checked_in";
      // @ts-ignore
      const savedBooking = await updateDb(bookingRepo, booking);

      // Log audit trail
      await auditLogger.logUpdate("Booking", id, oldData, savedBooking, user);

      // @ts-ignore
      console.log(`Guest checked in: #${id} - ${booking.guest.fullName}`);
      // @ts-ignore
      return savedBooking;
    } catch (error) {
      // @ts-ignore
      console.error("Failed to check in:", error.message);
      throw error;
    }
  }

  /**
   * Check out guest
   * @param {number} id - Booking ID
   * @param {string} notes - Check-out notes
   * @param {string} user - User performing the action
   */
  // @ts-ignore
  async checkOut(id, notes = null, user = "system") {
    const { updateDb } = require("../utils/dbUtils/dbActions");
    const { booking: bookingRepo } = await this.getRepositories();

    try {
      // @ts-ignore
      const booking = await bookingRepo.findOne({
        where: { id },
        relations: ["room", "guest"],
      });

      if (!booking) {
        throw new Error(`Booking with ID ${id} not found`);
      }

      if (booking.status !== "checked_in") {
        throw new Error(`Cannot check out a ${booking.status} booking`);
      }

      // Store old data for audit
      const oldData = { ...booking };

      // Update booking status
      booking.status = "checked_out";
      if (notes) {
        booking.specialRequests = booking.specialRequests
          ? `${booking.specialRequests}\nCheck-out notes: ${notes}`
          : `Check-out notes: ${notes}`;
      }

      // @ts-ignore
      const savedBooking = await updateDb(bookingRepo, booking);
      // @ts-ignore

      // Log audit trail
      await auditLogger.logUpdate("Booking", id, oldData, savedBooking, user);

      // @ts-ignore
      console.log(`Guest checked out: #${id} - ${booking.guest.fullName}`);
      // @ts-ignore
      return savedBooking;
    } catch (error) {
      // @ts-ignore
      console.error("Failed to check out:", error.message);
      throw error;
    }
  }

  /**
   * @param {number} id
   */
  // @ts-ignore
  async markAsPaid(id, reason = null, user = "system") {
    const { updateDb } = require("../utils/dbUtils/dbActions");

    const { booking: bookingRepo } = await this.getRepositories();

    try {
      // @ts-ignore
      const booking = await bookingRepo.findOne({
        where: { id },
        relations: ["room", "guest"],
      });

      if (!booking) {
        throw new Error(`Booking with ID ${id} not found`);
      }

      if (booking.paymentStatus === "paid") {
        throw new Error(`Booking #${id} is already marked as paid`);
      }

      // Store old data for audit
      const oldData = JSON.parse(JSON.stringify(booking));

      // Update booking payment status
      booking.paymentStatus = "paid";

      // @ts-ignore
      const savedBooking = await updateDb(bookingRepo, booking);

      // Log audit trail
      await auditLogger.logUpdate("Booking", id, oldData, savedBooking, user);

      console.log(`Booking marked as paid: #${id}`);
      return savedBooking;
    } catch (error) {
      // @ts-ignore
      console.error("Failed to mark booking as paid:", error.message);
      throw error;
    }
  }

  /**
   * @param {number} id
   * @param {string | null} reason
   */
  async markAsFailed(id, reason, user = "system") {
    const { updateDb } = require("../utils/dbUtils/dbActions");

    const { booking: bookingRepo } = await this.getRepositories();

    try {
      // @ts-ignore
      const booking = await bookingRepo.findOne({
        where: { id },
        relations: ["room", "guest"],
      });

      if (!booking) {
        throw new Error(`Booking with ID ${id} not found`);
      }

      // Store old data for audit
      const oldData = { ...booking };

      // Update booking payment status
      booking.paymentStatus = "failed";
      if (reason) {
        // @ts-ignore
        booking.paymentFailureReason = reason;
      }

      // @ts-ignore
      const savedBooking = await updateDb(bookingRepo, booking);

      // Log audit trail
      await auditLogger.logUpdate("Booking", id, oldData, savedBooking, user);

      console.log(`Booking marked as failed: #${id}`);
      return savedBooking;
    } catch (error) {
      // @ts-ignore
      console.error("Failed to mark booking as failed:", error.message);
      throw error;
    }
  }

  /**
   * Find booking by ID
   * @param {number} id - Booking ID
   */
  async findById(id) {
    const { booking: bookingRepo } = await this.getRepositories();

    try {
      // @ts-ignore
      const booking = await bookingRepo.findOne({
        where: { id },
        relations: ["room", "guest"],
      });

      if (!booking) {
        throw new Error(`Booking with ID ${id} not found`);
      }

      // Log view action
      // @ts-ignore
      await auditLogger.logView("Booking", id, "system");

      // @ts-ignore
      return booking;
    } catch (error) {
      // @ts-ignore
      console.error("Failed to find booking:", error.message);
      throw error;
    }
  }

  /**
   * Get all bookings with optional filters
   * @param {Object} options - Filter options
   */
  async findAll(options = {}) {
    const { booking: bookingRepo } = await this.getRepositories();

    try {
      // @ts-ignore
      const queryBuilder = bookingRepo
        .createQueryBuilder("booking")
        .leftJoinAndSelect("booking.room", "room")
        .leftJoinAndSelect("booking.guest", "guest");

      // Apply filters
      // @ts-ignore
      if (options.status) {
        queryBuilder.andWhere("booking.status = :status", {
          // @ts-ignore
          status: options.status,
        });
      }

      // @ts-ignore
      if (options.roomId) {
        queryBuilder.andWhere("booking.roomId = :roomId", {
          // @ts-ignore
          roomId: options.roomId,
        });
      }

      // @ts-ignore
      if (options.guestId) {
        queryBuilder.andWhere("booking.guestId = :guestId", {
          // @ts-ignore
          guestId: options.guestId,
        });
      }

      // @ts-ignore
      if (options.checkInDate) {
        queryBuilder.andWhere("booking.checkInDate >= :checkInDate", {
          // @ts-ignore
          checkInDate: options.checkInDate,
        });
      }

      // @ts-ignore
      if (options.checkOutDate) {
        queryBuilder.andWhere("booking.checkOutDate <= :checkOutDate", {
          // @ts-ignore
          checkOutDate: options.checkOutDate,
        });
      }

      // @ts-ignore
      if (options.search) {
        queryBuilder.andWhere(
          "(guest.fullName LIKE :search OR guest.email LIKE :search OR guest.phone LIKE :search)",
          // @ts-ignore
          { search: `%${options.search}%` },
        );
      }

      // Apply sorting
      // @ts-ignore
      const sortBy = options.sortBy || "createdAt";
      // @ts-ignore
      const sortOrder = options.sortOrder === "ASC" ? "ASC" : "DESC";
      queryBuilder.orderBy(`booking.${sortBy}`, sortOrder);

      // Pagination
      // @ts-ignore
      if (options.page && options.limit) {
        // @ts-ignore
        const offset = (options.page - 1) * options.limit;
        // @ts-ignore
        queryBuilder.skip(offset).take(options.limit);
      }

      const bookings = await queryBuilder.getMany();

      // Log view action
      await auditLogger.logView("Booking", null, "system");

      // @ts-ignore
      return bookings;
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
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
      // @ts-ignore
      const statusCounts = await bookingRepo
        .createQueryBuilder("booking")
        .select("booking.status", "status")
        .addSelect("COUNT(*)", "count")
        .groupBy("booking.status")
        .getRawMany();

      // Get revenue statistics
      // @ts-ignore
      const revenueQuery = await bookingRepo
        .createQueryBuilder("booking")
        .select([
          "SUM(booking.totalPrice) as totalRevenue",
          "AVG(booking.totalPrice) as averageBookingValue",
          "COUNT(*) as totalBookings",
        ])
        .where("booking.status IN (:...statuses)", {
          statuses: ["confirmed", "checked_in", "checked_out"],
        })
        .getRawOne();

      // Get monthly trends
      // @ts-ignore
      const monthlyTrends = await bookingRepo
        .createQueryBuilder("booking")
        .select([
          "strftime('%Y-%m', booking.checkInDate) as month",
          "COUNT(*) as bookings",
          "SUM(booking.totalPrice) as revenue",
        ])
        .where('booking.checkInDate >= date("now", "-6 months")')
        .groupBy("strftime('%Y-%m', booking.checkInDate)")
        .orderBy("month", "DESC")
        .getRawMany();

      // Get upcoming bookings
      const today = new Date().toISOString().split("T")[0];
      // @ts-ignore
      const upcomingBookings = await bookingRepo
        .createQueryBuilder("booking")
        .where("booking.checkInDate >= :today", { today })
        .andWhere("booking.status = :status", { status: "confirmed" })
        .orderBy("booking.checkInDate", "ASC")
        .getCount();

      return {
        statusCounts,
        revenue: {
          total: parseFloat(revenueQuery.totalRevenue) || 0,
          average: parseFloat(revenueQuery.averageBookingValue) || 0,
          totalBookings: parseInt(revenueQuery.totalBookings) || 0,
        },
        monthlyTrends,
        upcomingBookings,
      };
    } catch (error) {
      console.error("Failed to get booking statistics:", error);
      throw error;
    }
  }

  /**
   * Get today's arrivals, departures, and in-house guests
   * @returns {Promise<Object>} Today's operations
   */
  async getTodaysOperations() {
    const { booking: bookingRepo } = await this.getRepositories();
    const today = new Date().toISOString().split("T")[0];

    try {
      // @ts-ignore
      const arrivals = await bookingRepo
        .createQueryBuilder("booking")
        .leftJoinAndSelect("booking.room", "room")
        .leftJoinAndSelect("booking.guest", "guest")
        .where("booking.checkInDate = :today", { today })
        .andWhere("booking.status = :status", { status: "confirmed" })
        .getMany();

      // @ts-ignore
      const departures = await bookingRepo
        .createQueryBuilder("booking")
        .leftJoinAndSelect("booking.room", "room")
        .leftJoinAndSelect("booking.guest", "guest")
        .where("booking.checkOutDate = :today", { today })
        .andWhere("booking.status IN (:...statuses)", {
          statuses: ["confirmed", "checked_in"],
        })
        .getMany();

      // @ts-ignore
      const inHouse = await bookingRepo
        .createQueryBuilder("booking")
        .leftJoinAndSelect("booking.room", "room")
        .leftJoinAndSelect("booking.guest", "guest")
        .where("booking.checkInDate <= :today", { today })
        .andWhere("booking.checkOutDate > :today", { today })
        .andWhere("booking.status = :status", { status: "checked_in" })
        .getMany();

      return {
        arrivals,
        departures,
        inHouse,
        arrivalsCount: arrivals.length,
        departuresCount: departures.length,
        inHouseCount: inHouse.length,
      };
    } catch (error) {
      console.error("Failed to get todays operations:", error);
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
  async exportBookings(format = "json", filters = {}, user = "system") {
    try {
      const bookings = await this.findAll(filters);

      let exportData;
      if (format === "csv") {
        // Convert to CSV
        const headers = [
          "Booking ID",
          "Guest Name",
          "Room Number",
          "Check-In",
          "Check-Out",
          "Nights",
          "Guests",
          "Total Price",
          "Status",
          "Created Date",
        ];

        const rows = bookings.map((booking) => [
          // @ts-ignore
          booking.id,
          // @ts-ignore
          booking.guest?.fullName || "N/A",
          // @ts-ignore
          booking.room?.roomNumber || "N/A",
          // @ts-ignore
          booking.checkInDate,
          // @ts-ignore
          booking.checkOutDate,
          // @ts-ignore
          this.calculateNights(booking.checkInDate, booking.checkOutDate),
          // @ts-ignore
          booking.numberOfGuests,
          // @ts-ignore
          booking.totalPrice,
          // @ts-ignore
          booking.status,
          // @ts-ignore
          new Date(booking.createdAt).toLocaleDateString(),
        ]);

        exportData = {
          format: "csv",
          data: [headers, ...rows].map((row) => row.join(",")).join("\n"),
          filename: `bookings_export_${new Date().toISOString().split("T")[0]}.csv`,
        };
      } else {
        // JSON format
        exportData = {
          format: "json",
          data: bookings,
          filename: `bookings_export_${new Date().toISOString().split("T")[0]}.json`,
        };
      }

      // Log export action
      // @ts-ignore
      await auditLogger.logExport("Booking", format, filters, user);

      console.log(`Exported ${bookings.length} bookings in ${format} format`);
      return exportData;
    } catch (error) {
      console.error("Failed to export bookings:", error);
      throw error;
    }
  }
  /**
   * @param {{ invoiceNumber: any; date: any; guest: { name: any; email: any; phone: any; }; room: { type: any; number: any; }; stay: { checkIn: any; checkOut: any; nights: any; }; charges: any[]; subtotal: any; tax: any; total: any; }} invoice
   */
  async printInvoice(invoice) {
    const escpos = require("escpos");
    // @ts-ignore
    escpos.USB = require("escpos-usb");
    const { companyName } = require("../utils/system");

    // Example: USB printer
    const device = new escpos.USB();
    const printer = new escpos.Printer(device);
    const company_name = await companyName();
    return new Promise((resolve, reject) => {
      try {
        device.open(() => {
          printer
            .align("CT")
            .text(`${company_name?.toUpperCase() || "HOTEL BOOKING"} INVOICE`)
            .text("----------------------")
            .align("LT")
            .text(`Invoice #: ${invoice.invoiceNumber}`)
            .text(`Date: ${invoice.date}`)
            .text(`Guest: ${invoice.guest.name}`)
            .text(`Email: ${invoice.guest.email}`)
            .text(`Phone: ${invoice.guest.phone}`)
            .text(`Room: ${invoice.room.type} (${invoice.room.number})`)
            .text(`Check-in: ${invoice.stay.checkIn}`)
            .text(`Check-out: ${invoice.stay.checkOut}`)
            .text(`Nights: ${invoice.stay.nights}`)
            .text("----------------------");

          invoice.charges.forEach((c) => {
            printer.text(
              `${c.description.padEnd(20)} ${c.amount.toFixed(2).padStart(10)}`,
            );
          });

          printer
            .text("----------------------")
            .text(`Subtotal: ${invoice.subtotal}`)
            .text(`Tax: ${invoice.tax}`)
            .text(`TOTAL: ${invoice.total}`)
            .text("----------------------")
            .align("CT")
            .text("Thank you for booking!")
            .cut()
            .close();

          resolve({ status: true, message: "Invoice printed successfully" });
        });
      } catch (err) {
        console.error("Failed to print invoice:", err);
        reject({
          status: false,
          message: "Failed to print invoice, please check your device.",
        });
      }
    });
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
        // @ts-ignore
        invoiceNumber: `INV-${booking.id.toString().padStart(6, "0")}`,
        date: new Date().toISOString().split("T")[0],
        // @ts-ignore
        bookingId: booking.id,
        guest: {
          // @ts-ignore
          name: booking.guest.fullName,
          // @ts-ignore
          email: booking.guest.email,
          // @ts-ignore
          phone: booking.guest.phone,
        },
        room: {
          // @ts-ignore
          number: booking.room.roomNumber,
          // @ts-ignore
          type: booking.room.type,
          // @ts-ignore
          capacity: booking.room.capacity,
        },
        stay: {
          // @ts-ignore
          checkIn: booking.checkInDate,
          // @ts-ignore
          checkOut: booking.checkOutDate,
          nights: this.calculateNights(
            // @ts-ignore
            booking.checkInDate,
            // @ts-ignore
            booking.checkOutDate,
          ),
          // @ts-ignore
          guests: booking.numberOfGuests,
        },
        charges: [
          {
            // @ts-ignore
            description: `Room ${booking.room.roomNumber} (${booking.room.type})`,
            nights: this.calculateNights(
              // @ts-ignore
              booking.checkInDate,
              // @ts-ignore
              booking.checkOutDate,
            ),
            // @ts-ignore
            rate: booking.room.pricePerNight,
            // @ts-ignore
            amount: booking.totalPrice,
          },
        ],
        // @ts-ignore
        subtotal: booking.totalPrice,
        tax: 0, // Add tax calculation if needed
        // @ts-ignore
        total: booking.totalPrice,
        // @ts-ignore
        status: booking.status,
        paymentStatus: "pending", // You can add payment module later
        // @ts-ignore
        notes: booking.specialRequests,
      };

      // Log invoice generation
      // @ts-ignore
      await auditLogger.log({
        action: "GENERATE_INVOICE",
        entity: "Booking",
        entityId: bookingId,
        newData: { invoiceNumber: invoice.invoiceNumber },
        user: "system",
      });

      return invoice;
    } catch (error) {
      console.error("Failed to generate invoice:", error);
      throw error;
    }
  }
}

// Create singleton instance
const bookingService = new BookingService();

module.exports = bookingService;

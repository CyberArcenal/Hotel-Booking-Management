//@ts-check
const { AppDataSource } = require("../main/db/datasource");
const { Guest } = require("../entities/Guest");
const { Booking } = require("../entities/Booking");
const {
  validateGuestData,
  generateGuestReference,
} = require("../utils/guestUtils");
const auditLogger = require("../utils/auditLogger");


class GuestService {
  constructor() {
    this.guestRepository = null;
    this.bookingRepository = null;
  }

  async initialize() {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    this.guestRepository = AppDataSource.getRepository(Guest);
    this.bookingRepository = AppDataSource.getRepository(Booking);
    console.log("GuestService initialized");
  }

  async getRepositories() {
    if (!this.guestRepository) {
      await this.initialize();
    }
    return {
      guest: this.guestRepository,
      booking: this.bookingRepository,
    };
  }

  /**
   * Create a new guest
   * @param {Object} guestData - Guest information
   * @param {string} user - User performing the action
   * @returns {Promise<Guest>} Created guest
   */
  async create(guestData, user = "system") {
    const { saveDb } = require("../utils/dbUtils/dbActions");
    const { guest: guestRepo } = await this.getRepositories();

    try {
      // Validate guest data
      const validation = validateGuestData(guestData);
      // @ts-ignore
      if (!validation.valid) {
        // @ts-ignore
        throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
      }

      // Normalize email (case-insensitive)
      // @ts-ignore
      const normalizedEmail = guestData.email.toLowerCase();

      // Check if guest already exists (by normalized email)
      // @ts-ignore
      const existingGuest = await guestRepo.findOne({
        where: { email: normalizedEmail },
      });
      if (existingGuest) {
        // @ts-ignore
        throw new Error(`Guest with email ${guestData.email} already exists`);
      }

      // Create guest with defaults + reference
      // @ts-ignore
      const guest = guestRepo.create({
        ...guestData,
        email: normalizedEmail,
        // @ts-ignore
        nationality: guestData.nationality || "N/A",
        guestReference: generateGuestReference(), // auto-generated reference
        createdAt: new Date(),
      });

      // @ts-ignore
      const savedGuest = await saveDb(guestRepo, guest);

      // Log audit trail
      // @ts-ignore
      await auditLogger.logCreate("Guest", savedGuest.id, savedGuest, user);

      console.log(
        // @ts-ignore
        `Guest created: ${savedGuest.fullName} (ID: ${savedGuest.id}, Ref: ${savedGuest.guestReference})`,
      );
      // @ts-ignore
      return savedGuest;
    } catch (error) {
      // @ts-ignore
      console.error("Failed to create guest:", error.message);
      throw error;
    }
  }

  /**
   * Update guest information
   * @param {number} id - Guest ID
   * @param {Object} guestData - Updated guest data
   * @param {string} user - User performing the action
   * @returns {Promise<Guest>} Updated guest
   */
  async update(id, guestData, user = "system") {
    const { updateDb } = require("../utils/dbUtils/dbActions");

    const { guest: guestRepo } = await this.getRepositories();

    try {
      // Find existing guest with bookings
      // @ts-ignore
      const existingGuest = await guestRepo.findOne({
        where: { id },
        relations: ["bookings"],
      });
      if (!existingGuest) {
        throw new Error(`Guest with ID ${id} not found`);
      }

      const oldData = { ...existingGuest };

      // Normalize email if provided
      // @ts-ignore
      if (guestData.email) {
        // @ts-ignore
        guestData.email = guestData.email.toLowerCase();
      }

      // Rule: cannot change email if guest has active bookings
      // @ts-ignore
      if (guestData.email && guestData.email !== existingGuest.email) {
        // @ts-ignore
        const hasActiveBookings = existingGuest.bookings.some((b) =>
          ["confirmed", "checked_in"].includes(b.status),
        );
        if (hasActiveBookings) {
          throw new Error(
            "Cannot change email while guest has active bookings",
          );
        }

        // Check for duplicate email
        // @ts-ignore
        const duplicateGuest = await guestRepo.findOne({
          // @ts-ignore
          where: { email: guestData.email },
        });
        if (duplicateGuest) {
          // @ts-ignore
          throw new Error(`Email ${guestData.email} is already in use`);
        }
      }

      // Validate updated data
      const validationData = { ...existingGuest, ...guestData };
      const validation = validateGuestData(validationData, true);
      // @ts-ignore
      if (!validation.valid) {
        // @ts-ignore
        throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
      }

      // Prevent guestReference overwrite
      // @ts-ignore
      if (guestData.guestReference) {
        // @ts-ignore
        delete guestData.guestReference;
      }

      // Merge updates
      // @ts-ignore
      const updatedGuest = guestRepo.merge(existingGuest, {
        ...guestData,
        // @ts-ignore
        updatedAt: new Date(),
      });

      // @ts-ignore
      const savedGuest = await updateDb(guestRepo, updatedGuest);

      // Log audit trail
      await auditLogger.logUpdate("Guest", id, oldData, savedGuest, user);

      console.log(`Guest updated: ${savedGuest.fullName} (ID: ${id})`);
      // @ts-ignore
      return savedGuest;
    } catch (error) {
      // @ts-ignore
      console.error("Failed to update guest:", error.message);
      throw error;
    }
  }

  /**
   * Delete a guest
   * @param {number} id - Guest ID
   * @param {string} user - User performing the action
   * @returns {Promise<boolean>} Success status
   */
  async delete(id, user = "system") {
    const { removeDb } = require("../utils/dbUtils/dbActions");

    // @ts-ignore
    const { guest: guestRepo, booking: bookingRepo } =
      await this.getRepositories();

    try {
      // Find guest with bookings
      // @ts-ignore
      const guest = await guestRepo.findOne({
        where: { id },
        relations: ["bookings"],
      });

      if (!guest) {
        throw new Error(`Guest with ID ${id} not found`);
      }

      // Check if guest has active bookings
      const hasActiveBookings =
        // @ts-ignore
        guest.bookings &&
        // @ts-ignore
        guest.bookings.some(
          // @ts-ignore
          (booking) =>
            booking.status === "confirmed" || booking.status === "checked_in",
        );

      if (hasActiveBookings) {
        throw new Error(
          `Cannot delete guest ${guest.fullName} with active bookings`,
        );
      }

      // Store guest data for audit log
      const guestData = { ...guest };

      // Delete guest (cascade will delete associated bookings if configured)
      // @ts-ignore
      await removeDb(guestRepo, guest);

      // Log audit trail
      await auditLogger.logDelete("Guest", id, guestData, user);

      console.log(`Guest deleted: ${guestData.fullName} (ID: ${id})`);
      return true;
    } catch (error) {
      // @ts-ignore
      console.error("Failed to delete guest:", error.message);
      throw error;
    }
  }

  /**
   * Find guest by ID with booking history
   * @param {number} id - Guest ID
   * @param {boolean} includeBookings - Include booking history
   * @returns {Promise<Guest>} Guest object
   */
  async findById(id, includeBookings = true) {
    const { guest: guestRepo } = await this.getRepositories();

    try {
      const relations = includeBookings ? ["bookings", "bookings.room"] : [];
      // @ts-ignore
      const guest = await guestRepo.findOne({
        where: { id },
        relations,
      });

      if (!guest) {
        throw new Error(`Guest with ID ${id} not found`);
      }

      // Sort bookings by check-in date (newest first)
      // @ts-ignore
      if (guest.bookings) {
        // @ts-ignore
        guest.bookings.sort(
          // @ts-ignore
          (a, b) => new Date(b.checkInDate) - new Date(a.checkInDate),
        );
      }

      // Log view action
      // @ts-ignore
      await auditLogger.logView("Guest", id, "system");

      // @ts-ignore
      return guest;
    } catch (error) {
      // @ts-ignore
      console.error("Failed to find guest:", error.message);
      throw error;
    }
  }

  /**
   * Find guest by email
   * @param {string} email - Email address
   * @param {boolean} includeBookings - Include booking history
   * @returns {Promise<Guest>} Guest object
   */
  async findByEmail(email, includeBookings = false) {
    const { guest: guestRepo } = await this.getRepositories();

    try {
      const relations = includeBookings ? ["bookings", "bookings.room"] : [];
      // @ts-ignore
      const guest = await guestRepo.findOne({
        where: { email },
        relations,
      });

      if (!guest) {
        throw new Error(`Guest with email ${email} not found`);
      }

      // @ts-ignore
      return guest;
    } catch (error) {
      // @ts-ignore
      console.error("Failed to find guest by email:", error.message);
      throw error;
    }
  }

  /**
   * Search guests by various criteria
   * @param {Object} criteria - Search criteria
   * @param {string} criteria.search - Search term (name, email, phone)
   * @param {string} criteria.name - Exact name match
   * @param {string} criteria.phone - Phone number
   * @param {string} criteria.nationality - Nationality
   * @param {boolean} criteria.hasBookings - Guests with bookings only
   * @param {number} criteria.minBookings - Minimum number of bookings
   * @param {Date} criteria.lastVisitAfter - Last visit after date
   * @param {string} criteria.sortBy - Sort field
   * @param {string} criteria.sortOrder - 'ASC' or 'DESC'
   * @param {number} criteria.page - Page number
   * @param {number} criteria.limit - Items per page
   * @returns {Promise<Object>} Search results with pagination
   */
  // @ts-ignore
  async search(criteria = {}) {
    const { saveDb, updateDb } = require("../utils/dbUtils/dbActions");

    const { guest: guestRepo } = await this.getRepositories();

    try {
      // @ts-ignore
      const queryBuilder = guestRepo
        .createQueryBuilder("guest")
        .leftJoinAndSelect("guest.bookings", "bookings")
        .loadRelationCountAndMap("guest.totalBookings", "guest.bookings")
        .loadRelationCountAndMap(
          "guest.activeBookings",
          "guest.bookings",
          "activeBookings",
          (qb) =>
            qb.where("activeBookings.status IN (:...activeStatuses)", {
              activeStatuses: ["confirmed", "checked_in"],
            }),
        );

      // Apply search filters
      if (criteria.search) {
        queryBuilder.andWhere(
          "(guest.fullName LIKE :search OR guest.email LIKE :search OR guest.phone LIKE :search)",
          { search: `%${criteria.search}%` },
        );
      }

      if (criteria.name) {
        queryBuilder.andWhere("guest.fullName LIKE :name", {
          name: `%${criteria.name}%`,
        });
      }

      // @ts-ignore
      if (criteria.email) {
        queryBuilder.andWhere("guest.email LIKE :email", {
          // @ts-ignore
          email: `%${criteria.email}%`,
        });
      }

      if (criteria.phone) {
        queryBuilder.andWhere("guest.phone LIKE :phone", {
          phone: `%${criteria.phone}%`,
        });
      }

      if (criteria.nationality) {
        queryBuilder.andWhere("guest.nationality = :nationality", {
          nationality: criteria.nationality,
        });
      }

      // Filter by booking count
      if (criteria.hasBookings === true) {
        queryBuilder.having("COUNT(bookings.id) > 0");
      } else if (criteria.hasBookings === false) {
        queryBuilder.having("COUNT(bookings.id) = 0");
      }

      if (criteria.minBookings) {
        queryBuilder.having("COUNT(bookings.id) >= :minBookings", {
          minBookings: criteria.minBookings,
        });
      }

      // Last visit filter
      if (criteria.lastVisitAfter) {
        queryBuilder.andWhere(
          "(SELECT MAX(b.checkInDate) FROM bookings b WHERE b.guestId = guest.id) >= :lastVisitAfter",
          { lastVisitAfter: criteria.lastVisitAfter },
        );
      }

      // Group by guest for aggregate functions
      queryBuilder.groupBy("guest.id");

      // Apply sorting
      const sortBy = criteria.sortBy || "createdAt";
      const sortOrder = criteria.sortOrder === "ASC" ? "ASC" : "DESC";

      if (sortBy === "totalBookings") {
        queryBuilder.orderBy("COUNT(bookings.id)", sortOrder);
      } else if (sortBy === "lastVisit") {
        queryBuilder.orderBy(
          "(SELECT MAX(b.checkInDate) FROM bookings b WHERE b.guestId = guest.id)",
          sortOrder,
        );
      } else {
        queryBuilder.orderBy(`guest.${sortBy}`, sortOrder);
      }

      // Get total count for pagination
      const totalQuery = queryBuilder.clone();
      const total = await totalQuery.getCount();

      // Apply pagination
      if (criteria.page && criteria.limit) {
        const offset = (criteria.page - 1) * criteria.limit;
        queryBuilder.offset(offset).limit(criteria.limit);
      }

      const guests = await queryBuilder.getMany();

      // Log search action
      await auditLogger.log({
        action: "SEARCH",
        entity: "Guest",
        // @ts-ignore
        entityId: null,
        newData: { criteria, results: guests.length },
        user: "system",
      });

      return {
        guests,
        total,
        page: criteria.page || 1,
        limit: criteria.limit || total,
        totalPages: criteria.limit ? Math.ceil(total / criteria.limit) : 1,
      };
    } catch (error) {
      console.error("Failed to search guests:", error);
      throw error;
    }
  }

  /**
   * Get all guests (with optional filters)
   * @param {Object} filters - Filter options
   * @returns {Promise<Guest[]>} Array of guests
   */
  async findAll(filters = {}) {
    try {
      // @ts-ignore
      const result = await this.search({
        ...filters,
        page: 1,
        limit: 1000, // Large limit to get all
      });

      // @ts-ignore
      return result.guests;
    } catch (error) {
      console.error("Failed to fetch all guests:", error);
      throw error;
    }
  }

  /**
   * Get guest statistics and insights
   * @returns {Promise<Object>} Guest statistics
   */
  async getStatistics() {
    const { guest: guestRepo, booking: bookingRepo } =
      await this.getRepositories();

    try {
      // Total guests
      // @ts-ignore
      const totalGuests = await guestRepo.count();

      // Guests with bookings
      // @ts-ignore
      const guestsWithBookings = await guestRepo
        .createQueryBuilder("guest")
        .innerJoin("guest.bookings", "booking")
        .getCount();

      // Repeat guests (more than 1 booking)
      // @ts-ignore
      const repeatGuests = await guestRepo
        .createQueryBuilder("guest")
        .innerJoin("guest.bookings", "booking")
        .groupBy("guest.id")
        .having("COUNT(booking.id) > 1")
        .getCount();

      // Top nationalities
      // @ts-ignore
      const nationalities = await guestRepo
        .createQueryBuilder("guest")
        .select("guest.nationality", "nationality")
        .addSelect("COUNT(*)", "count")
        .where("guest.nationality IS NOT NULL")
        .groupBy("guest.nationality")
        .orderBy("count", "DESC")
        .limit(10)
        .getRawMany();

      // New guests this month
      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);

      // @ts-ignore
      const newGuestsThisMonth = await guestRepo
        .createQueryBuilder("guest")
        .where("guest.createdAt >= :thisMonth", { thisMonth })
        .getCount();

      // Guest booking frequency
      // @ts-ignore
      const bookingFrequency = await bookingRepo
        .createQueryBuilder("booking")
        .select("guestId")
        .addSelect("COUNT(*)", "bookingCount")
        .groupBy("guestId")
        .getRawMany();

      const avgBookingsPerGuest =
        bookingFrequency.length > 0
          ? bookingFrequency.reduce(
              (sum, item) => sum + parseInt(item.bookingCount),
              0,
            ) / bookingFrequency.length
          : 0;

      return {
        totalGuests,
        guestsWithBookings,
        repeatGuests,
        newGuestsThisMonth,
        repeatRate:
          totalGuests > 0 ? ((repeatGuests / totalGuests) * 100).toFixed(2) : 0,
        nationalities,
        bookingFrequency: {
          average: avgBookingsPerGuest.toFixed(2),
          distribution: bookingFrequency.reduce((dist, item) => {
            const count = parseInt(item.bookingCount);
            dist[count] = (dist[count] || 0) + 1;
            return dist;
          }, {}),
        },
      };
    } catch (error) {
      console.error("Failed to get guest statistics:", error);
      throw error;
    }
  }

  /**
   * Get guest booking history
   * @param {number} guestId - Guest ID
   * @param {Object} options - Filter options
   * @returns {Promise<Booking[]>} Booking history
   */
  async getBookingHistory(guestId, options = {}) {
    const { booking: bookingRepo } = await this.getRepositories();

    try {
      // @ts-ignore
      const queryBuilder = bookingRepo
        .createQueryBuilder("booking")
        .leftJoinAndSelect("booking.room", "room")
        .where("booking.guestId = :guestId", { guestId });

      // Apply filters
      // @ts-ignore
      if (options.status) {
        queryBuilder.andWhere("booking.status = :status", {
          // @ts-ignore
          status: options.status,
        });
      }

      // @ts-ignore
      if (options.fromDate) {
        queryBuilder.andWhere("booking.checkInDate >= :fromDate", {
          // @ts-ignore
          fromDate: options.fromDate,
        });
      }

      // @ts-ignore
      if (options.toDate) {
        queryBuilder.andWhere("booking.checkInDate <= :toDate", {
          // @ts-ignore
          toDate: options.toDate,
        });
      }

      // Apply sorting
      // @ts-ignore
      const sortBy = options.sortBy || "checkInDate";
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

      // Calculate total spent
      const totalSpent = bookings.reduce(
        // @ts-ignore
        (sum, booking) => sum + booking.totalPrice,
        0,
      );

      // Calculate average stay length
      const totalNights = bookings.reduce((sum, booking) => {
        // @ts-ignore
        const checkIn = new Date(booking.checkInDate);
        // @ts-ignore
        const checkOut = new Date(booking.checkOutDate);
        // @ts-ignore
        const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
        return sum + nights;
      }, 0);

      const avgNights =
        bookings.length > 0 ? (totalNights / bookings.length).toFixed(1) : 0;

      return {
        // @ts-ignore
        bookings,
        summary: {
          totalBookings: bookings.length,
          totalSpent,
          avgNights,
          firstBooking:
            bookings.length > 0
              ? bookings[bookings.length - 1].checkInDate
              : null,
          lastBooking: bookings.length > 0 ? bookings[0].checkInDate : null,
        },
      };
    } catch (error) {
      console.error("Failed to get guest booking history:", error);
      throw error;
    }
  }

  /**
   * Get VIP/loyalty guests (based on spending or frequency)
   * @param {Object} criteria - VIP criteria
   * @returns {Promise<Guest[]>} VIP guests
   */
  async getVIPGuests(criteria = {}) {
    const { saveDb, updateDb } = require("../utils/dbUtils/dbActions");

    const { guest: guestRepo } = await this.getRepositories();

    try {
      // @ts-ignore
      const minBookings = criteria.minBookings || 3;
      // @ts-ignore
      const minSpent = criteria.minSpent || 10000;

      // @ts-ignore
      const vipGuests = await guestRepo
        .createQueryBuilder("guest")
        .leftJoin("guest.bookings", "booking")
        .select("guest.*")
        .addSelect("COUNT(booking.id)", "bookingCount")
        .addSelect("SUM(booking.totalPrice)", "totalSpent")
        .groupBy("guest.id")
        .having("COUNT(booking.id) >= :minBookings", { minBookings })
        .andHaving("SUM(booking.totalPrice) >= :minSpent", { minSpent })
        .orderBy("totalSpent", "DESC")
        .getRawMany();

      // Log VIP report generation
      await auditLogger.log({
        action: "GENERATE_VIP_REPORT",
        entity: "Guest",
        // @ts-ignore
        entityId: null,
        newData: {
          criteria: { minBookings, minSpent },
          count: vipGuests.length,
        },
        user: "system",
      });

      return vipGuests;
    } catch (error) {
      console.error("Failed to get VIP guests:", error);
      throw error;
    }
  }

  /**
   * Export guests to CSV/JSON
   * @param {string} format - 'csv' or 'json'
   * @param {Object} filters - Export filters
   * @param {string} user - User performing export
   * @returns {Promise<Object>} Export data
   */
  async exportGuests(format = "json", filters = {}, user = "system") {
    try {
      // @ts-ignore
      const { guests } = await this.search({
        ...filters,
        page: 1,
        limit: 10000, // Large limit for export
      });

      let exportData;
      if (format === "csv") {
        // Convert to CSV
        const headers = [
          "ID",
          "Full Name",
          "Email",
          "Phone",
          "Nationality",
          "Address",
          "Total Bookings",
          "Total Spent",
          "Last Visit",
          "Created Date",
        ];

        // @ts-ignore
        const rows = guests.map((guest) => {
          const totalSpent = guest.bookings
            ? guest.bookings.reduce(
                // @ts-ignore
                (sum, booking) => sum + booking.totalPrice,
                0,
              )
            : 0;

          const lastVisit =
            guest.bookings && guest.bookings.length > 0
              ? guest.bookings[0].checkInDate
              : "N/A";

          return [
            guest.id,
            guest.fullName,
            guest.email,
            guest.phone,
            guest.nationality || "N/A",
            guest.address || "N/A",
            guest.bookings ? guest.bookings.length : 0,
            totalSpent,
            lastVisit,
            new Date(guest.createdAt).toLocaleDateString(),
          ];
        });

        exportData = {
          format: "csv",
          data: [headers, ...rows].map((row) => row.join(",")).join("\n"),
          filename: `guests_export_${new Date().toISOString().split("T")[0]}.csv`,
        };
      } else {
        // JSON format
        exportData = {
          format: "json",
          data: guests,
          filename: `guests_export_${new Date().toISOString().split("T")[0]}.json`,
        };
      }

      // Log export action
      // @ts-ignore
      await auditLogger.logExport("Guest", format, filters, user);

      console.log(`Exported ${guests.length} guests in ${format} format`);
      return exportData;
    } catch (error) {
      console.error("Failed to export guests:", error);
      throw error;
    }
  }

  /**
   * Merge duplicate guests (by email or phone)
   * @param {Object} masterData - Master guest data (kept record)
   * @param {string} user - User performing the merge
   * @returns {Promise<Object>} Merge result
   * @param {any[]} guestIds
   */
  async mergeGuests(guestIds, masterData = {}, user = "system") {
    const { saveDb, updateDb } = require("../utils/dbUtils/dbActions");

    const { guest: guestRepo, booking: bookingRepo } =
      await this.getRepositories();

    try {
      if (guestIds.length < 2) {
        throw new Error("At least 2 guest IDs are required for merging");
      }

      // Get all guests to merge
      // @ts-ignore
      const guests = await guestRepo.findByIds(guestIds, {
        relations: ["bookings"],
      });

      if (guests.length !== guestIds.length) {
        throw new Error("Some guest IDs not found");
      }

      // Determine master guest (first in array or specified)
      let masterGuest = guests[0];
      // @ts-ignore
      if (masterData.id && guestIds.includes(masterData.id)) {
        // @ts-ignore
        masterGuest = guests.find((g) => g.id === masterData.id);
      }

      const guestIdsToDelete = guestIds.filter((id) => id !== masterGuest.id);
      const guestsToDelete = guests.filter((g) => g.id !== masterGuest.id);

      // Update master guest with provided data
      Object.assign(masterGuest, masterData);
      // @ts-ignore
      masterGuest.updatedAt = new Date();

      // Transfer bookings from other guests to master guest
      for (const guest of guestsToDelete) {
        // @ts-ignore
        if (guest.bookings && guest.bookings.length > 0) {
          // @ts-ignore
          for (const booking of guest.bookings) {
            booking.guest = masterGuest;
            // @ts-ignore
            await updateDb(bookingRepo, booking);
          }
        }
      }

      // Save master guest
      // @ts-ignore
      await updateDb(guestRepo, masterGuest);

      // Delete other guests
      for (const guest of guestsToDelete) {
        // @ts-ignore
        await updateDb(guestRepo, guest);
      }

      // Log merge action
      await auditLogger.log({
        action: "MERGE",
        entity: "Guest",
        // @ts-ignore
        entityId: masterGuest.id,
        oldData: { mergedGuests: guestIdsToDelete },
        newData: { masterGuest: masterGuest.id },
        user,
      });

      console.log(
        `Merged ${guestsToDelete.length} guests into guest ID ${masterGuest.id}`,
      );

      return {
        success: true,
        masterGuest,
        mergedCount: guestsToDelete.length,
        deletedGuestIds: guestIdsToDelete,
      };
    } catch (error) {
      console.error("Failed to merge guests:", error);
      throw error;
    }
  }
}

// Create singleton instance
const guestService = new GuestService();

module.exports = guestService;

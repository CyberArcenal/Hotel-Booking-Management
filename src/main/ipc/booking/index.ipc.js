// src/main/ipc/booking/index.ipc.js - Booking Management Handler
//@ts-check
const { ipcMain } = require("electron");
const { logger } = require("../../../utils/logger");
const { AppDataSource } = require("../../db/datasource");
const { AuditLog } = require("../../../entities/AuditLog");
const { withErrorHandling } = require("../../../middlewares/errorHandler");

class BookingHandler {
  constructor() {
    // Initialize all handlers
    this.initializeHandlers();
  }

  initializeHandlers() {
    // 📋 READ-ONLY HANDLERS
    this.getAllBookings = this.importHandler("./get/all.ipc");
    this.getBookingById = this.importHandler("./get/by_id.ipc");
    this.getBookingByGuest = this.importHandler("./get/by_guest.ipc");
    this.getBookingByRoom = this.importHandler("./get/by_room.ipc");
    this.getBookingSummary = this.importHandler("./get/summary.ipc");
    this.getActiveBookings = this.importHandler("./get/active.ipc");
    this.getBookingStats = this.importHandler("./get/stats.ipc");
    this.searchBookings = this.importHandler("./search.ipc");
    this.getBookingsByDate = this.importHandler("./get/by_date.ipc");

    // ✏️ WRITE OPERATION HANDLERS
    this.createBooking = this.importHandler("./create.ipc");
    this.updateBooking = this.importHandler("./update.ipc");
    this.deleteBooking = this.importHandler("./delete.ipc");
    this.updateBookingStatus = this.importHandler("./update_status.ipc");
    this.cancelBooking = this.importHandler("./cancel.ipc");
    this.checkInBooking = this.importHandler("./check_in.ipc");
    this.checkOutBooking = this.importHandler("./check_out.ipc");
    this.markAsPaid = this.importHandler("./mark_as_paid.ipc");
    this.markAsFailed = this.importHandler("./mark_as_failed.ipc");

    // 📊 STATISTICS HANDLERS
    this.getBookingRevenue = this.importHandler("./get_revenue.ipc");
    this.getOccupancyRates = this.importHandler("./get_occupancy_rates.ipc");

    // 🔄 BATCH OPERATIONS
    this.bulkCreateBookings = this.importHandler("./bulk_create.ipc");
    this.bulkUpdateBookings = this.importHandler("./bulk_update.ipc");
    this.importBookingsFromCSV = this.importHandler("./import_csv.ipc");
    this.exportBookingsToCSV = this.importHandler("./export_csv.ipc");

    // 📄 REPORT HANDLERS
    this.generateInvoice = this.importHandler("./generate_invoice.ipc");
    this.generateBookingReport = this.importHandler("./generate_report.ipc");
  }

  /**
   * @param {string} path
   */
  importHandler(path) {
    try {
      // Adjust path to be relative to current file
      const fullPath = require.resolve(`./${path}`, { paths: [__dirname] });
      return require(fullPath);
    } catch (error) {
      console.warn(
        `[BookingHandler] Failed to load handler: ${path}`,
        // @ts-ignore
        error.message,
      );
      // Return a fallback handler
      return async () => ({
        status: false,
        message: `Handler not implemented: ${path}`,
        data: null,
      });
    }
  }

  /** @param {Electron.IpcMainInvokeEvent} event @param {{ method: any; params: {}; }} payload */
  async handleRequest(event, payload) {
    try {
      const method = payload.method;
      const params = payload.params || {};

      // @ts-ignore
      const enrichedParams = { ...params };

      // Log the request
      if (logger) {
        // @ts-ignore
        logger.info(`BookingHandler: ${method}`, { params });
      }

      // ROUTE REQUESTS
      switch (method) {
        // 📋 READ-ONLY OPERATIONS
        case "getAllBookings":
          return await this.getAllBookings(enrichedParams);

        case "getBookingById":
          return await this.getBookingById(enrichedParams);

        case "getBookingByGuest":
          return await this.getBookingByGuest(enrichedParams);

        case "getBookingByRoom":
          return await this.getBookingByRoom(enrichedParams);

        case "getBookingSummary":
          return await this.getBookingSummary(enrichedParams);

        case "getActiveBookings":
          return await this.getActiveBookings(enrichedParams);

        case "getBookingStats":
          return await this.getBookingStats(enrichedParams);

        case "searchBookings":
          return await this.searchBookings(enrichedParams);

        case "getBookingsByDate":
          return await this.getBookingsByDate(enrichedParams);

        // ✏️ WRITE OPERATIONS
        case "createBooking":
          return await this.handleWithTransaction(
            this.createBooking,
            // @ts-ignore
            enrichedParams,
          );

        case "updateBooking":
          return await this.handleWithTransaction(
            this.updateBooking,
            // @ts-ignore
            enrichedParams,
          );

        case "deleteBooking":
          return await this.handleWithTransaction(
            this.deleteBooking,
            // @ts-ignore
            enrichedParams,
          );

        case "updateBookingStatus":
          return await this.handleWithTransaction(
            this.updateBookingStatus,
            // @ts-ignore
            enrichedParams,
          );

        case "cancelBooking":
          return await this.handleWithTransaction(
            this.cancelBooking,
            // @ts-ignore
            enrichedParams,
          );

        case "checkInBooking":
          return await this.handleWithTransaction(
            this.checkInBooking,
            // @ts-ignore
            enrichedParams,
          );

        case "checkOutBooking":
          return await this.handleWithTransaction(
            this.checkOutBooking,
            // @ts-ignore
            enrichedParams,
          );
        case "markAsPaid":
          return await this.handleWithTransaction(
            this.markAsPaid,
            // @ts-ignore
            enrichedParams,
          );
        case "markAsFailed":
          return await this.handleWithTransaction(
            this.markAsFailed,
            // @ts-ignore
            enrichedParams,
          );

        // 📊 STATISTICS OPERATIONS
        case "getBookingRevenue":
          return await this.getBookingRevenue(enrichedParams);

        case "getOccupancyRates":
          return await this.getOccupancyRates(enrichedParams);

        // 🔄 BATCH OPERATIONS
        case "bulkCreateBookings":
          return await this.handleWithTransaction(
            this.bulkCreateBookings,
            // @ts-ignore
            enrichedParams,
          );

        case "bulkUpdateBookings":
          return await this.handleWithTransaction(
            this.bulkUpdateBookings,
            // @ts-ignore
            enrichedParams,
          );

        case "importBookingsFromCSV":
          return await this.handleWithTransaction(
            this.importBookingsFromCSV,
            // @ts-ignore
            enrichedParams,
          );

        case "exportBookingsToCSV":
          return await this.exportBookingsToCSV(enrichedParams);

        // 📄 REPORT OPERATIONS
        case "generateInvoice":
          return await this.generateInvoice(enrichedParams);

        case "generateBookingReport":
          return await this.generateBookingReport(enrichedParams);

        default:
          return {
            status: false,
            message: `Unknown method: ${method}`,
            data: null,
          };
      }
    } catch (error) {
      console.error("BookingHandler error:", error);
      if (logger) {
        // @ts-ignore
        logger.error("BookingHandler error:", error);
      }
      return {
        status: false,
        // @ts-ignore
        message: error.message || "Internal server error",
        data: null,
      };
    }
  }

  /**
   * Wrap critical operations in a database transaction
   * @param {(arg0: any, arg1: import("typeorm").QueryRunner) => any} handler
   * @param {{ userId: any; }} params
   */
  async handleWithTransaction(handler, params) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const result = await handler(params, queryRunner);

      if (result.status) {
        await queryRunner.commitTransaction();
      } else {
        await queryRunner.rollbackTransaction();
      }

      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * @param {any} user_id
   * @param {any} action
   * @param {any} description
   */
  async logActivity(user_id, action, description, qr = null) {
    try {
      let activityRepo;

      if (qr) {
        // @ts-ignore
        activityRepo = qr.manager.getRepository(AuditLog);
      } else {
        activityRepo = AppDataSource.getRepository(AuditLog);
      }

      const activity = activityRepo.create({
        user: user_id,
        action,
        description,
        entity: "Booking",
        timestamp: new Date(),
      });

      await activityRepo.save(activity);
    } catch (error) {
      console.warn("Failed to log booking activity:", error);
      if (logger) {
        // @ts-ignore
        logger.warn("Failed to log booking activity:", error);
      }
    }
  }
}

// Register IPC handler
const bookingHandler = new BookingHandler();

ipcMain.handle(
  "booking",
  withErrorHandling(
    // @ts-ignore
    bookingHandler.handleRequest.bind(bookingHandler),
    "IPC:booking",
  ),
);

module.exports = { BookingHandler, bookingHandler };

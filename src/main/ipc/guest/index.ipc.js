// src/main/ipc/guest/index.ipc.js - Guest Management Handler
//@ts-check
const { ipcMain } = require("electron");
const { logger } = require("../../../utils/logger");
const { AppDataSource } = require("../../db/datasource");
const { withErrorHandling } = require("../../../middlewares/errorHandler");
const { AuditLog } = require("../../../entities/AuditLog");
const { saveDb } = require("../../../utils/dbUtils/dbActions");

class GuestHandler {
  constructor() {
    // Initialize all handlers
    this.initializeHandlers();
  }

  initializeHandlers() {
    // 📋 READ-ONLY HANDLERS
    this.getAllGuests = this.importHandler("./get/all.ipc");
    this.getGuestById = this.importHandler("./get/by_id.ipc");
    this.getGuestByEmail = this.importHandler("./get/by_email.ipc");
    this.getGuestByPhone = this.importHandler("./get/by_phone.ipc");
    this.getGuestSummary = this.importHandler("./get/summary.ipc");
    this.getActiveGuests = this.importHandler("./get/active.ipc");
    this.getGuestStats = this.importHandler("./get/stats.ipc");
    this.searchGuests = this.importHandler("./search.ipc");
    this.getGuestBookings = this.importHandler("./get/bookings.ipc");

    // ✏️ WRITE OPERATION HANDLERS
    this.createGuest = this.importHandler("./create.ipc");
    this.updateGuest = this.importHandler("./update.ipc");
    this.deleteGuest = this.importHandler("./delete.ipc");
    this.updateGuestStatus = this.importHandler("./update_status.ipc");
    this.mergeGuestProfiles = this.importHandler("./merge_profiles.ipc");

    // 📊 STATISTICS HANDLERS
    this.getGuestLoyalty = this.importHandler("./get_loyalty.ipc");
    this.getGuestFrequency = this.importHandler("./get_frequency.ipc");

    // 🔄 BATCH OPERATIONS
    this.bulkCreateGuests = this.importHandler("./bulk_create.ipc");
    this.bulkUpdateGuests = this.importHandler("./bulk_update.ipc");
    this.importGuestsFromCSV = this.importHandler("./import_csv.ipc");
    this.exportGuestsToCSV = this.importHandler("./export_csv.ipc");
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
        `[GuestHandler] Failed to load handler: ${path}`,
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
        logger.info(`GuestHandler: ${method}`, { params});
      }

      // ROUTE REQUESTS
      switch (method) {
        // 📋 READ-ONLY OPERATIONS
        case "getAllGuests":
          return await this.getAllGuests(enrichedParams);

        case "getGuestById":
          return await this.getGuestById(enrichedParams);

        case "getGuestByEmail":
          return await this.getGuestByEmail(enrichedParams);

        case "getGuestByPhone":
          return await this.getGuestByPhone(enrichedParams);

        case "getGuestSummary":
          return await this.getGuestSummary(enrichedParams);

        case "getActiveGuests":
          return await this.getActiveGuests(enrichedParams);

        case "getGuestStats":
          return await this.getGuestStats(enrichedParams);

        case "searchGuests":
          return await this.searchGuests(enrichedParams);

        case "getGuestBookings":
          return await this.getGuestBookings(enrichedParams);

        // ✏️ WRITE OPERATIONS
        case "createGuest":
          return await this.handleWithTransaction(
            this.createGuest,
            // @ts-ignore
            enrichedParams,
          );

        case "updateGuest":
          return await this.handleWithTransaction(
            this.updateGuest,
            // @ts-ignore
            enrichedParams,
          );

        case "deleteGuest":
          return await this.handleWithTransaction(
            this.deleteGuest,
            // @ts-ignore
            enrichedParams,
          );

        case "updateGuestStatus":
          return await this.handleWithTransaction(
            this.updateGuestStatus,
            // @ts-ignore
            enrichedParams,
          );

        case "mergeGuestProfiles":
          return await this.handleWithTransaction(
            this.mergeGuestProfiles,
            // @ts-ignore
            enrichedParams,
          );

        // 📊 STATISTICS OPERATIONS
        case "getGuestLoyalty":
          return await this.getGuestLoyalty(enrichedParams);

        case "getGuestFrequency":
          return await this.getGuestFrequency(enrichedParams);

        // 🔄 BATCH OPERATIONS
        case "bulkCreateGuests":
          return await this.handleWithTransaction(
            this.bulkCreateGuests,
            // @ts-ignore
            enrichedParams,
          );

        case "bulkUpdateGuests":
          return await this.handleWithTransaction(
            this.bulkUpdateGuests,
            // @ts-ignore
            enrichedParams,
          );

        case "importGuestsFromCSV":
          return await this.handleWithTransaction(
            this.importGuestsFromCSV,
            // @ts-ignore
            enrichedParams,
          );

        case "exportGuestsToCSV":
          return await this.exportGuestsToCSV(enrichedParams);

        default:
          return {
            status: false,
            message: `Unknown method: ${method}`,
            data: null,
          };
      }
    } catch (error) {
      console.error("GuestHandler error:", error);
      if (logger) {
        // @ts-ignore
        logger.error("GuestHandler error:", error);
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
        entity: "Guest",
        timestamp: new Date(),
      });

      await saveDb(activityRepo, activity);
    } catch (error) {
      console.warn("Failed to log guest activity:", error);
      if (logger) {
        // @ts-ignore
        logger.warn("Failed to log guest activity:", error);
      }
    }
  }
}

// Register IPC handler
const guestHandler = new GuestHandler();

ipcMain.handle(
  "guest",
  withErrorHandling(
    // @ts-ignore
    guestHandler.handleRequest.bind(guestHandler),
    "IPC:guest",
  ),
);

module.exports = { GuestHandler, guestHandler };
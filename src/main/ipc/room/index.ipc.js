// src/main/ipc/room/index.ipc.js - Room Management Handler
//@ts-check
const { ipcMain } = require("electron");
const { logger } = require("../../../utils/logger");
const { AppDataSource } = require("../../db/datasource");
const {AuditLog} = require("../../../entities/AuditLog");
const { withErrorHandling } = require("../../../middlewares/errorHandler");

class RoomHandler {
  constructor() {
    // Initialize all handlers
    this.initializeHandlers();
  }

  initializeHandlers() {
    // 📋 READ-ONLY HANDLERS
    this.getAllRooms = this.importHandler("./get/all.ipc");
    this.getRoomById = this.importHandler("./get/by_id.ipc");
    this.getRoomByNumber = this.importHandler("./get/by_number.ipc");
    this.getAvailableRooms = this.importHandler("./get/available.ipc");
    this.getRoomSummary = this.importHandler("./get/summary.ipc");
    this.getActiveRooms = this.importHandler("./get/active.ipc");
    this.getRoomStats = this.importHandler("./get/stats.ipc");
    this.searchRooms = this.importHandler("./search.ipc");

    // ✏️ WRITE OPERATION HANDLERS
    this.createRoom = this.importHandler("./create.ipc");
    this.updateRoom = this.importHandler("./update.ipc");
    this.deleteRoom = this.importHandler("./delete.ipc");
    this.updateRoomStatus = this.importHandler("./update_status.ipc");
    this.setRoomAvailability = this.importHandler("./set_availability.ipc");

    // 📊 STATISTICS HANDLERS
    this.getRoomOccupancy = this.importHandler("./get_occupancy.ipc");
    this.getRoomTypeDistribution = this.importHandler("./get_type_distribution.ipc");

    // 🔄 BATCH OPERATIONS
    this.bulkCreateRooms = this.importHandler("./bulk_create.ipc");
    this.bulkUpdateRooms = this.importHandler("./bulk_update.ipc");
    this.importRoomsFromCSV = this.importHandler("./import_csv.ipc");
    this.exportRoomsToCSV = this.importHandler("./export_csv.ipc");
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
        `[RoomHandler] Failed to load handler: ${path}`,
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
        logger.info(`RoomHandler: ${method}`, { params});
      }

      // ROUTE REQUESTS
      switch (method) {
        // 📋 READ-ONLY OPERATIONS
        case "getAllRooms":
          return await this.getAllRooms(enrichedParams);

        case "getRoomById":
          return await this.getRoomById(enrichedParams);

        case "getRoomByNumber":
          return await this.getRoomByNumber(enrichedParams);

        case "getAvailableRooms":
          return await this.getAvailableRooms(enrichedParams);

        case "getRoomSummary":
          return await this.getRoomSummary(enrichedParams);

        case "getActiveRooms":
          return await this.getActiveRooms(enrichedParams);

        case "getRoomStats":
          return await this.getRoomStats(enrichedParams);

        case "searchRooms":
          return await this.searchRooms(enrichedParams);

        // ✏️ WRITE OPERATIONS
        case "createRoom":
          return await this.handleWithTransaction(
            this.createRoom,
            // @ts-ignore
            enrichedParams,
          );

        case "updateRoom":
          return await this.handleWithTransaction(
            this.updateRoom,
            // @ts-ignore
            enrichedParams,
          );

        case "deleteRoom":
          return await this.handleWithTransaction(
            this.deleteRoom,
            // @ts-ignore
            enrichedParams,
          );

        case "updateRoomStatus":
          return await this.handleWithTransaction(
            this.updateRoomStatus,
            // @ts-ignore
            enrichedParams,
          );

        case "setRoomAvailability":
          return await this.handleWithTransaction(
            this.setRoomAvailability,
            // @ts-ignore
            enrichedParams,
          );

        // 📊 STATISTICS OPERATIONS
        case "getRoomOccupancy":
          return await this.getRoomOccupancy(enrichedParams);

        case "getRoomTypeDistribution":
          return await this.getRoomTypeDistribution(enrichedParams);

        // 🔄 BATCH OPERATIONS
        case "bulkCreateRooms":
          return await this.handleWithTransaction(
            this.bulkCreateRooms,
            // @ts-ignore
            enrichedParams,
          );

        case "bulkUpdateRooms":
          return await this.handleWithTransaction(
            this.bulkUpdateRooms,
            // @ts-ignore
            enrichedParams,
          );

        case "importRoomsFromCSV":
          return await this.handleWithTransaction(
            this.importRoomsFromCSV,
            // @ts-ignore
            enrichedParams,
          );

        case "exportRoomsToCSV":
          return await this.exportRoomsToCSV(enrichedParams);

        default:
          return {
            status: false,
            message: `Unknown method: ${method}`,
            data: null,
          };
      }
    } catch (error) {
      console.error("RoomHandler error:", error);
      if (logger) {
        // @ts-ignore
        logger.error("RoomHandler error:", error);
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
        entity: "Room",
        timestamp: new Date(),
      });

      await activityRepo.save(activity);
    } catch (error) {
      console.warn("Failed to log room activity:", error);
      if (logger) {
        // @ts-ignore
        logger.warn("Failed to log room activity:", error);
      }
    }
  }
}

// Register IPC handler
const roomHandler = new RoomHandler();

ipcMain.handle(
  "room",
  withErrorHandling(
    // @ts-ignore
    roomHandler.handleRequest.bind(roomHandler),
    "IPC:room",
  ),
);

module.exports = { RoomHandler, roomHandler };
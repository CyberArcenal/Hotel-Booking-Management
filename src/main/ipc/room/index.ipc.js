// src/main/ipc/room/index.ipc.js - Room Management Handler
//@ts-check
const { ipcMain } = require("electron");
const { logger } = require("../../../utils/logger");
const { AppDataSource } = require("../../db/datasource");
const { AuditLog } = require("../../../entities/AuditLog");
const { withErrorHandling } = require("../../../middlewares/errorHandler");
const { saveDb } = require("../../../utils/dbUtils/dbActions");

class RoomHandler {
  constructor() {
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
    this.listRooms = this.importHandler("./list.ipc"); // newly implemented

    // ✏️ WRITE OPERATION HANDLERS
    this.createRoom = this.importHandler("./create.ipc");
    this.updateRoom = this.importHandler("./update.ipc");
    this.deleteRoom = this.importHandler("./delete.ipc");
    this.updateRoomStatus = this.importHandler("./update_status.ipc"); // now accepts status enum
    this.setRoomAvailability = this.importHandler("./set_availability.ipc"); // boolean toggle

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
      const fullPath = require.resolve(`./${path}`, { paths: [__dirname] });
      return require(fullPath);
    } catch (error) {
      // @ts-ignore
      console.warn(`[RoomHandler] Failed to load handler: ${path}`, error.message);
      return async () => ({
        status: false,
        message: `Handler not implemented: ${path}`,
        data: null,
      });
    }
  }

  /** @param {Electron.IpcMainInvokeEvent} event @param {{ method: any; params: {}; }} payload */
  // @ts-ignore
  async handleRequest(event, payload) {
    try {
      const method = payload.method;
      const params = payload.params || {};
      const enrichedParams = { ...params };

      if (logger) {
        // @ts-ignore
        logger.info(`RoomHandler: ${method}`, { params });
      }

      switch (method) {
        // 📋 READ-ONLY
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
        case "listRooms":
          return await this.listRooms(enrichedParams);

        // ✏️ WRITE
        case "createRoom":
          return await this.handleWithTransaction(this.createRoom, enrichedParams);
        case "updateRoom":
          return await this.handleWithTransaction(this.updateRoom, enrichedParams);
        case "deleteRoom":
          return await this.handleWithTransaction(this.deleteRoom, enrichedParams);
        case "updateRoomStatus":
          return await this.handleWithTransaction(this.updateRoomStatus, enrichedParams);
        case "setRoomAvailability":
          return await this.handleWithTransaction(this.setRoomAvailability, enrichedParams);

        // 📊 STATISTICS
        case "getRoomOccupancy":
          return await this.getRoomOccupancy(enrichedParams);
        case "getRoomTypeDistribution":
          return await this.getRoomTypeDistribution(enrichedParams);

        // 🔄 BATCH
        case "bulkCreateRooms":
          return await this.handleWithTransaction(this.bulkCreateRooms, enrichedParams);
        case "bulkUpdateRooms":
          return await this.handleWithTransaction(this.bulkUpdateRooms, enrichedParams);
        case "importRoomsFromCSV":
          return await this.handleWithTransaction(this.importRoomsFromCSV, enrichedParams);
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
      // @ts-ignore
      if (logger) logger.error("RoomHandler error:", error);
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
   * @param {Object} params
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
   * @param {string|number} userId
   * @param {string} action
   * @param {number} entityId
   * @param {import('typeorm').QueryRunner} [qr]
   */
  // @ts-ignore
  async logActivity(userId, action, entityId, qr = null) {
    try {
      const repo = qr
        ? qr.manager.getRepository(AuditLog)
        : AppDataSource.getRepository(AuditLog);

      const log = repo.create({
        user: String(userId),
        action,
        entity: "Room",
        entityId: entityId || null,
        timestamp: new Date(),
      });

      await saveDb(repo, log);
    } catch (error) {
      console.warn("Failed to log room activity:", error);
      // @ts-ignore
      if (logger) logger.warn("Failed to log room activity:", error);
    }
  }
}

const roomHandler = new RoomHandler();
ipcMain.handle(
  "room",
  // @ts-ignore
  withErrorHandling(roomHandler.handleRequest.bind(roomHandler), "IPC:room")
);

module.exports = { RoomHandler, roomHandler };
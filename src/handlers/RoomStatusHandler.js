// handlers/RoomStatusHandler.js
//@ts-check
const RoomStatusService = require("../transitionServices/RoomStatusService");
const { logger } = require("../utils/logger");

class RoomStatusHandler {
  /**
   * Central dispatcher for room status changes
   * @param {import("../entities/Room").Room} room
   * @param {string} oldStatus
   * @param {string} newStatus
   */
  static async handleStatusChange(room, oldStatus, newStatus) {
    // @ts-ignore
    logger.info(`[RoomStatusHandler] Room ${room.id} status change: ${oldStatus} → ${newStatus}`);

    switch (newStatus) {
      case "available":
        return this.onAvailable(room, oldStatus);
      case "occupied":
        return this.onOccupied(room, oldStatus);
      case "maintenance":
        return this.onMaintenance(room, oldStatus);
      default:
        logger.info(`[RoomStatusHandler] No handler for status: ${newStatus}`);
        return null;
    }
  }

  // @ts-ignore
  static async onAvailable(room, oldStatus) {
    logger.info(`[RoomStatusHandler] onAvailable for room ${room.id}`);
    return RoomStatusService.available(room, oldStatus);
  }

  // @ts-ignore
  static async onOccupied(room, oldStatus) {
    logger.info(`[RoomStatusHandler] onOccupied for room ${room.id}`);
    return RoomStatusService.occupied(room, oldStatus);
  }

  // @ts-ignore
  static async onMaintenance(room, oldStatus) {
    logger.info(`[RoomStatusHandler] onMaintenance for room ${room.id}`);
    return RoomStatusService.maintenance(room, oldStatus);
  }
}

module.exports = RoomStatusHandler;

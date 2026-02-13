// transitionServices/RoomStatusService.js
// @ts-check

const { logger } = require("../utils/logger");

class RoomStatusService {
  /**
   * Handle transition to AVAILABLE
   * @param {{ id: any; updatedBy: any; status: any; }} room
   * @param {any} oldStatus
   */
  static async available(room, oldStatus) {
    logger.debug(`[RoomStatusService] Room ${room.id} marked AVAILABLE`);

    return room;
  }

  /**
   * Handle transition to OCCUPIED
   * @param {{ id: any; updatedBy: any; status: any; }} room
   * @param {any} oldStatus
   */
  static async occupied(room, oldStatus) {
    logger.debug(`[RoomStatusService] Room ${room.id} marked OCCUPIED`);

    return room;
  }

  /**
   * Handle transition to MAINTENANCE
   * @param {{ id: any; updatedBy: any; status: any; }} room
   * @param {any} oldStatus
   */
  static async maintenance(room, oldStatus) {
    logger.debug(`[RoomStatusService] Room ${room.id} marked MAINTENANCE`);

    return room;
  }
}

module.exports = RoomStatusService;

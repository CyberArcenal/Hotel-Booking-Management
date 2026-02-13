// subscribers/RoomSubscriber.js
// @ts-check
const { Room } = require("../entities/Room");

const { logger } = require("../utils/logger");

class RoomSubscriber {
  listenTo() {
    return Room;
  }

  /**
   * @param {any} entity
   */
  beforeInsert(entity) {
    logger.info("OOM BEFORE INSERT TRIGGERED!", entity);
  }

  /**
   * @param {{ id: any; status: any; isAvailable: any; }} entity
   */
  beforeUpdate(entity) {
    // @ts-ignore
    logger.info("ROOM BEFORE UPDATE TRIGGERED!", entity);
  }

  /**
   * @param {{ databaseEntity: any; entity: any; }} event
   */
  async afterUpdate(event) {
    const RoomStatusHandler = require("../handlers/RoomStatusHandler");
    const { databaseEntity, entity } = event;
    // @ts-ignore
    logger.info("ROOM AFTER UPDATE TRIGGERED!", entity);

    if (databaseEntity.status !== entity.status) {
      await RoomStatusHandler.handleStatusChange(entity, databaseEntity.status, entity.status);
    }
  }

  /**
   * @param {any} entity
   */
  afterInsert(entity) {
    logger.info("ROOM AFTER INSERT TRIGGERED!", entity);
  }

  /**
   * @param {any} entityId
   */
  afterRemove(entityId) {
    logger.info("ROOM AFTER REMOVE TRIGGERED!", entityId);
  }
}

module.exports = RoomSubscriber;


/**
 * RoomSubscriber
 *
 * Responsibilities:
 * - Listen to Room entity lifecycle events (insert, update, remove).
 * - Log before/after insert/update/remove for audit clarity.
 * - On afterUpdate, only trigger RoomStatusHandler if status actually changed.
 *
 * Safety Rules:
 * - Always use optional chaining when accessing entity/databaseEntity fields.
 * - Never assume entity is fully hydrated; log defensively.
 * - RoomStatusHandler is the only place for business logic; subscriber just dispatches.
 */

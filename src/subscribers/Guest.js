// subscribers/GuestSubscriber.js
// @ts-check
const { Guest } = require("../entities/Guest");
const { logger } = require("../utils/logger");

class GuestSubscriber {
  constructor() {
    logger.info("✅ GuestSubscriber loaded and registered");
  }

  listenTo() {
    return Guest;
  }

  // BEFORE hooks
  /**
   * @param {any} entity
   */
  beforeInsert(entity) {
    logger.info("[GuestSubscriber] Before insert:", entity);
    // pwede kang maglagay ng validation o defaults dito
  }

  /**
   * @param {{ id: any; }} entity
   */
  beforeUpdate(entity) {
    logger.info("[GuestSubscriber] Before update:", entity.id);
  }

  /**
   * @param {{ id: any; }} entity
   */
  beforeRemove(entity) {
    logger.info("[GuestSubscriber] Before remove:", entity.id);
  }

  // AFTER hooks
  /**
   * @param {any} entity
   */
  afterInsert(entity) {
    logger.info("[GuestSubscriber] Guest created:", entity);
    // pwede kang mag‑emit ng notification o mag‑audit log
  }

  /**
   * @param {any} entity
   */
  afterUpdate(entity) {
    logger.info("[GuestSubscriber] Guest updated:", entity);
  }

  /**
   * @param {any} entityId
   */
  afterRemove(entityId) {
    logger.info("[GuestSubscriber] Guest deleted:", entityId);
  }
}

module.exports = GuestSubscriber;

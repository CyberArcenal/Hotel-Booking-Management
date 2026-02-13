// subscribers/AuditLogSubscriber.js
// @ts-check
const { AuditLog } = require("../entities/AuditLog");
const { logger } = require("../utils/logger");

class AuditLogSubscriber {
  constructor() {
    // logger.info("✅ AuditLogSubscriber loaded and registered");
  }

  listenTo() {
    return AuditLog;
  }

  // BEFORE hooks
  /**
   * @param {any} entity
   */
  beforeInsert(entity) {
    // logger.info("[AuditLogSubscriber] Before insert:", entity);
    // pwede kang mag‑validate o mag‑set ng defaults dito
  }

  /**
   * @param {any} entity
   */
  beforeUpdate(entity) {
    // logger.info("[AuditLogSubscriber] Before update:", entity);
  }

  /**
   * @param {{ id: any; }} entity
   */
  beforeRemove(entity) {
    // logger.info("[AuditLogSubscriber] Before remove:", entity.id);
  }

  // AFTER hooks
  /**
   * @param {any} entity
   */
  afterInsert(entity) {
    // logger.info("[AuditLogSubscriber] Audit log created:", entity);
    // pwede kang mag‑emit ng notification o mag‑insert ng audit trail
  }

  /**
   * @param {any} entity
   */
  afterUpdate(entity) {
    // logger.info("[AuditLogSubscriber] Audit log updated:", entity);
  }

  /**
   * @param {any} entityId
   */
  afterRemove(entityId) {
    // logger.info("[AuditLogSubscriber] Audit log deleted:", entityId);
  }
}

module.exports = AuditLogSubscriber;

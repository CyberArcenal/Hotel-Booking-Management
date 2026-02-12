//@ts-check
const { AuditLog } = require("../entities/AuditLog");

class AuditLogSubscriber {
    constructor() {
    console.log("✅ AuditLogSubscriber loaded and registered");
  }
  listenTo() {
    return AuditLog;
  }

  /**
     * @param {{ entity: any; }} event
     */
  afterInsert(event) {
    console.log("Audit log created:", event.entity);
  }

  /**
     * @param {{ entity: any; }} event
     */
  afterUpdate(event) {
    console.log("Audit log updated:", event.entity);
  }

  /**
     * @param {{ entityId: any; }} event
     */
  afterRemove(event) {
    console.log("Audit log deleted:", event.entityId);
  }
}

module.exports =  AuditLogSubscriber ;
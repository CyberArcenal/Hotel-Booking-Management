// AuditLog.js placeholder
const { EntitySchema } = require("typeorm");

const AuditLog = new EntitySchema({
  name: "AuditLog",
  tableName: "audit_logs",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true
    },
    action: {
      type: "varchar"
    },
    entity: {
      type: "varchar"
    },
    entityId: {
      type: "int"
    },
    timestamp: {
      type: "datetime",
      createDate: true
    },
    user: {
      type: "varchar",
      nullable: true
    }
  }
});

module.exports = { AuditLog };
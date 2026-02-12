const { Room } = require("../entities/Room");

//@ts-check
class RoomSubscriber {
  constructor() {
    console.log("✅ RoomSubscriber instance CREATED by TypeORM");
  }

  listenTo() {
    return Room;
  }

  afterInsert(event) {
    console.log("🔥🔥🔥 ROOM AFTER INSERT TRIGGERED!", event.entity);
  }

  afterUpdate(event) {
    console.log("🔥🔥🔥 ROOM AFTER UPDATE TRIGGERED!", {
      id: event.entity?.id,
      status: event.entity?.status,
      isAvailable: event.entity?.isAvailable
    });
  }

  afterRemove(event) {
    console.log("🔥 ROOM AFTER REMOVE TRIGGERED!", event.entityId);
  }
}

// ←←← Direkta ang class
module.exports = RoomSubscriber;
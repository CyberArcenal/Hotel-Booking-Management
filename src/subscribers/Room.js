const { EntitySubscriberInterface } = require("typeorm");
const { Room } = require("../entities/Room");

class RoomSubscriber {
  listenTo() {
    return Room;
  }

  afterInsert(event) {
    console.log("Room created:", event.entity);
  }

  afterUpdate(event) {
    console.log("Room updated:", event.entity);
  }

  afterRemove(event) {
    console.log("Room deleted:", event.entityId);
  }
}

module.exports = RoomSubscriber;
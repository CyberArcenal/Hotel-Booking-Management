const { EntitySubscriberInterface } = require("typeorm");
const { Guest } = require("../entities/Guest");

class GuestSubscriber {
  listenTo() {
    return Guest;
  }

  afterInsert(event) {
    console.log("Guest created:", event.entity);
  }

  afterUpdate(event) {
    console.log("Guest updated:", event.entity);
  }

  afterRemove(event) {
    console.log("Guest deleted:", event.entityId);
  }
}

module.exports = GuestSubscriber;
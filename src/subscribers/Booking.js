const { EntitySubscriberInterface } = require("typeorm");
const { Booking } = require("../entities/Booking");

class BookingSubscriber {
  constructor() {
    console.log("✅ BookingSubscriber loaded and registered");
  }
  listenTo() {
    return Booking;
  }

  afterInsert(event) {
    console.log("Booking created:", event.entity);
  }

  afterUpdate(event) {
    console.log("Booking updated:", event.entity);
  }

  afterRemove(event) {
    console.log("Booking cancelled:", event.entityId);
  }

  
}

module.exports =  BookingSubscriber ;
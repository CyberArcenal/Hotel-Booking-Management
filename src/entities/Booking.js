const { EntitySchema } = require("typeorm");

const Booking = new EntitySchema({
  name: "Booking",
  tableName: "bookings",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true
    },
    checkInDate: {
      type: "date"
    },
    checkOutDate: {
      type: "date"
    },
    numberOfGuests: {  // ✅ ADD THIS: Important for capacity check
      type: "int",
      default: 1
    },
    totalPrice: {
      type: "float",  // ✅ CHANGE: decimal → float
      precision: 10,
      scale: 2
    },
    status: {
      type: "varchar",
      default: "confirmed"
    },
    specialRequests: {  // ✅ ADD THIS: For guest preferences
      type: "text",
      nullable: true
    },
    createdAt: {  // ✅ ADD THIS: For audit trail
      type: "datetime",
      createDate: true
    }
  },
  relations: {
    room: {
      target: "Room",
      type: "many-to-one",
      joinColumn: {
        name: "roomId",
        referencedColumnName: "id"
      },
      onDelete: "CASCADE"  // ✅ ADD THIS: Delete bookings when room is deleted
    },
    guest: {
      target: "Guest",
      type: "many-to-one",
      joinColumn: {
        name: "guestId",
        referencedColumnName: "id"
      },
      onDelete: "CASCADE"  // ✅ ADD THIS: Delete bookings when guest is deleted
    }
  }
});

module.exports = { Booking };
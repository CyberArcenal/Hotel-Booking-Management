const { EntitySchema } = require("typeorm");

const Room = new EntitySchema({
  name: "Room",
  tableName: "rooms",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    roomNumber: {
      type: "varchar",
      unique: true, // ✅ ADD THIS: Para walang duplicate room numbers
    },
    type: {
      type: "varchar",
      enum: [
        "standard",
        "single",
        "double",
        "twin",
        "suite",
        "deluxe",
        "family",
        "studio",
        "executive",
      ],
    },
    capacity: {
      type: "int",
    },
    pricePerNight: {
      type: "float", // ✅ CHANGE: decimal → float (SQLite compatible)
      precision: 10,
      scale: 2,
    },
    isAvailable: {
      type: "boolean",
      default: true,
    },
    amenities: {
      // ✅ ADD THIS: Para sa features ng room
      type: "text",
      nullable: true,
    },
    createdAt: {
      // ✅ ADD THIS: For auditing
      type: "datetime",
      createDate: true,
    },
  },
  relations: {
    bookings: {
      target: "Booking",
      type: "one-to-many",
      inverseSide: "room",
    },
  },
});

module.exports = { Room };

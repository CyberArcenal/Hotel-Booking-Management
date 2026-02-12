const { EntitySchema } = require("typeorm");

const Booking = new EntitySchema({
  name: "Booking",
  tableName: "bookings",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    checkInDate: {
      type: "date",
    },
    checkOutDate: {
      type: "date",
    },
    numberOfGuests: {
      // ✅ ADD THIS: Important for capacity check
      type: "int",
      default: 1,
    },
    totalPrice: {
      type: "float", // ✅ CHANGE: decimal → float
      precision: 10,
      scale: 2,
    },
    status: {
      type: "varchar",
      default: "pending",
      enum: ["pending", "confirmed", "checked_in", "checked_out", "cancelled"], // ✅ ADD THIS: For booking lifecycle
    },
    paymentStatus: {
      type: "varchar",
      default: "pending",
      enum: ["pending", "paid", "failed"],
    },
    specialRequests: {
      // ✅ ADD THIS: For guest preferences
      type: "text",
      nullable: true,
    },
    createdAt: {
      // ✅ ADD THIS: For audit trail
      type: "datetime",
      createDate: true,
    },
  },
  relations: {
    room: {
      target: "Room",
      type: "many-to-one",
      joinColumn: true,
      inverseSide: "bookings",
      onDelete: "CASCADE",
    },
    guest: {
      target: "Guest",
      type: "many-to-one",
      joinColumn: true,
      inverseSide: "bookings",
      onDelete: "CASCADE",
    },
  },
});

module.exports = { Booking };

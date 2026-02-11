const { EntitySchema } = require("typeorm");

const Guest = new EntitySchema({
  name: "Guest",
  tableName: "guests",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true
    },
    fullName: {
      type: "varchar"
    },
    email: {
      type: "varchar",
      unique: true  // ✅ ADD THIS: Para unique email per guest
    },
    phone: {
      type: "varchar"
    },
    address: {  // ✅ ADD THIS: Optional but useful
      type: "varchar",
      nullable: true
    },
    idNumber: {  // ✅ ADD THIS: For ID verification
      type: "varchar",
      nullable: true
    },
    createdAt: {  // ✅ ADD THIS: For tracking
      type: "datetime",
      createDate: true
    }
  },
  relations: {
    bookings: {
      target: "Booking",
      type: "one-to-many",
      inverseSide: "guest"
    }
  }
});

module.exports = { Guest };
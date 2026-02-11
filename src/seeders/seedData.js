// seed.js
const { DataSource } = require("typeorm");
const { AppDataSource } = require("../main/db/datasource");
const { Booking } = require("../entities/Booking");
const { AuditLog } = require("../entities/AuditLog");
const { Guest } = require("../entities/Guest");
const { Room } = require("../entities/Room");
const { SystemSetting, SettingType } = require("../entities/systemSettings");

// ========== HELPER FUNCTIONS ==========
const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min, max, decimals = 2) =>
  +(Math.random() * (max - min) + min).toFixed(decimals);
const randomDate = (start, end) =>
  new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
const randomPastDate = () => randomDate(new Date(2024, 0, 1), new Date());
const randomFutureDate = () => randomDate(new Date(), new Date(2026, 11, 31));
const randomArrayElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomPhone = () => `09${randomInt(100000000, 999999999)}`;
const randomEmail = (name) =>
  `${name.toLowerCase().replace(/\s/g, "")}${randomInt(1, 999)}@example.com`;

// ========== SEED CONFIGURATION ==========
const ROOM_COUNT = 15;
const GUEST_COUNT = 40;
const BOOKING_COUNT = 80;
const AUDIT_LOG_COUNT = 30;

// ========== MAIN SEED FUNCTION ==========
async function seed() {
  try {
    console.log("⏳ Initializing database connection...");
    await AppDataSource.initialize();
    console.log("✅ Database connected!");

    // ---------- CLEAR EXISTING DATA (order matters due to FK) ----------
    console.log("🧹 Clearing old data...");
    await AppDataSource.query("PRAGMA foreign_keys = OFF;");
    await AppDataSource.getRepository(Booking).clear();
    await AppDataSource.getRepository(AuditLog).clear();
    await AppDataSource.getRepository(Guest).clear();
    await AppDataSource.getRepository(Room).clear();
    await AppDataSource.getRepository(SystemSetting).clear();
    await AppDataSource.query("PRAGMA foreign_keys = ON;");

    // ---------- SEED ROOMS ----------
    console.log(`🏨 Seeding ${ROOM_COUNT} rooms...`);
    const roomTypes = ["Standard", "Deluxe", "Suite", "Family", "Executive"];
    const amenitiesList = [
      "WiFi, Aircon, TV",
      "WiFi, Aircon, TV, Mini-bar",
      "WiFi, Aircon, TV, Kitchenette",
      "WiFi, Aircon, TV, Balcony, Jacuzzi",
      "WiFi, Aircon, TV, Ocean View",
    ];
    const rooms = [];
    for (let i = 1; i <= ROOM_COUNT; i++) {
      const type = randomArrayElement(roomTypes);
      const capacity =
        type === "Suite"
          ? 4
          : type === "Family"
            ? 6
            : type === "Deluxe"
              ? 3
              : 2;
      rooms.push({
        roomNumber: `${String(i).padStart(3, "0")}`,
        type,
        capacity,
        pricePerNight: randomFloat(1200, 5500),
        isAvailable: Math.random() > 0.2, // 80% available
        amenities: randomArrayElement(amenitiesList),
      });
    }
    const savedRooms = await AppDataSource.getRepository(Room).save(rooms);
    console.log(`✅ ${savedRooms.length} rooms saved.`);

    // ---------- SEED GUESTS ----------
    console.log(`👤 Seeding ${GUEST_COUNT} guests...`);
    const firstNames = [
      "Juan",
      "Maria",
      "Jose",
      "Ana",
      "Pedro",
      "Rosa",
      "Carlo",
      "Lisa",
      "Mark",
      "Sarah",
    ];
    const lastNames = [
      "Dela Cruz",
      "Santos",
      "Reyes",
      "Gonzales",
      "Flores",
      "Villanueva",
      "Cruz",
      "Lopez",
    ];
    const guests = [];
    for (let i = 0; i < GUEST_COUNT; i++) {
      const firstName = randomArrayElement(firstNames);
      const lastName = randomArrayElement(lastNames);
      const fullName = `${firstName} ${lastName}`;
      guests.push({
        fullName,
        email: randomEmail(fullName),
        phone: randomPhone(),
        address: `${randomInt(10, 999)} ${randomArrayElement(["Rizal St", "Mabini St", "Bonifacio St", "Luna St"])}, ${randomArrayElement(["Manila", "Quezon City", "Makati", "Cebu", "Davao"])}`,
        idNumber:
          Math.random() > 0.3
            ? `${randomInt(1000, 9999)}-${randomInt(100000, 999999)}`
            : null,
      });
    }
    const savedGuests = await AppDataSource.getRepository(Guest).save(guests);
    console.log(`✅ ${savedGuests.length} guests saved.`);

    // ---------- SEED BOOKINGS ----------
    console.log(`📅 Seeding ${BOOKING_COUNT} bookings...`);
    const statuses = ["confirmed", "checked-in", "checked-out", "cancelled"];
    const bookings = [];
    for (let i = 0; i < BOOKING_COUNT; i++) {
      const room = randomArrayElement(savedRooms);
      const guest = randomArrayElement(savedGuests);
      const isPast = Math.random() > 0.5;
      let checkIn, checkOut;
      if (isPast) {
        checkIn = randomPastDate();
        checkOut = new Date(checkIn);
        checkOut.setDate(checkOut.getDate() + randomInt(1, 5));
        if (checkOut > new Date()) checkOut = new Date(); // para hindi future
      } else {
        checkIn = randomFutureDate();
        checkOut = new Date(checkIn);
        checkOut.setDate(checkOut.getDate() + randomInt(1, 7));
      }
      const nights = (checkOut - checkIn) / (1000 * 60 * 60 * 24);
      const numberOfGuests = randomInt(1, room.capacity);
      const totalPrice = +(room.pricePerNight * nights).toFixed(2);
      const status = isPast
        ? randomArrayElement(["checked-out", "cancelled"])
        : randomArrayElement(["confirmed", "checked-in", "cancelled"]);

      bookings.push({
        checkInDate: checkIn.toISOString().split("T")[0],
        checkOutDate: checkOut.toISOString().split("T")[0],
        numberOfGuests,
        totalPrice,
        status,
        specialRequests:
          Math.random() > 0.7 ? "Extra pillow, non-smoking" : null,
        room: { id: room.id },
        guest: { id: guest.id },
      });
    }
    const savedBookings =
      await AppDataSource.getRepository(Booking).save(bookings);
    console.log(`✅ ${savedBookings.length} bookings saved.`);

    // ---------- SEED AUDIT LOGS ----------
    console.log(`📝 Seeding ${AUDIT_LOG_COUNT} audit logs...`);
    const actions = ["CREATE", "UPDATE", "DELETE", "VIEW"];
    const entities = ["Room", "Guest", "Booking", "SystemSetting"];
    const auditLogs = [];
    for (let i = 0; i < AUDIT_LOG_COUNT; i++) {
      auditLogs.push({
        action: randomArrayElement(actions),
        entity: randomArrayElement(entities),
        entityId: randomInt(1, 100),
        timestamp: randomPastDate(),
        user: Math.random() > 0.5 ? "admin" : "system",
      });
    }
    await AppDataSource.getRepository(AuditLog).save(auditLogs);
    console.log(`✅ ${AUDIT_LOG_COUNT} audit logs saved.`);

    // ---------- SEED SYSTEM SETTINGS ----------
    console.log(`⚙️ Seeding system settings...`);
    const settings = [
      {
        key: "hotel_name",
        value: "HotelBookingManagement Lite",
        setting_type: SettingType.GENERAL,
        description: "Hotel display name",
        is_public: true,
      },
      {
        key: "default_checkin_time",
        value: "14:00",
        setting_type: SettingType.GENERAL,
        description: "Default check-in time",
        is_public: true,
      },
      {
        key: "default_checkout_time",
        value: "12:00",
        setting_type: SettingType.GENERAL,
        description: "Default check-out time",
        is_public: true,
      },
      {
        key: "currency",
        value: "PHP",
        setting_type: SettingType.GENERAL,
        description: "Currency used for pricing",
        is_public: true,
      },
      {
        key: "tax_rate",
        value: "12",
        setting_type: SettingType.GENERAL,
        description: "VAT percentage",
        is_public: false,
      },
      {
        key: "max_advance_booking_days",
        value: "180",
        setting_type: SettingType.GENERAL,
        description: "Maximum days in advance for booking",
        is_public: false,
      },
      {
        key: "enable_audit_log",
        value: "true",
        setting_type: SettingType.GENERAL,
        description: "Enable audit trail",
        is_public: false,
      },
    ];
    await AppDataSource.getRepository(SystemSetting).save(settings);
    console.log(`✅ ${settings.length} system settings saved.`);

    console.log("\n🎉 SEED COMPLETED SUCCESSFULLY!");
    console.log(`   Rooms: ${savedRooms.length}`);
    console.log(`   Guests: ${savedGuests.length}`);
    console.log(`   Bookings: ${savedBookings.length}`);
    console.log(`   Audit Logs: ${AUDIT_LOG_COUNT}`);
    console.log(`   System Settings: ${settings.length}`);

    await AppDataSource.destroy();
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seed();

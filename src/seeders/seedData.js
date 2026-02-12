// seed.js (refactored & fixed)
const { DataSource, QueryRunner } = require("typeorm");
const { AppDataSource } = require("../main/db/datasource");
const { Booking } = require("../entities/Booking");
const { AuditLog } = require("../entities/AuditLog");
const { Guest } = require("../entities/Guest");
const { Room } = require("../entities/Room");
const { SystemSetting, SettingType } = require("../entities/systemSettings");

// ========== CONFIGURATION ==========
const DEFAULT_CONFIG = {
  roomCount: 15,
  guestCount: 40,
  bookingCount: 80,
  auditLogCount: 30,
  clearOnly: false,
  skipRooms: false,
  skipGuests: false,
  skipBookings: false,
  skipAuditLogs: false,
  skipSystemSettings: false,
};

// ========== RANDOM HELPERS ==========
const random = {
  int: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
  float: (min, max, decimals = 2) => +(Math.random() * (max - min) + min).toFixed(decimals),
  date: (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())),
  pastDate: () => random.date(new Date(2024, 0, 1), new Date()),
  futureDate: () => random.date(new Date(), new Date(2026, 11, 31)),
  element: (arr) => arr[Math.floor(Math.random() * arr.length)],
  phone: () => `09${random.int(100000000, 999999999)}`,
  email: (name, usedSet) => {
    let base = name.toLowerCase().replace(/\s/g, '');
    let email;
    do {
      email = `${base}${random.int(1, 9999)}@example.com`;
    } while (usedSet.has(email));
    usedSet.add(email);
    return email;
  },
};

// ========== SEEDER CLASS ==========
class DatabaseSeeder {
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.dataSource = null;
    this.queryRunner = null;
    this.usedEmails = new Set();
    this.existingRoomNumbers = new Set();
  }

  async init() {
    console.log('⏳ Initializing database connection...');
    this.dataSource = await AppDataSource.initialize();
    this.queryRunner = this.dataSource.createQueryRunner();
    console.log('✅ Database connected');
  }

  async destroy() {
    if (this.queryRunner) await this.queryRunner.release();
    if (this.dataSource) await this.dataSource.destroy();
    console.log('🔒 Connection closed');
  }

  async clearData() {
    console.log('🧹 Clearing old data...');
    await this.queryRunner.query('PRAGMA foreign_keys = OFF;');
    try {
      await this.queryRunner.clearTable('bookings');
      await this.queryRunner.clearTable('audit_logs');
      await this.queryRunner.clearTable('guests');
      await this.queryRunner.clearTable('rooms');
      await this.queryRunner.clearTable('system_settings');
    } finally {
      await this.queryRunner.query('PRAGMA foreign_keys = ON;');
    }
    console.log('✅ All tables cleared');
  }

  async seedRooms() {
    console.log(`🏨 Seeding ${this.config.roomCount} rooms...`);
    
    // ✅ FIXED: room types must match the enum in Room.js (lowercase)
    const roomTypes = ['standard', 'deluxe', 'suite', 'family', 'executive'];
    const amenitiesList = [
      'WiFi, Aircon, TV',
      'WiFi, Aircon, TV, Mini-bar',
      'WiFi, Aircon, TV, Kitchenette',
      'WiFi, Aircon, TV, Balcony, Jacuzzi',
      'WiFi, Aircon, TV, Ocean View',
    ];

    const rooms = [];
    for (let i = 1; i <= this.config.roomCount; i++) {
      const type = random.element(roomTypes);
      // capacity mapping based on the fixed lowercase type
      const capacity =
        type === 'suite' ? 4
        : type === 'family' ? 6
        : type === 'deluxe' ? 3
        : 2;  // standard or executive

      const roomNumber = String(i).padStart(3, '0');
      rooms.push({
        roomNumber,
        type,
        capacity,
        pricePerNight: random.float(1200, 5500),
        isAvailable: Math.random() > 0.2,
        amenities: random.element(amenitiesList),
        // status defaults to 'available' – not set explicitly
      });
    }

    const repo = this.dataSource.getRepository(Room);
    const saved = await repo.save(rooms);
    console.log(`✅ ${saved.length} rooms saved`);
    return saved;
  }

  async seedGuests() {
    console.log(`👤 Seeding ${this.config.guestCount} guests...`);
    const firstNames = ['Juan', 'Maria', 'Jose', 'Ana', 'Pedro', 'Rosa', 'Carlo', 'Lisa', 'Mark', 'Sarah'];
    const lastNames = ['Dela Cruz', 'Santos', 'Reyes', 'Gonzales', 'Flores', 'Villanueva', 'Cruz', 'Lopez'];
    const streets = ['Rizal St', 'Mabini St', 'Bonifacio St', 'Luna St'];
    const cities = ['Manila', 'Quezon City', 'Makati', 'Cebu', 'Davao'];

    const guests = [];
    for (let i = 0; i < this.config.guestCount; i++) {
      const firstName = random.element(firstNames);
      const lastName = random.element(lastNames);
      const fullName = `${firstName} ${lastName}`;
      guests.push({
        fullName,
        email: random.email(fullName, this.usedEmails),
        phone: random.phone(),
        address: `${random.int(10, 999)} ${random.element(streets)}, ${random.element(cities)}`,
        idNumber: Math.random() > 0.3 ? `${random.int(1000, 9999)}-${random.int(100000, 999999)}` : null,
      });
    }

    const repo = this.dataSource.getRepository(Guest);
    const saved = await repo.save(guests);
    console.log(`✅ ${saved.length} guests saved`);
    return saved;
  }

  async seedBookings(rooms, guests) {
    console.log(`📅 Seeding ${this.config.bookingCount} bookings...`);
    const statuses = ['confirmed', 'checked_in', 'checked_out', 'cancelled'];
    const bookings = [];

    for (let i = 0; i < this.config.bookingCount; i++) {
      const room = random.element(rooms);
      const guest = random.element(guests);
      const isPast = Math.random() > 0.5;

      let checkIn, checkOut;
      if (isPast) {
        checkIn = random.pastDate();
        checkOut = new Date(checkIn);
        checkOut.setDate(checkOut.getDate() + random.int(1, 5));
        if (checkOut > new Date()) checkOut = new Date();
      } else {
        checkIn = random.futureDate();
        checkOut = new Date(checkIn);
        checkOut.setDate(checkOut.getDate() + random.int(1, 7));
      }

      const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      const numberOfGuests = random.int(1, room.capacity);
      const totalPrice = +(room.pricePerNight * nights).toFixed(2);
      const status = isPast
        ? random.element(['checked_out', 'cancelled'])
        : random.element(['confirmed', 'checked_in', 'cancelled']);

      bookings.push({
        checkInDate: checkIn.toISOString().split('T')[0],
        checkOutDate: checkOut.toISOString().split('T')[0],
        numberOfGuests,
        totalPrice,
        status,
        specialRequests: Math.random() > 0.7 ? 'Extra pillow, non-smoking' : null,
        room: { id: room.id },
        guest: { id: guest.id },
      });
    }

    const repo = this.dataSource.getRepository(Booking);
    const saved = await repo.save(bookings);
    console.log(`✅ ${saved.length} bookings saved`);
    return saved;
  }

  async seedAuditLogs() {
    console.log(`📝 Seeding ${this.config.auditLogCount} audit logs...`);
    const actions = ['CREATE', 'UPDATE', 'DELETE', 'VIEW'];
    const entities = ['Room', 'Guest', 'Booking', 'SystemSetting'];

    const logs = [];
    for (let i = 0; i < this.config.auditLogCount; i++) {
      logs.push({
        action: random.element(actions),
        entity: random.element(entities),
        entityId: random.int(1, 100),
        timestamp: random.pastDate(),
        user: Math.random() > 0.5 ? 'admin' : 'system',
      });
    }

    const repo = this.dataSource.getRepository(AuditLog);
    await repo.save(logs);
    console.log(`✅ ${this.config.auditLogCount} audit logs saved`);
  }

  async seedSystemSettings() {
    console.log('⚙️ Seeding system settings...');
    const settings = [
      { key: 'hotel_name', value: 'HotelBookingManagement Lite', setting_type: SettingType.GENERAL, description: 'Hotel display name', is_public: true },
      { key: 'default_checkin_time', value: '14:00', setting_type: SettingType.GENERAL, description: 'Default check-in time', is_public: true },
      { key: 'default_checkout_time', value: '12:00', setting_type: SettingType.GENERAL, description: 'Default check-out time', is_public: true },
      { key: 'currency', value: 'PHP', setting_type: SettingType.GENERAL, description: 'Currency used for pricing', is_public: true },
      { key: 'tax_rate', value: '12', setting_type: SettingType.GENERAL, description: 'VAT percentage', is_public: false },
      { key: 'max_advance_booking_days', value: '180', setting_type: SettingType.GENERAL, description: 'Maximum days in advance for booking', is_public: false },
      { key: 'enable_audit_log', value: 'true', setting_type: SettingType.GENERAL, description: 'Enable audit trail', is_public: false },
    ];

    const repo = this.dataSource.getRepository(SystemSetting);
    await repo.save(settings);
    console.log(`✅ ${settings.length} system settings saved`);
    return settings;
  }

  async run() {
    try {
      await this.init();
      await this.queryRunner.startTransaction();

      if (!this.config.clearOnly) {
        await this.clearData();
      }

      if (this.config.clearOnly) {
        console.log('🧹 Clear only mode – no seeding performed.');
        await this.queryRunner.commitTransaction();
        return;
      }

      let rooms = [];
      let guests = [];
      let bookings = [];

      if (!this.config.skipRooms) rooms = await this.seedRooms();
      if (!this.config.skipGuests) guests = await this.seedGuests();
      if (!this.config.skipBookings && rooms.length && guests.length) {
        bookings = await this.seedBookings(rooms, guests);
      }
      if (!this.config.skipAuditLogs) await this.seedAuditLogs();
      if (!this.config.skipSystemSettings) await this.seedSystemSettings();

      await this.queryRunner.commitTransaction();

      console.log('\n🎉 SEED COMPLETED SUCCESSFULLY!');
      console.log(`   Rooms: ${rooms.length}`);
      console.log(`   Guests: ${guests.length}`);
      console.log(`   Bookings: ${bookings.length}`);
      console.log(`   Audit Logs: ${this.config.auditLogCount}`);
      console.log(`   System Settings: 7`);

    } catch (error) {
      console.error('\n❌ Seeding failed – rolling back...', error);
      if (this.queryRunner) await this.queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await this.destroy();
    }
  }
}

// ========== COMMAND LINE HANDLER ==========
function parseArgs() {
  const args = process.argv.slice(2);
  const config = { ...DEFAULT_CONFIG };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--clear-only':
        config.clearOnly = true;
        break;
      case '--rooms':
        config.skipRooms = false;
        config.roomCount = parseInt(args[++i]) || DEFAULT_CONFIG.roomCount;
        break;
      case '--guests':
        config.skipGuests = false;
        config.guestCount = parseInt(args[++i]) || DEFAULT_CONFIG.guestCount;
        break;
      case '--bookings':
        config.skipBookings = false;
        config.bookingCount = parseInt(args[++i]) || DEFAULT_CONFIG.bookingCount;
        break;
      case '--audit-logs':
        config.skipAuditLogs = false;
        config.auditLogCount = parseInt(args[++i]) || DEFAULT_CONFIG.auditLogCount;
        break;
      case '--skip-rooms':
        config.skipRooms = true;
        break;
      case '--skip-guests':
        config.skipGuests = true;
        break;
      case '--skip-bookings':
        config.skipBookings = true;
        break;
      case '--skip-audit-logs':
        config.skipAuditLogs = true;
        break;
      case '--skip-system-settings':
        config.skipSystemSettings = true;
        break;
      case '--help':
        console.log(`
Usage: node seed.js [options]

Options:
  --clear-only                Only wipe database, do not seed.
  --rooms [count]             Seed rooms (default: 15)
  --guests [count]           Seed guests (default: 40)
  --bookings [count]         Seed bookings (default: 80)
  --audit-logs [count]       Seed audit logs (default: 30)
  --skip-rooms               Skip seeding rooms
  --skip-guests              Skip seeding guests
  --skip-bookings            Skip seeding bookings
  --skip-audit-logs          Skip seeding audit logs
  --skip-system-settings     Skip seeding system settings
  --help                     Show this help

Examples:
  node seed.js --rooms 20 --guests 50
  node seed.js --clear-only
  node seed.js --skip-bookings
`);
        process.exit(0);
    }
  }
  return config;
}

// ========== EXECUTION ==========
if (require.main === module) {
  const config = parseArgs();
  const seeder = new DatabaseSeeder(config);
  seeder.run().catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

module.exports = { DatabaseSeeder, DEFAULT_CONFIG };
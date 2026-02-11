/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
module.exports = class InitSchema1770811456338 {
    name = 'InitSchema1770811456338'

    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "audit_logs" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "action" varchar NOT NULL, "entity" varchar NOT NULL, "entityId" integer NOT NULL, "timestamp" datetime NOT NULL DEFAULT (datetime('now')), "user" varchar)`);
        await queryRunner.query(`CREATE TABLE "bookings" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "checkInDate" date NOT NULL, "checkOutDate" date NOT NULL, "numberOfGuests" integer NOT NULL DEFAULT (1), "totalPrice" float(10,2) NOT NULL, "status" varchar NOT NULL DEFAULT ('confirmed'), "specialRequests" text, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "roomId" integer, "guestId" integer)`);
        await queryRunner.query(`CREATE TABLE "guests" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "fullName" varchar NOT NULL, "email" varchar NOT NULL, "phone" varchar NOT NULL, "address" varchar, "idNumber" varchar, "nationality" varchar DEFAULT ('N/A'), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "UQ_85d472bf0e9dd55ce9a8268c3e0" UNIQUE ("email"))`);
        await queryRunner.query(`CREATE TABLE "rooms" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "roomNumber" varchar NOT NULL, "type" varchar NOT NULL, "capacity" integer NOT NULL, "pricePerNight" float(10,2) NOT NULL, "isAvailable" boolean NOT NULL DEFAULT (1), "amenities" text, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "UQ_e38efca75345af077ed83d53b6f" UNIQUE ("roomNumber"))`);
        await queryRunner.query(`CREATE TABLE "system_settings" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "key" varchar(100) NOT NULL, "value" text NOT NULL, "setting_type" varchar CHECK( "setting_type" IN ('general') ) NOT NULL, "description" text, "is_public" boolean NOT NULL DEFAULT (0), "is_deleted" boolean NOT NULL DEFAULT (0), "created_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "updated_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "idx_system_settings_type_key" ON "system_settings" ("setting_type", "key") `);
        await queryRunner.query(`CREATE TABLE "temporary_bookings" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "checkInDate" date NOT NULL, "checkOutDate" date NOT NULL, "numberOfGuests" integer NOT NULL DEFAULT (1), "totalPrice" float(10,2) NOT NULL, "status" varchar NOT NULL DEFAULT ('confirmed'), "specialRequests" text, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "roomId" integer, "guestId" integer, CONSTRAINT "FK_0172b36e4e054d6ebb819d58efb" FOREIGN KEY ("roomId") REFERENCES "rooms" ("id") ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT "FK_28306518087b40a95df05a43624" FOREIGN KEY ("guestId") REFERENCES "guests" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_bookings"("id", "checkInDate", "checkOutDate", "numberOfGuests", "totalPrice", "status", "specialRequests", "createdAt", "roomId", "guestId") SELECT "id", "checkInDate", "checkOutDate", "numberOfGuests", "totalPrice", "status", "specialRequests", "createdAt", "roomId", "guestId" FROM "bookings"`);
        await queryRunner.query(`DROP TABLE "bookings"`);
        await queryRunner.query(`ALTER TABLE "temporary_bookings" RENAME TO "bookings"`);
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "bookings" RENAME TO "temporary_bookings"`);
        await queryRunner.query(`CREATE TABLE "bookings" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "checkInDate" date NOT NULL, "checkOutDate" date NOT NULL, "numberOfGuests" integer NOT NULL DEFAULT (1), "totalPrice" float(10,2) NOT NULL, "status" varchar NOT NULL DEFAULT ('confirmed'), "specialRequests" text, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "roomId" integer, "guestId" integer)`);
        await queryRunner.query(`INSERT INTO "bookings"("id", "checkInDate", "checkOutDate", "numberOfGuests", "totalPrice", "status", "specialRequests", "createdAt", "roomId", "guestId") SELECT "id", "checkInDate", "checkOutDate", "numberOfGuests", "totalPrice", "status", "specialRequests", "createdAt", "roomId", "guestId" FROM "temporary_bookings"`);
        await queryRunner.query(`DROP TABLE "temporary_bookings"`);
        await queryRunner.query(`DROP INDEX "idx_system_settings_type_key"`);
        await queryRunner.query(`DROP TABLE "system_settings"`);
        await queryRunner.query(`DROP TABLE "rooms"`);
        await queryRunner.query(`DROP TABLE "guests"`);
        await queryRunner.query(`DROP TABLE "bookings"`);
        await queryRunner.query(`DROP TABLE "audit_logs"`);
    }
}

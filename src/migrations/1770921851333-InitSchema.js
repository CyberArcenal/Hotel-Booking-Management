/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
module.exports = class InitSchema1770921851333 {
    name = 'InitSchema1770921851333'

    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "audit_logs" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "action" varchar NOT NULL, "entity" varchar NOT NULL, "entityId" integer, "timestamp" datetime NOT NULL DEFAULT (datetime('now')), "user" varchar)`);
        await queryRunner.query(`CREATE TABLE "bookings" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "checkInDate" date NOT NULL, "checkOutDate" date NOT NULL, "numberOfGuests" integer NOT NULL DEFAULT (1), "totalPrice" float(10,2) NOT NULL, "status" varchar CHECK( "status" IN ('pending','confirmed','checked_in','checked_out','cancelled') ) NOT NULL DEFAULT ('pending'), "paymentStatus" varchar CHECK( "paymentStatus" IN ('pending','paid','failed') ) NOT NULL DEFAULT ('pending'), "specialRequests" text, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "roomId" integer, "guestId" integer)`);
        await queryRunner.query(`CREATE TABLE "guests" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "fullName" varchar NOT NULL, "email" varchar NOT NULL, "phone" varchar NOT NULL, "address" varchar, "idNumber" varchar, "nationality" varchar DEFAULT ('N/A'), "createdAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "UQ_85d472bf0e9dd55ce9a8268c3e0" UNIQUE ("email"))`);
        await queryRunner.query(`CREATE TABLE "rooms" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "roomNumber" varchar NOT NULL, "type" varchar CHECK( "type" IN ('standard','single','double','twin','suite','deluxe','family','studio','executive') ) NOT NULL DEFAULT ('standard'), "capacity" integer NOT NULL, "pricePerNight" float(10,2) NOT NULL, "status" varchar CHECK( "status" IN ('available','occupied','maintenance') ) NOT NULL DEFAULT ('available'), "isAvailable" boolean NOT NULL DEFAULT (1), "amenities" text, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "UQ_e38efca75345af077ed83d53b6f" UNIQUE ("roomNumber"))`);
        await queryRunner.query(`CREATE TABLE "system_settings" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "key" varchar(100) NOT NULL, "value" text NOT NULL, "setting_type" varchar CHECK( "setting_type" IN ('general','booking','room','notification','system') ) NOT NULL, "description" text, "is_public" boolean NOT NULL DEFAULT (0), "is_deleted" boolean NOT NULL DEFAULT (0), "created_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP), "updated_at" datetime NOT NULL DEFAULT (CURRENT_TIMESTAMP))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "idx_system_settings_type_key" ON "system_settings" ("setting_type", "key") `);
        await queryRunner.query(`CREATE TABLE "notification_logs" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "recipient_email" varchar NOT NULL, "subject" varchar, "payload" text, "status" varchar(20) NOT NULL DEFAULT ('queued'), "error_message" text, "retry_count" integer NOT NULL DEFAULT (0), "resend_count" integer NOT NULL DEFAULT (0), "sent_at" datetime, "last_error_at" datetime, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "bookingId" integer)`);
        await queryRunner.query(`CREATE INDEX "IDX_notification_status" ON "notification_logs" ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_notification_recipient" ON "notification_logs" ("recipient_email") `);
        await queryRunner.query(`CREATE INDEX "IDX_notification_status_created" ON "notification_logs" ("status", "created_at") `);
        await queryRunner.query(`CREATE TABLE "temporary_bookings" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "checkInDate" date NOT NULL, "checkOutDate" date NOT NULL, "numberOfGuests" integer NOT NULL DEFAULT (1), "totalPrice" float(10,2) NOT NULL, "status" varchar CHECK( "status" IN ('pending','confirmed','checked_in','checked_out','cancelled') ) NOT NULL DEFAULT ('pending'), "paymentStatus" varchar CHECK( "paymentStatus" IN ('pending','paid','failed') ) NOT NULL DEFAULT ('pending'), "specialRequests" text, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "roomId" integer, "guestId" integer, CONSTRAINT "FK_0172b36e4e054d6ebb819d58efb" FOREIGN KEY ("roomId") REFERENCES "rooms" ("id") ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT "FK_28306518087b40a95df05a43624" FOREIGN KEY ("guestId") REFERENCES "guests" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_bookings"("id", "checkInDate", "checkOutDate", "numberOfGuests", "totalPrice", "status", "paymentStatus", "specialRequests", "createdAt", "roomId", "guestId") SELECT "id", "checkInDate", "checkOutDate", "numberOfGuests", "totalPrice", "status", "paymentStatus", "specialRequests", "createdAt", "roomId", "guestId" FROM "bookings"`);
        await queryRunner.query(`DROP TABLE "bookings"`);
        await queryRunner.query(`ALTER TABLE "temporary_bookings" RENAME TO "bookings"`);
        await queryRunner.query(`DROP INDEX "IDX_notification_status"`);
        await queryRunner.query(`DROP INDEX "IDX_notification_recipient"`);
        await queryRunner.query(`DROP INDEX "IDX_notification_status_created"`);
        await queryRunner.query(`CREATE TABLE "temporary_notification_logs" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "recipient_email" varchar NOT NULL, "subject" varchar, "payload" text, "status" varchar(20) NOT NULL DEFAULT ('queued'), "error_message" text, "retry_count" integer NOT NULL DEFAULT (0), "resend_count" integer NOT NULL DEFAULT (0), "sent_at" datetime, "last_error_at" datetime, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "bookingId" integer, CONSTRAINT "FK_fab4ba73f118758b035c5a4ace2" FOREIGN KEY ("bookingId") REFERENCES "bookings" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_notification_logs"("id", "recipient_email", "subject", "payload", "status", "error_message", "retry_count", "resend_count", "sent_at", "last_error_at", "created_at", "updated_at", "bookingId") SELECT "id", "recipient_email", "subject", "payload", "status", "error_message", "retry_count", "resend_count", "sent_at", "last_error_at", "created_at", "updated_at", "bookingId" FROM "notification_logs"`);
        await queryRunner.query(`DROP TABLE "notification_logs"`);
        await queryRunner.query(`ALTER TABLE "temporary_notification_logs" RENAME TO "notification_logs"`);
        await queryRunner.query(`CREATE INDEX "IDX_notification_status" ON "notification_logs" ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_notification_recipient" ON "notification_logs" ("recipient_email") `);
        await queryRunner.query(`CREATE INDEX "IDX_notification_status_created" ON "notification_logs" ("status", "created_at") `);
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX "IDX_notification_status_created"`);
        await queryRunner.query(`DROP INDEX "IDX_notification_recipient"`);
        await queryRunner.query(`DROP INDEX "IDX_notification_status"`);
        await queryRunner.query(`ALTER TABLE "notification_logs" RENAME TO "temporary_notification_logs"`);
        await queryRunner.query(`CREATE TABLE "notification_logs" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "recipient_email" varchar NOT NULL, "subject" varchar, "payload" text, "status" varchar(20) NOT NULL DEFAULT ('queued'), "error_message" text, "retry_count" integer NOT NULL DEFAULT (0), "resend_count" integer NOT NULL DEFAULT (0), "sent_at" datetime, "last_error_at" datetime, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "bookingId" integer)`);
        await queryRunner.query(`INSERT INTO "notification_logs"("id", "recipient_email", "subject", "payload", "status", "error_message", "retry_count", "resend_count", "sent_at", "last_error_at", "created_at", "updated_at", "bookingId") SELECT "id", "recipient_email", "subject", "payload", "status", "error_message", "retry_count", "resend_count", "sent_at", "last_error_at", "created_at", "updated_at", "bookingId" FROM "temporary_notification_logs"`);
        await queryRunner.query(`DROP TABLE "temporary_notification_logs"`);
        await queryRunner.query(`CREATE INDEX "IDX_notification_status_created" ON "notification_logs" ("status", "created_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_notification_recipient" ON "notification_logs" ("recipient_email") `);
        await queryRunner.query(`CREATE INDEX "IDX_notification_status" ON "notification_logs" ("status") `);
        await queryRunner.query(`ALTER TABLE "bookings" RENAME TO "temporary_bookings"`);
        await queryRunner.query(`CREATE TABLE "bookings" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "checkInDate" date NOT NULL, "checkOutDate" date NOT NULL, "numberOfGuests" integer NOT NULL DEFAULT (1), "totalPrice" float(10,2) NOT NULL, "status" varchar CHECK( "status" IN ('pending','confirmed','checked_in','checked_out','cancelled') ) NOT NULL DEFAULT ('pending'), "paymentStatus" varchar CHECK( "paymentStatus" IN ('pending','paid','failed') ) NOT NULL DEFAULT ('pending'), "specialRequests" text, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "roomId" integer, "guestId" integer)`);
        await queryRunner.query(`INSERT INTO "bookings"("id", "checkInDate", "checkOutDate", "numberOfGuests", "totalPrice", "status", "paymentStatus", "specialRequests", "createdAt", "roomId", "guestId") SELECT "id", "checkInDate", "checkOutDate", "numberOfGuests", "totalPrice", "status", "paymentStatus", "specialRequests", "createdAt", "roomId", "guestId" FROM "temporary_bookings"`);
        await queryRunner.query(`DROP TABLE "temporary_bookings"`);
        await queryRunner.query(`DROP INDEX "IDX_notification_status_created"`);
        await queryRunner.query(`DROP INDEX "IDX_notification_recipient"`);
        await queryRunner.query(`DROP INDEX "IDX_notification_status"`);
        await queryRunner.query(`DROP TABLE "notification_logs"`);
        await queryRunner.query(`DROP INDEX "idx_system_settings_type_key"`);
        await queryRunner.query(`DROP TABLE "system_settings"`);
        await queryRunner.query(`DROP TABLE "rooms"`);
        await queryRunner.query(`DROP TABLE "guests"`);
        await queryRunner.query(`DROP TABLE "bookings"`);
        await queryRunner.query(`DROP TABLE "audit_logs"`);
    }
}

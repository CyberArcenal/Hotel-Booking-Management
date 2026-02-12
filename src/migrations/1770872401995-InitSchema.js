/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
module.exports = class InitSchema1770872401995 {
    name = 'InitSchema1770872401995'

    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "temporary_bookings" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "checkInDate" date NOT NULL, "checkOutDate" date NOT NULL, "numberOfGuests" integer NOT NULL DEFAULT (1), "totalPrice" float(10,2) NOT NULL, "status" varchar NOT NULL DEFAULT ('confirmed'), "specialRequests" text, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "roomId" integer, "guestId" integer, "paymentStatus" varchar CHECK( "paymentStatus" IN ('pending','paid','failed') ) NOT NULL, CONSTRAINT "FK_28306518087b40a95df05a43624" FOREIGN KEY ("guestId") REFERENCES "guests" ("id") ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT "FK_0172b36e4e054d6ebb819d58efb" FOREIGN KEY ("roomId") REFERENCES "rooms" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_bookings"("id", "checkInDate", "checkOutDate", "numberOfGuests", "totalPrice", "status", "specialRequests", "createdAt", "roomId", "guestId") SELECT "id", "checkInDate", "checkOutDate", "numberOfGuests", "totalPrice", "status", "specialRequests", "createdAt", "roomId", "guestId" FROM "bookings"`);
        await queryRunner.query(`DROP TABLE "bookings"`);
        await queryRunner.query(`ALTER TABLE "temporary_bookings" RENAME TO "bookings"`);
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "bookings" RENAME TO "temporary_bookings"`);
        await queryRunner.query(`CREATE TABLE "bookings" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "checkInDate" date NOT NULL, "checkOutDate" date NOT NULL, "numberOfGuests" integer NOT NULL DEFAULT (1), "totalPrice" float(10,2) NOT NULL, "status" varchar NOT NULL DEFAULT ('confirmed'), "specialRequests" text, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "roomId" integer, "guestId" integer, CONSTRAINT "FK_28306518087b40a95df05a43624" FOREIGN KEY ("guestId") REFERENCES "guests" ("id") ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT "FK_0172b36e4e054d6ebb819d58efb" FOREIGN KEY ("roomId") REFERENCES "rooms" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "bookings"("id", "checkInDate", "checkOutDate", "numberOfGuests", "totalPrice", "status", "specialRequests", "createdAt", "roomId", "guestId") SELECT "id", "checkInDate", "checkOutDate", "numberOfGuests", "totalPrice", "status", "specialRequests", "createdAt", "roomId", "guestId" FROM "temporary_bookings"`);
        await queryRunner.query(`DROP TABLE "temporary_bookings"`);
    }
}

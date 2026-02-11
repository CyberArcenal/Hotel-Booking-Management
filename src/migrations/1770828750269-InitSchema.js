/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
module.exports = class InitSchema1770828750269 {
    name = 'InitSchema1770828750269'

    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "notification_logs" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "recipient_email" varchar NOT NULL, "subject" varchar, "payload" text, "status" varchar(20) NOT NULL DEFAULT ('queued'), "error_message" text, "retry_count" integer NOT NULL DEFAULT (0), "resend_count" integer NOT NULL DEFAULT (0), "sent_at" datetime, "last_error_at" datetime, "created_at" datetime NOT NULL DEFAULT (datetime('now')), "updated_at" datetime NOT NULL DEFAULT (datetime('now')), "bookingId" integer)`);
        await queryRunner.query(`CREATE INDEX "IDX_notification_status" ON "notification_logs" ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_notification_recipient" ON "notification_logs" ("recipient_email") `);
        await queryRunner.query(`CREATE INDEX "IDX_notification_status_created" ON "notification_logs" ("status", "created_at") `);
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
        await queryRunner.query(`DROP INDEX "IDX_notification_status_created"`);
        await queryRunner.query(`DROP INDEX "IDX_notification_recipient"`);
        await queryRunner.query(`DROP INDEX "IDX_notification_status"`);
        await queryRunner.query(`DROP TABLE "notification_logs"`);
    }
}

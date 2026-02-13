// subscribers/BookingSubscriber.js
//@ts-check
const { Booking } = require("../entities/Booking");
const BookingPaymentStatusHandler = require("../handlers/BookingPaymentStatusHandler");
const BookingStatusHandler = require("../handlers/BookingStatusHandler");
const { logger } = require("../utils/logger");

class BookingSubscriber {
  listenTo() {
    return Booking;
  }

  /**
   * @param {any} entity
   */
  beforeInsert(entity) {
    logger.info("[BookingSubscriber] Before insert:", entity);
    // defaults or validation
  }

  /**
   * @param {null | undefined} entity
   */
  async afterInsert(entity) {
    logger.info("[BookingSubscriber] After insert:", entity);
    await BookingStatusHandler.handleStatusChange(
      // @ts-ignore
      entity,
      "none",
      // @ts-ignore
      entity.status,
    );
    // audit log, notifications
  }

  /**
   * @param {null | undefined} entity
   */
  beforeUpdate(entity) {
    logger.info("[BookingSubscriber] Before update:", entity);
    // optional pre-checks
  }

  /**
   * @param {{ databaseEntity: any; entity: any; }} event
   */
  async afterUpdate(event) {
    const { databaseEntity, entity } = event;
    logger.info("[BookingSubscriber] After update:", entity);

    // Compare booking status
    if (databaseEntity.status !== entity.status) {
      logger.info(
        `[BookingSubscriber] Status changed: ${databaseEntity.status} → ${entity.status}`,
      );
      await BookingStatusHandler.handleStatusChange(
        entity,
        databaseEntity.status,
        entity.status,
      );
    } else {
      logger.info("[BookingSubscriber] Status unchanged, skipping handler.");
    }

    // Compare payment status
    if (databaseEntity.paymentStatus !== entity.paymentStatus) {
      logger.info(
        `[BookingSubscriber] Payment status changed: ${databaseEntity.paymentStatus} → ${entity.paymentStatus}`,
      );
      await BookingPaymentStatusHandler.handlePaymentChange(
        entity,
        databaseEntity.paymentStatus,
        entity.paymentStatus,
      );
    } else {
      logger.info(
        "[BookingSubscriber] Payment status unchanged, skipping handler.",
      );
    }
  }

  /**
   * @param {null | undefined} entity
   */
  beforeRemove(entity) {
    logger.info("[BookingSubscriber] Before remove:", entity);
  }

  /**
   * @param {any} entityId
   */
  afterRemove(entityId) {
    logger.info("[BookingSubscriber] After remove:", entityId);
  }
}

module.exports = BookingSubscriber;

/**
 * BookingSubscriber
 *
 * Responsibilities:
 * - Detect changes in Booking entity fields (status, paymentStatus, etc.)
 * - Call the appropriate Handler (BookingStatusHandler, BookingPaymentStatusHandler)
 * - Never perform business logic directly
 * - Never call TransitionService or Handler manually from Service classes
 * - Effects (room updates, notifications) are executed only inside TransitionService
 *
 * Flow:
 *   Booking.save() → Subscriber.afterUpdate()
 *       → Handler.handleStatusChange()
 *           → TransitionService.onConfirm/onCancelled/onPaid/onFailed()
 *               → Effects (Room update via AppDataSource, Notifications, Audit)
 *
 * Rules:
 * - Service layer = pure state change + audit log
 * - Subscriber = single entry point for triggering handlers
 * - Handler = dispatcher only
 * - TransitionService = orchestration of side effects
 * - Avoid double calls: never invoke handlers/transition services manually
 */

// handlers/BookingPaymentStatusHandler.js
//@ts-check
const BookingPaymentStatusService = require("../transitionServices/BookingPaymentStatusService");
const { logger } = require("../utils/logger");

class BookingPaymentStatusHandler {
  /**
   * Central dispatcher for booking payment status changes
   * @param {import("../entities/Booking").Booking} booking
   * @param {string} oldPaymentStatus
   * @param {string} newPaymentStatus
   */
  static async handlePaymentChange(booking, oldPaymentStatus, newPaymentStatus) {
    // @ts-ignore
    logger.info(`[BookingPaymentStatusHandler] Booking ${booking.id} payment status change: ${oldPaymentStatus} → ${newPaymentStatus}`);

    switch (newPaymentStatus) {
      case "pending":
        return this.onPending(booking, oldPaymentStatus);
      case "paid":
        return this.onPaid(booking, oldPaymentStatus);
      case "failed":
        return this.onFailed(booking, oldPaymentStatus);
      default:
        logger.info(`[BookingPaymentStatusHandler] No handler for payment status: ${newPaymentStatus}`);
        return null;
    }
  }

  // @ts-ignore
  static async onPending(booking, oldPaymentStatus) {
    logger.info(`[BookingPaymentStatusHandler] onPending for booking ${booking.id}`);
    return BookingPaymentStatusService.onPending(booking, oldPaymentStatus);
  }

  // @ts-ignore
  static async onPaid(booking, oldPaymentStatus) {
    logger.info(`[BookingPaymentStatusHandler] onPaid for booking ${booking.id}`);
    return BookingPaymentStatusService.onPaid(booking, oldPaymentStatus);
  }

  // @ts-ignore
  static async onFailed(booking, oldPaymentStatus) {
    logger.info(`[BookingPaymentStatusHandler] onFailed for booking ${booking.id}`);
    return BookingPaymentStatusService.onFailed(booking, oldPaymentStatus);
  }
}

module.exports = BookingPaymentStatusHandler;

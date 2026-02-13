// handlers/BookingStatusHandler.js
//@ts-check
const BookingStatusService = require("../transitionServices/BookingStatusService");
const { logger } = require("../utils/logger");

class BookingStatusHandler {
  /**
   * Central dispatcher for booking status changes
   * @param {import("../entities/Booking").Booking} booking
   * @param {string} oldStatus
   * @param {string} newStatus
   */
  static async handleStatusChange(booking, oldStatus, newStatus) {
    
    // @ts-ignore
    logger.info(`[BookingStatusHandler] Booking ${booking.id} status change: ${oldStatus} → ${newStatus}`);

    switch (newStatus) {
      case "pending":
        return this.onPending(booking, oldStatus);
      case "confirmed":
        return this.onConfirmed(booking, oldStatus);
      case "checked_in":
        return this.onCheckedIn(booking, oldStatus);
      case "checked_out":
        return this.onCheckedOut(booking, oldStatus);
      case "cancelled":
        return this.onCancelled(booking, oldStatus);
      default:
        logger.info(`[BookingStatusHandler] No handler for status: ${newStatus}`);
        return null;
    }
  }

  
  // @ts-ignore
  static async onPending(booking, oldStatus) {
    logger.info(`[BookingStatusHandler] onPending for booking ${booking.id}`);
    return BookingStatusService.onPending(booking, oldStatus);
  }

  
  // @ts-ignore
  static async onConfirmed(booking, oldStatus) {
    logger.info(`[BookingStatusHandler] onConfirmed for booking ${booking.id}`);
    
    return BookingStatusService.onConfirmed(booking, oldStatus);
  }

  
  // @ts-ignore
  static async onCheckedIn(booking, oldStatus) {
    logger.info(`[BookingStatusHandler] onCheckedIn for booking ${booking.id}`);
    return BookingStatusService.onCheckedIn(booking, oldStatus);
  }

  
  // @ts-ignore
  static async onCheckedOut(booking, oldStatus) {
    logger.info(`[BookingStatusHandler] onCheckedOut for booking ${booking.id}`);
    return BookingStatusService.onCheckedOut(booking, oldStatus);
  }

  
  // @ts-ignore
  static async onCancelled(booking, oldStatus) {
    logger.info(`[BookingStatusHandler] onCancelled for booking ${booking.id}`);
    return BookingStatusService.onCancelled(booking, oldStatus);
  }
}

module.exports = BookingStatusHandler;

// transitionServices/BookingPaymentStatusService.js
// @ts-check
const { AppDataSource } = require("../main/db/datasource");
const { Room } = require("../entities/Room");
const { logger } = require("../utils/logger");

const NotificationService = require("../services/Notification");
const { Booking } = require("../entities/Booking");
const {
  markRoomAvailableOnBookPaymentCancelled,
  markRoomOccupiedOnBookPaymentPaid,
} = require("../utils/system");

class BookingPaymentStatusService {
  /**
   * @param {{ id: any; paymentStatus: any; updatedBy: any; room: { id: any; }; }} booking
   * @param {any} oldPaymentStatus
   */
  // @ts-ignore
  static async onPending(booking, oldPaymentStatus) {
    // @ts-ignore
    const { updateDb } = require("../utils/dbUtils/dbActions");
    logger.debug(
      `[BookingPaymentStatusService] Booking ${booking.id} set to PAYMENT PENDING`,
    );

    return booking;
  }

  /**
   * @param {{ id: any; updatedBy: any; paymentStatus: any; status: string; room: { id: any; }; }} booking
   * @param {any} oldPaymentStatus
   */
  static async onPaid(booking, oldPaymentStatus) {
    const { updateDb } = require("../utils/dbUtils/dbActions");
    const bookingRepo = AppDataSource.getRepository(Booking);
    logger.debug(
      `[BookingPaymentStatusService] Booking ${booking.id} marked as PAID`,
    );

    // 🔹 Effects: auto-confirm booking
    if (booking.status === "pending") {
      const oldStatus = booking.status;
      booking.status = "confirmed";
    }

    // 🔹 Effects: occupy room
    if (booking.room) {
      if (await markRoomOccupiedOnBookPaymentPaid()) {
        const roomRepo = AppDataSource.getRepository(Room);
        const room = await roomRepo.findOne({ where: { id: booking.room.id } });
        if (room) {
          if (room.status !== "occupied") {
            const oldRoomStatus = room.status;
            room.status = "occupied";
            await updateDb(roomRepo, room);
          };
        };
      };
    };
    const ouput = updateDb(bookingRepo, booking);
    // @ts-ignore
    try {
      // @ts-ignore
      NotificationService.sendPaymentReceived(booking);
    } catch (err) {};

    return ouput;
  }

  /**
   * @param {{ id: any; updatedBy: any; paymentStatus: any; status: string; room: { id: any; }; }} booking
   * @param {any} oldPaymentStatus
   */
  static async onFailed(booking, oldPaymentStatus) {
    const { updateDb } = require("../utils/dbUtils/dbActions");
    logger.debug(
      `[BookingPaymentStatusService] Booking ${booking.id} payment FAILED`,
    );

    // 🔹 Effects: auto-cancel booking
    if (booking.status !== "cancelled") {
      const oldStatus = booking.status;
      booking.status = "cancelled";
    }

    // 🔹 Effects: release room
    if (booking.room) {
      if (await markRoomAvailableOnBookPaymentCancelled()) {
        const roomRepo = AppDataSource.getRepository(Room);
        const room = await roomRepo.findOne({ where: { id: booking.room.id } });
        if (room) {
          if (room.status !== "available") {
            const oldRoomStatus = room.status;
            room.status = "available";
            await updateDb(roomRepo, room);
          };
        };
      };
    };

    // @ts-ignore
    try {
      // @ts-ignore
      NotificationService.sendPaymentFailed(booking);
    } catch (err) {};

    return booking;
  }
}

module.exports = BookingPaymentStatusService;

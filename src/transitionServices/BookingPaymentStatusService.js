// transitionServices/BookingPaymentStatusService.js
// @ts-check
const { AppDataSource } = require("../main/db/datasource");
const { Room } = require("../entities/Room");
const { logger } = require("../utils/logger");

const NotificationService = require("../services/Notification");
const { Booking } = require("../entities/Booking");

class BookingPaymentStatusService {
  /**
   * @param {{ id: any; updatedBy: any; paymentStatus: any; }} booking
   * @param {any} oldPaymentStatus
   */
  static async onPending(booking, oldPaymentStatus) {
    const auditLogger = require("../utils/AuditLogger");
    logger.debug(
      `[BookingPaymentStatusService] Booking ${booking.id} set to PAYMENT PENDING`,
    );
    await auditLogger.logCreate(
      "Booking",
      booking.id,
      { oldStatus: oldPaymentStatus, newStatus: booking.paymentStatus },
      booking.updatedBy || "system",
    );
    return booking;
  }

  /**
   * @param {{ id: any; updatedBy: any; paymentStatus: any; status: string; room: { id: any; }; }} booking
   * @param {any} oldPaymentStatus
   */
  static async onPaid(booking, oldPaymentStatus) {
    const { updateDb } = require("../utils/dbUtils/dbActions");
    const auditLogger = require("../utils/AuditLogger");
    const bookingRepo = AppDataSource.getRepository(Booking);
    logger.debug(
      `[BookingPaymentStatusService] Booking ${booking.id} marked as PAID`,
    );
    await auditLogger.logCreate(
      "Booking",
      booking.id,
      { oldStatus: oldPaymentStatus, newStatus: booking.paymentStatus },
      booking.updatedBy || "system",
    );

    // 🔹 Effects: auto-confirm booking
    if (booking.status === "pending") {
      const oldStatus = booking.status;
      booking.status = "confirmed";
      await auditLogger.logCreate(
        "Booking",
        booking.id,
        { oldStatus, newStatus: booking.status },
        booking.updatedBy || "system",
      );
    }

    // 🔹 Effects: occupy room
    if (booking.room) {
      const roomRepo = AppDataSource.getRepository(Room);
      const room = await roomRepo.findOne({ where: { id: booking.room.id } });
      if (room) {
        const oldRoomStatus = room.status;
        room.status = "occupied";
        await updateDb(roomRepo, room);
        await auditLogger.logUpdate(
          "Room",
          room.id,
          { status: oldRoomStatus },
          { status: room.status },
          booking.updatedBy || "system",
        );
      }
    }
    const ouput = updateDb(bookingRepo, booking);
    // @ts-ignore
    NotificationService.sendPaymentReceived(booking);
    return ouput;
  }

  /**
   * @param {{ id: any; updatedBy: any; paymentStatus: any; status: string; room: { id: any; }; }} booking
   * @param {any} oldPaymentStatus
   */
  static async onFailed(booking, oldPaymentStatus) {
    const { updateDb } = require("../utils/dbUtils/dbActions");
    const auditLogger = require("../utils/AuditLogger");
    logger.debug(
      `[BookingPaymentStatusService] Booking ${booking.id} payment FAILED`,
    );
    await auditLogger.logCreate(
      "Booking",
      booking.id,
      { oldStatus: oldPaymentStatus, newStatus: booking.paymentStatus },
      booking.updatedBy || "system",
    );

    // 🔹 Effects: auto-cancel booking
    if (booking.status !== "cancelled") {
      const oldStatus = booking.status;
      booking.status = "cancelled";
      await auditLogger.logCreate(
        "Booking",
        booking.id,
        { oldStatus, newStatus: booking.status },
        booking.updatedBy || "system",
      );
    }

    // 🔹 Effects: release room
    if (booking.room) {
      const roomRepo = AppDataSource.getRepository(Room);
      const room = await roomRepo.findOne({ where: { id: booking.room.id } });
      if (room) {
        const oldRoomStatus = room.status;
        room.status = "available";
        await updateDb(roomRepo, room);
        await auditLogger.logUpdate(
          "Room",
          room.id,
          { status: oldRoomStatus },
          { status: room.status },
          booking.updatedBy || "system",
        );
      }
    }

    // @ts-ignore
    NotificationService.sendPaymentFailed(booking);
    return booking;
  }
}

module.exports = BookingPaymentStatusService;

// transitionServices/BookingStatusService.js
// @ts-check
const { AppDataSource } = require("../main/db/datasource");
const { Room } = require("../entities/Room");

const { logger } = require("../utils/logger");

const NotificationService = require("../services/Notification");

class BookingStatusService {
  // @ts-ignore
  static async onPending(booking, oldStatus) {
    const { updateDb } = require("../utils/dbUtils/dbActions");
    logger.debug(`[BookingStatusService] Booking ${booking.id} set to PENDING`);

    // 🔹 Effects: occupy room
    if (booking.room) {
      const roomRepo = AppDataSource.getRepository(Room);
      const room = await roomRepo.findOne({ where: { id: booking.room.id } });
      if (room) {
        if (room.status !== "occupied") {
          const oldRoomStatus = room.status;
          room.status = "occupied";
          await updateDb(roomRepo, room);
        }
      }
    }

    return booking;
  }

  // @ts-ignore
  static async onConfirmed(booking, oldStatus) {
    const { updateDb } = require("../utils/dbUtils/dbActions");
    logger.debug(`[BookingStatusService] Booking ${booking.id} CONFIRMED`);

    // 🔹 Effects: occupy room + notify
    if (booking.room) {
      const roomRepo = AppDataSource.getRepository(Room);
      const room = await roomRepo.findOne({ where: { id: booking.room.id } });
      if (room) {
        const oldRoomStatus = room.status;
        room.status = "occupied";
        await updateDb(roomRepo, room);
      }
    }
    try {
      NotificationService.sendBookingConfirmed(booking);
    } catch (err) {}

    return booking;
  }

  // @ts-ignore
  static async onCheckedIn(booking, oldStatus) {
    logger.debug(`[BookingStatusService] Booking ${booking.id} CHECKED IN`);

    return booking;
  }

  // @ts-ignore
  static async onCheckedOut(booking, oldStatus) {
    const { updateDb } = require("../utils/dbUtils/dbActions");

    logger.debug(`[BookingStatusService] Booking ${booking.id} CHECKED OUT`);

    // 🔹 Effects: release room + notify
    if (booking.room) {
      const roomRepo = AppDataSource.getRepository(Room);
      const room = await roomRepo.findOne({ where: { id: booking.room.id } });
      if (room) {
        const oldRoomStatus = room.status;
        room.status = "available";
        await updateDb(roomRepo, room);
      }
    }
    try {
      NotificationService.sendBookingCheckedOut(booking);
    } catch (err) {}

    return booking;
  }

  // @ts-ignore
  static async onCancelled(booking, oldStatus) {
    const { updateDb } = require("../utils/dbUtils/dbActions");
    logger.debug(`[BookingStatusService] Booking ${booking.id} CANCELLED`);

    // 🔹 Effects: release room + notify
    if (booking.room) {
      const roomRepo = AppDataSource.getRepository(Room);
      const room = await roomRepo.findOne({ where: { id: booking.room.id } });
      if (room) {
        const oldRoomStatus = room.status;
        room.status = "available";
        await updateDb(roomRepo, room);
      }
    }
    try {
      NotificationService.sendBookingCancelled(booking);
    } catch (err) {}

    return booking;
  }
}

module.exports = BookingStatusService;

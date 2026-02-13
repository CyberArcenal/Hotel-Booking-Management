// services/NotificationService.js
// @ts-check

const { logger } = require("../utils/logger");
const EmailSender = require("../channels/email.sender");
const SmsSender = require("../channels/sms.sender");
const { AppDataSource } = require("../main/db/datasource");
const { Booking } = require("../entities/Booking");
const NotificationLog = require("../entities/NotificationLog");
const {
  enableEmailAlerts,
  enableSmsAlerts,
  adminAlerts,
  companyName,
  getSmtpConfig,
} = require("../utils/system");

class NotificationService {
  /**
   * Send booking confirmation notification
   * @param {import('../entities/Booking').Booking | number} booking - Booking object or ID
   */
  static async sendBookingConfirmed(booking) {
    await this._sendNotification(booking, "confirmed");
  }

  /**
   * Send booking cancellation notification
   * @param {import('../entities/Booking').Booking | number} booking
   */
  static async sendBookingCancelled(booking) {
    await this._sendNotification(booking, "cancelled");
  }

  /**
   * Send booking checked out notification
   * @param {import('../entities/Booking').Booking | number} booking
   */
  static async sendBookingCheckedOut(booking) {
    await this._sendNotification(booking, "checked_out");
  }

  /**
   * Send payment received notification
   * @param {import('../entities/Booking').Booking | number} booking
   */
  static async sendPaymentReceived(booking) {
    await this._sendNotification(booking, "payment_received");
  }

  /**
   * Send payment failed notification
   * @param {import('../entities/Booking').Booking | number} booking
   */
  static async sendPaymentFailed(booking) {
    await this._sendNotification(booking, "payment_failed");
  }

  // -----------------------------------------------------------------
  // Core dispatcher with hydration
  // -----------------------------------------------------------------

  /**
   * Ensure booking object is loaded with guest and room relations
   * @param {import('../entities/Booking').Booking | number} booking
   * @returns {Promise<import('../entities/Booking').Booking>}
   */
  static async _hydrateBooking(booking) {
    if (typeof booking === "number" || typeof booking === "string") {
      // If ID is passed, fetch the full entity
      const repo = AppDataSource.getRepository(Booking);
      const hydrated = await repo.findOne({
        where: { id: Number(booking) },
        relations: ["guest", "room"],
      });
      if (!hydrated) {
        throw new Error(`Booking with ID ${booking} not found`);
      }
      // @ts-ignore
      return hydrated;
    }

    // Already an object – check if relations are loaded
    // @ts-ignore
    if (booking.guest && booking.room) {
      return booking; // Assume fully hydrated
    }

    // Try to load missing relations
    const repo = AppDataSource.getRepository(Booking);
    const hydrated = await repo.findOne({
      // @ts-ignore
      where: { id: booking.id },
      relations: ["guest", "room"],
    });
    if (!hydrated) {
      // @ts-ignore
      throw new Error(`Booking with ID ${booking.id} not found`);
    }
    // @ts-ignore
    return hydrated;
  }

  /**
   * Central notification sender
   * @param {import('../entities/Booking').Booking | number} booking
   * @param {string} eventType
   */
  static async _sendNotification(booking, eventType) {
    try {
      const hydratedBooking = await this._hydrateBooking(booking);
      logger.info(
        // @ts-ignore
        `[Notification] Booking ${hydratedBooking.id} – Event: ${eventType}`,
      );

      // @ts-ignore
      const guest = hydratedBooking.guest;
      if (!guest) {
        logger.warn(
          // @ts-ignore
          `[Notification] Booking ${hydratedBooking.id} has no guest, skipping all notifications`,
        );
        return;
      }

      const promises = [];

      // Email to guest
      if (guest.email) {
        promises.push(
          this._sendGuestEmail(hydratedBooking, eventType, guest.email).catch(
            (err) => {
              logger.error(
                `[Notification] Email failed for ${guest.email}`,
                err,
              );
            },
          ),
        );
      }

      // SMS to guest
      if (guest.phone) {
        promises.push(
          this._sendGuestSms(hydratedBooking, eventType, guest.phone).catch(
            (err) => {
              logger.error(`[Notification] SMS failed for ${guest.phone}`, err);
            },
          ),
        );
      }

      // Admin alert
      promises.push(
        this._sendAdminAlert(hydratedBooking, eventType).catch((err) => {
          logger.error(`[Notification] Admin alert failed`, err);
        }),
      );

      await Promise.allSettled(promises);
    } catch (error) {
      logger.error(
        `[Notification] Failed to process notification for booking`,
        // @ts-ignore
        error,
      );
    }
  }

  // -----------------------------------------------------------------
  // Channel senders
  // -----------------------------------------------------------------

  /**
   * Send email to guest
   */
  // @ts-ignore
  static async _sendGuestEmail(booking, eventType, to) {
    const enabled = await enableEmailAlerts();
    if (!enabled) {
      logger.debug(
        `[Notification] Email alerts disabled, skipping guest email for ${to}`,
      );
      return;
    }

    const { subject, html, text } = this._buildEmailContent(booking, eventType);
    const company = await companyName();
    const smtp = await getSmtpConfig();
    const from = smtp.from?.email ? `${company} <${smtp.from.email}>` : company;

    await EmailSender.send(
      to,
      subject,
      html,
      text,
      { from },
      true, // async
      booking.id, // for logging
    );
  }

  /**
   * Send SMS to guest
   */
  // @ts-ignore
  static async _sendGuestSms(booking, eventType, to) {
    const enabled = await enableSmsAlerts();
    if (!enabled) {
      logger.debug(
        `[Notification] SMS alerts disabled, skipping guest SMS for ${to}`,
      );
      return;
    }

    const message = this._buildSmsContent(booking, eventType);
    const result = await SmsSender.send(to, message);

    // Log SMS notification manually (EmailSender already logs emails)
    await this._logSmsNotification({
      to,
      eventType,
      status: result.success ? "sent" : "failed",
      bookingId: booking.id,
      sid: result.sid,
      // @ts-ignore
      error: result.error,
    });
  }

  /**
   * Send admin alert email
   */
  // @ts-ignore
  static async _sendAdminAlert(booking, eventType) {
    const alertSetting = await adminAlerts();

    // Parse adminAlerts: "false", "true", JSON array, or comma list
    const isEnabled = !["false", "0", "no", "off", "disabled"].includes(
      String(alertSetting).trim().toLowerCase(),
    );

    if (!isEnabled) return;

    let adminEmails = [];
    const trimmed = String(alertSetting).trim();

    if (trimmed && trimmed !== "true" && trimmed !== "1") {
      try {
        adminEmails = JSON.parse(trimmed);
        if (!Array.isArray(adminEmails)) adminEmails = [adminEmails];
      } catch {
        // Fallback to comma‑separated
        adminEmails = trimmed
          .split(",")
          .map((e) => e.trim())
          .filter(Boolean);
      }
    }

    // If no explicit emails, try SMTP from address
    if (adminEmails.length === 0) {
      const smtp = await getSmtpConfig();
      if (smtp.from?.email) adminEmails = [smtp.from.email];
    }

    if (adminEmails.length === 0) {
      logger.warn(
        "[Notification] Admin alerts enabled but no recipient email configured",
      );
      return;
    }

    const { subject, html, text } = this._buildAdminAlertContent(
      booking,
      eventType,
    );
    const company = await companyName();
    const smtp = await getSmtpConfig();
    const from = smtp.from?.email ? `${company} <${smtp.from.email}>` : company;

    for (const email of adminEmails) {
      try {
        await EmailSender.send(
          email,
          `[ADMIN] ${subject}`,
          html,
          text,
          { from },
          true,
          booking.id,
        );
      } catch (err) {
        // @ts-ignore
        logger.error(`[Notification] Admin alert to ${email} failed`, err);
      }
    }
  }

  // -----------------------------------------------------------------
  // Content builders – using actual entity field names
  // -----------------------------------------------------------------

  // @ts-ignore
  static _buildEmailContent(booking, eventType) {
    const guest = booking.guest || {};
    const room = booking.room || {};
    const guestName = guest.fullName || "Valued Guest";
    const checkIn = booking.checkInDate
      ? new Date(booking.checkInDate).toLocaleDateString()
      : "N/A";
    const checkOut = booking.checkOutDate
      ? new Date(booking.checkOutDate).toLocaleDateString()
      : "N/A";
    const roomNumber = room.roomNumber || "TBD";
    const bookingRef = booking.id;
    const totalPrice = booking.totalPrice
      ? `₱${Number(booking.totalPrice).toFixed(2)}`
      : "N/A";

    const templates = {
      confirmed: {
        subject: "Booking Confirmed – Your stay",
        html: `<h2>Hello ${guestName},</h2>
               <p>Your booking <strong>#${bookingRef}</strong> is confirmed.</p>
               <p><strong>Room:</strong> ${roomNumber}<br>
               <strong>Check-in:</strong> ${checkIn}<br>
               <strong>Check-out:</strong> ${checkOut}<br>
               <strong>Guests:</strong> ${booking.numberOfGuests || 1}</p>
               <p>Thank you for choosing us!</p>`,
      },
      cancelled: {
        subject: "Booking Cancelled",
        html: `<h2>Hello ${guestName},</h2>
               <p>Your booking <strong>#${bookingRef}</strong> has been cancelled as requested.</p>
               <p>If you have any questions, please contact us.</p>`,
      },
      checked_out: {
        subject: "Thank You for Staying",
        html: `<h2>Dear ${guestName},</h2>
               <p>We hope you enjoyed your stay. Booking <strong>#${bookingRef}</strong> is now checked out.</p>
               <p>We look forward to welcoming you again!</p>`,
      },
      payment_received: {
        subject: "Payment Received",
        html: `<h2>Hello ${guestName},</h2>
               <p>We have successfully received your payment for booking <strong>#${bookingRef}</strong>.</p>
               <p><strong>Amount:</strong> ${totalPrice}<br>
               <strong>Date:</strong> ${new Date().toLocaleDateString()}</p>`,
      },
      payment_failed: {
        subject: "Payment Failed",
        html: `<h2>Hello ${guestName},</h2>
               <p>We were unable to process your payment for booking <strong>#${bookingRef}</strong>.</p>
               <p>Please update your payment details to avoid cancellation.</p>`,
      },
    };

    // @ts-ignore
    const template = templates[eventType] || templates.confirmed;
    // Replace {{company}} placeholder if present
    const subject = template.subject; // Company name can be prepended by caller if needed
    const htmlContent = template.html;
    const textContent = htmlContent.replace(/<[^>]*>/g, "");

    return { subject, html: htmlContent, text: textContent };
  }

  // @ts-ignore
  static _buildSmsContent(booking, eventType) {
    const guest = booking.guest || {};
    const guestName = guest.fullName?.split(" ")[0] || "Guest";
    const bookingRef = booking.id;
    const checkIn = booking.checkInDate
      ? new Date(booking.checkInDate).toLocaleDateString()
      : "";

    const templates = {
      confirmed: `Hi ${guestName}, your booking #${bookingRef} is confirmed. Check-in: ${checkIn}. Thank you!`,
      cancelled: `Hi ${guestName}, booking #${bookingRef} has been cancelled.`,
      checked_out: `Hi ${guestName}, thank you for staying with us! Booking #${bookingRef} checked out.`,
      payment_received: `Hi ${guestName}, payment received for booking #${bookingRef}.`,
      payment_failed: `Hi ${guestName}, payment failed for booking #${bookingRef}. Please update your details.`,
    };

    // @ts-ignore
    return templates[eventType] || templates.confirmed;
  }

  // @ts-ignore
  static _buildAdminAlertContent(booking, eventType) {
    const guest = booking.guest || {};
    const room = booking.room || {};
    const subject = `Booking ${eventType} – #${booking.id}`;
    const html = `<h3>Booking ${eventType}</h3>
                  <p><strong>Booking ID:</strong> ${booking.id}<br>
                  <strong>Guest:</strong> ${guest.fullName || "N/A"} (${guest.email || "no email"})<br>
                  <strong>Phone:</strong> ${guest.phone || "N/A"}<br>
                  <strong>Room:</strong> ${room.roomNumber || "N/A"} (${room.type || "N/A"})<br>
                  <strong>Check-in/out:</strong> ${booking.checkInDate || "N/A"} – ${booking.checkOutDate || "N/A"}<br>
                  <strong>Guests:</strong> ${booking.numberOfGuests || 1}<br>
                  <strong>Total:</strong> ₱${Number(booking.totalPrice || 0).toFixed(2)}<br>
                  <strong>Payment Status:</strong> ${booking.paymentStatus || "pending"}</p>`;
    const text = html.replace(/<[^>]*>/g, "");
    return { subject, html, text };
  }

  // -----------------------------------------------------------------
  // SMS logging
  // -----------------------------------------------------------------

  static async _logSmsNotification({
    // @ts-ignore
    to,
    // @ts-ignore
    eventType,
    // @ts-ignore
    status,
    // @ts-ignore
    bookingId,
    // @ts-ignore
    sid,
    // @ts-ignore
    error,
  }) {
    try {
      const repo = AppDataSource.getRepository(NotificationLog);
      const log = repo.create({
        // @ts-ignore
        recipient_phone: to,
        type: "sms",
        event_type: eventType,
        status,
        booking: bookingId ? { id: bookingId } : null,
        response: sid,
        error_message: error,
        sent_at: status === "sent" ? new Date() : null,
        last_error_at: status === "failed" ? new Date() : null,
        retry_count: 0,
      });
      await repo.save(log);
      logger.debug(`[Notification] SMS log saved: ${to} – ${status}`);
    } catch (err) {
      // @ts-ignore
      logger.error("[Notification] Failed to save SMS log", err);
    }
  }
}

module.exports = NotificationService;

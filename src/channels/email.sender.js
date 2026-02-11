// src/channels/email.sender.js
//@ts-check
const nodemailer = require("nodemailer");
const PQueue = require("p-queue").default;

// Import NotificationLog entity

const NotificationLog = require("../entities/NotificationLog");
const { logger } = require("../utils/logger");
const { AppDataSource } = require("../main/db/dataSource");

class EmailSender {
  constructor() {
    this.queue = new PQueue({ concurrency: 1 });
    this.maxRetries = 3;
    this.retryDelay = 2000; // 2 seconds
  }

  /**
   * @param {any} to
   * @param {any} subject
   * @param {any} html
   * @param {any} text
   */
  async send(
    to,
    subject,
    html,
    text,
    options = {},
    asyncMode = true,
    appointmentId = null,
  ) {
    if (asyncMode) {
      this.queue.add(() =>
        this._sendWithRetry(to, subject, html, text, options, appointmentId),
      );
      logger.info(`Queued email → To: ${to}, Subject: "${subject}"`);
      return { success: true, queued: true };
    } else {
      return await this._sendWithRetry(
        to,
        subject,
        html,
        text,
        options,
        appointmentId,
      );
    }
  }

  /**
   * @param {any} to
   * @param {any} subject
   * @param {any} html
   * @param {any} text
   * @param {{} | undefined} options
   * @param {null} appointmentId
   */
  async _sendWithRetry(to, subject, html, text, options, appointmentId) {
    let attempt = 0;
    while (attempt < this.maxRetries) {
      try {
        attempt++;
        logger.info(
          `Attempt ${attempt} sending email → To: ${to}, Subject: "${subject}"`,
        );
        const result = await this._sendInternal(
          to,
          subject,
          html,
          text,
          options,
        );
        await this._updateLog(
          to,
          subject,
          html,
          appointmentId,
          "sent",
          attempt,
        );
        return result;
      } catch (error) {
        // @ts-ignore
        logger.error(`❌ Attempt ${attempt} failed → To: ${to}`, error);
        if (attempt < this.maxRetries) {
          logger.warn(`Retrying in ${this.retryDelay / 1000}s...`);
          await new Promise((res) => setTimeout(res, this.retryDelay));
        } else {
          // @ts-ignore
          await this._updateLog(
            to,
            subject,
            html,
            appointmentId,
            "failed",
            attempt,
            // @ts-ignore
            error.message,
          );
          throw error;
        }
      }
    }
  }

  /**
   * @param {any} to
   * @param {any} subject
   * @param {string} html
   * @param {any} text
   */
  async _sendInternal(to, subject, html, text, options = {}) {
    const {
      enableEmailAlerts,
      smtpHost,
      smtpPort,
      smtpUsername,
      smtpPassword,
      companyName,
      smtpFromName,
      smtpFromEmail,
    } = require("../utils/system");
    if (!(await enableEmailAlerts())) {
      logger.warn("Email notifications are disabled");
      return { success: false, error: "Email disabled" };
    }

    const transporter = nodemailer.createTransport({
      // @ts-ignore
      host: await smtpHost(),
      port: await smtpPort(),
      secure: (await smtpPort()) == 465,
      auth: { user: await smtpUsername(), pass: await smtpPassword() },
    });

    const mailOptions = {
      from: `${await companyName()} <${await smtpFromEmail()}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ""),
      ...options,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`✅ Email sent → To: ${to}, MessageID: ${info.messageId}`);
    return {
      success: true,
      messageId: info.messageId,
      response: info.response,
    };
  }

  /**
   * @param {any} to
   * @param {any} subject
   * @param {any} html
   * @param {null} appointmentId
   * @param {string} status
   * @param {number} retryCount
   */
  async _updateLog(
    to,
    subject,
    html,
    appointmentId,
    status,
    retryCount,
    errorMessage = null,
  ) {
    try {
      const repo = AppDataSource.getRepository(NotificationLog);
      const log = repo.create({
        // @ts-ignore
        appointment: appointmentId ? { id: appointmentId } : null,
        recipient_email: to,
        subject,
        payload: html,
        status,
        retry_count: retryCount,
        error_message: errorMessage,
        sent_at: status === "sent" ? new Date() : null,
        last_error_at: status === "failed" ? new Date() : null,
      });
      await repo.save(log);
      logger.info(`📌 NotificationLog updated → To: ${to}, Status: ${status}`);
    } catch (err) {
      // @ts-ignore
      logger.error("❌ Failed to update NotificationLog", err);
    }
  }
}

module.exports = new EmailSender();

// src/services/notificationLog.service.js
// @ts-check
const { AppDataSource } = require("../main/db/datasource");
const NotificationLog = require("../entities/NotificationLog");
const emailSender = require("../channels/email.sender");
const { logger } = require("../utils/logger");

const LOG_STATUS = {
  QUEUED: "queued",
  SENT: "sent",
  FAILED: "failed",
  RESEND: "resend",
};

class NotificationLogService {
  /**
   * Get repository – optionally use queryRunner for transactions
   */
  getRepository(queryRunner = null) {
    if (queryRunner) {
      // @ts-ignore
      return queryRunner.manager.getRepository(NotificationLog);
    }
    return AppDataSource.getRepository(NotificationLog);
  }

  //#region 📋 READ OPERATIONS

  async getAllNotifications(
    {
      page = 1,
      limit = 50,
      // @ts-ignore
      status,
      // @ts-ignore
      startDate,
      // @ts-ignore
      endDate,
      sortBy = "created_at",
      sortOrder = "DESC",
    },
    queryRunner = null,
  ) {
    try {
      const repo = this.getRepository(queryRunner);
      const qb = repo.createQueryBuilder("log");

      if (status) qb.andWhere("log.status = :status", { status });
      if (startDate) qb.andWhere("log.created_at >= :startDate", { startDate });
      if (endDate) qb.andWhere("log.created_at <= :endDate", { endDate });

      qb.orderBy(`log.${sortBy}`, sortOrder)
        .skip((page - 1) * limit)
        .take(limit)
        .leftJoinAndSelect("log.booking", "booking");

      const [data, total] = await qb.getManyAndCount();
      return {
        status: true,
        data,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      };
    } catch (error) {
      // @ts-ignore
      logger?.error("NotificationLogService.getAllNotifications error:", error);
      // @ts-ignore
      return { status: false, message: error.message, data: null };
    }
  }

  // @ts-ignore
  async getNotificationById({ id }, queryRunner = null) {
    try {
      if (!id) return { status: false, message: "ID is required", data: null };
      const repo = this.getRepository(queryRunner);
      const notification = await repo.findOne({
        where: { id },
        relations: ["booking"],
      });
      if (!notification) {
        return { status: false, message: "Notification not found", data: null };
      }
      return { status: true, data: notification };
    } catch (error) {
      // @ts-ignore
      logger?.error("NotificationLogService.getNotificationById error:", error);
      // @ts-ignore
      return { status: false, message: error.message, data: null };
    }
  }

  async getNotificationsByRecipient(
    // @ts-ignore
    { recipient_email, page = 1, limit = 50 },
    queryRunner = null,
  ) {
    try {
      if (!recipient_email) {
        return {
          status: false,
          message: "Recipient email is required",
          data: null,
        };
      }
      const repo = this.getRepository(queryRunner);
      const [data, total] = await repo.findAndCount({
        where: { recipient_email },
        relations: ["booking"],
        order: { created_at: "DESC" },
        skip: (page - 1) * limit,
        take: limit,
      });
      return {
        status: true,
        data,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      };
    } catch (error) {
      logger?.error(
        "NotificationLogService.getNotificationsByRecipient error:",
        // @ts-ignore
        error,
      );
      // @ts-ignore
      return { status: false, message: error.message, data: null };
    }
  }

  async getNotificationsByBooking(
    // @ts-ignore
    { bookingId, page = 1, limit = 50 },
    queryRunner = null,
  ) {
    try {
      if (!bookingId) {
        return { status: false, message: "Booking ID is required", data: null };
      }
      const repo = this.getRepository(queryRunner);
      const [data, total] = await repo.findAndCount({
        where: { booking: { id: bookingId } },
        relations: ["booking"],
        order: { created_at: "DESC" },
        skip: (page - 1) * limit,
        take: limit,
      });
      return {
        status: true,
        data,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      };
    } catch (error) {
      logger?.error(
        "NotificationLogService.getNotificationsByBooking error:",
        // @ts-ignore
        error,
      );
      // @ts-ignore
      return { status: false, message: error.message, data: null };
    }
  }

  async searchNotifications(
    // @ts-ignore
    { keyword, page = 1, limit = 50 },
    queryRunner = null,
  ) {
    try {
      if (!keyword) {
        return { status: false, message: "Keyword is required", data: null };
      }
      const repo = this.getRepository(queryRunner);
      const qb = repo
        .createQueryBuilder("log")
        .where("log.recipient_email LIKE :keyword", { keyword: `%${keyword}%` })
        .orWhere("log.subject LIKE :keyword", { keyword: `%${keyword}%` })
        .orWhere("log.payload LIKE :keyword", { keyword: `%${keyword}%` })
        .orderBy("log.created_at", "DESC")
        .skip((page - 1) * limit)
        .take(limit)
        .leftJoinAndSelect("log.booking", "booking");

      const [data, total] = await qb.getManyAndCount();
      return {
        status: true,
        data,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      };
    } catch (error) {
      // @ts-ignore
      logger?.error("NotificationLogService.searchNotifications error:", error);
      // @ts-ignore
      return { status: false, message: error.message, data: null };
    }
  }

  //#endregion

  //#region ✏️ WRITE OPERATIONS

  // @ts-ignore
  async deleteNotification({ id }, queryRunner = null) {
    try {
      if (!id) return { status: false, message: "ID is required", data: null };
      const repo = this.getRepository(queryRunner);
      const notification = await repo.findOne({ where: { id } });
      if (!notification) {
        return { status: false, message: "Notification not found", data: null };
      }
      await repo.remove(notification);
      return { status: true, message: "Notification deleted successfully" };
    } catch (error) {
      // @ts-ignore
      logger?.error("NotificationLogService.deleteNotification error:", error);
      // @ts-ignore
      return { status: false, message: error.message, data: null };
    }
  }

  async updateNotificationStatus(
    // @ts-ignore
    { id, status, errorMessage = null },
    queryRunner = null,
  ) {
    try {
      if (!id || !status) {
        return {
          status: false,
          message: "ID and status are required",
          data: null,
        };
      }
      const repo = this.getRepository(queryRunner);
      const notification = await repo.findOne({ where: { id } });
      if (!notification) {
        return { status: false, message: "Notification not found", data: null };
      }

      notification.status = status;
      notification.error_message = errorMessage;
      if (status === LOG_STATUS.SENT) {
        notification.sent_at = new Date();
      } else if (status === LOG_STATUS.FAILED) {
        notification.last_error_at = new Date();
      }
      notification.updated_at = new Date();

      const saved = await repo.save(notification);
      return { status: true, data: saved };
    } catch (error) {
      logger?.error(
        "NotificationLogService.updateNotificationStatus error:",
        // @ts-ignore
        error,
      );
      // @ts-ignore
      return { status: false, message: error.message, data: null };
    }
  }

  //#endregion

  //#region 🔄 RETRY / RESEND OPERATIONS

  // @ts-ignore
  async retryFailedNotification({ id }, queryRunner = null) {
    try {
      if (!id) {
        return {
          status: false,
          message: "Notification ID is required",
          data: null,
        };
      }

      const repo = this.getRepository(queryRunner);
      const notification = await repo.findOne({
        where: { id },
        relations: ["booking"],
      });

      if (!notification) {
        return { status: false, message: "Notification not found", data: null };
      }

      if (
        ![LOG_STATUS.FAILED, LOG_STATUS.QUEUED].includes(notification.status)
      ) {
        return {
          status: false,
          message: `Cannot retry notification with status: ${notification.status}`,
          data: null,
        };
      }

      // Attempt to send email
      const sendResult = await emailSender.send(
        notification.recipient_email,
        notification.subject || "No Subject",
        notification.payload || "",
        null,
        {},
        false, // wait for result
        notification.booking?.id || null,
      );

      // Update log
      // @ts-ignore
      if (sendResult.success) {
        notification.status = LOG_STATUS.SENT;
        notification.sent_at = new Date();
        notification.error_message = null;
        notification.last_error_at = null;
      } else {
        notification.status = LOG_STATUS.FAILED;
        notification.last_error_at = new Date();
        // @ts-ignore
        notification.error_message = sendResult.error || "Unknown error";
      }
      notification.retry_count = (notification.retry_count || 0) + 1;
      notification.updated_at = new Date();

      const saved = await repo.save(notification);
      return {
        status: true,
        data: saved,
        sendResult,
      };
    } catch (error) {
      logger?.error(
        "NotificationLogService.retryFailedNotification error:",
        // @ts-ignore
        error,
      );
      // @ts-ignore
      return { status: false, message: error.message, data: null };
    }
  }

  async retryAllFailed({ filters = {} }, queryRunner = null) {
    try {
      const repo = this.getRepository(queryRunner);
      const qb = repo
        .createQueryBuilder("log")
        .where("log.status IN (:...statuses)", {
          statuses: [LOG_STATUS.FAILED, LOG_STATUS.QUEUED],
        });

      // @ts-ignore
      if (filters.recipient_email) {
        qb.andWhere("log.recipient_email = :recipient", {
          // @ts-ignore
          recipient: filters.recipient_email,
        });
      }
      // @ts-ignore
      if (filters.createdBefore) {
        qb.andWhere("log.created_at <= :before", {
          // @ts-ignore
          before: filters.createdBefore,
        });
      }

      const failedNotifications = await qb.getMany();

      const results = [];
      for (const notification of failedNotifications) {
        const result = await this.retryFailedNotification(
          { id: notification.id },
          queryRunner,
        );
        results.push({ id: notification.id, ...result });
      }

      const successCount = results.filter((r) => r.sendResult?.success).length;
      const failCount = results.length - successCount;

      return {
        status: true,
        message: `Retried ${results.length} notifications. ${successCount} succeeded, ${failCount} failed.`,
        data: results,
      };
    } catch (error) {
      // @ts-ignore
      logger?.error("NotificationLogService.retryAllFailed error:", error);
      // @ts-ignore
      return { status: false, message: error.message, data: null };
    }
  }

  // @ts-ignore
  async resendNotification({ id }, queryRunner = null) {
    try {
      if (!id) {
        return {
          status: false,
          message: "Notification ID is required",
          data: null,
        };
      }

      const repo = this.getRepository(queryRunner);
      const notification = await repo.findOne({
        where: { id },
        relations: ["booking"],
      });

      if (!notification) {
        return { status: false, message: "Notification not found", data: null };
      }

      const sendResult = await emailSender.send(
        notification.recipient_email,
        notification.subject || "No Subject",
        notification.payload || "",
        null,
        {},
        false,
        notification.booking?.id || null,
      );

      // @ts-ignore
      if (sendResult.success) {
        notification.status = LOG_STATUS.RESEND;
        notification.sent_at = new Date();
        notification.error_message = null;
      } else {
        notification.status = LOG_STATUS.FAILED;
        notification.last_error_at = new Date();
        // @ts-ignore
        notification.error_message = sendResult.error || "Unknown error";
      }
      notification.resend_count = (notification.resend_count || 0) + 1;
      notification.updated_at = new Date();

      const saved = await repo.save(notification);
      return {
        status: true,
        data: saved,
        sendResult,
      };
    } catch (error) {
      // @ts-ignore
      logger?.error("NotificationLogService.resendNotification error:", error);
      // @ts-ignore
      return { status: false, message: error.message, data: null };
    }
  }

  //#endregion

  //#region 📊 STATISTICS

  // @ts-ignore
  async getNotificationStats({ startDate, endDate }, queryRunner = null) {
    try {
      const repo = this.getRepository(queryRunner);
      const qb = repo.createQueryBuilder("log");

      if (startDate) qb.andWhere("log.created_at >= :startDate", { startDate });
      if (endDate) qb.andWhere("log.created_at <= :endDate", { endDate });

      // Status counts
      const statusStats = await qb
        .clone()
        .select("log.status", "status")
        .addSelect("COUNT(log.id)", "count")
        .groupBy("log.status")
        .getRawMany();

      const total = await qb.clone().getCount();

      const avgRetry = await qb
        .clone()
        .where("log.status = :status", { status: LOG_STATUS.FAILED })
        .select("AVG(log.retry_count)", "avg")
        .getRawOne();

      const last24h = await qb
        .clone()
        .where("log.created_at >= :date", {
          date: new Date(Date.now() - 24 * 60 * 60 * 1000),
        })
        .getCount();

      return {
        status: true,
        data: {
          total,
          // @ts-ignore
          byStatus: statusStats.reduce((acc, { status, count }) => {
            acc[status] = parseInt(count);
            return acc;
          }, {}),
          avgRetryFailed: parseFloat(avgRetry?.avg) || 0,
          last24h,
        },
      };
    } catch (error) {
      logger?.error(
        "NotificationLogService.getNotificationStats error:",
        // @ts-ignore
        error,
      );
      // @ts-ignore
      return { status: false, message: error.message, data: null };
    }
  }

  //#endregion

  //#region 🧩 CREATE (used by email/sms sender)

  // @ts-ignore
  async createLog(data, queryRunner = null) {
    try {
      const repo = this.getRepository(queryRunner);
      const log = repo.create({
        recipient_email: data.to,
        subject: data.subject,
        payload: data.html || data.text,
        status: LOG_STATUS.QUEUED,
        retry_count: 0,
        resend_count: 0,
        booking: data.bookingId ? { id: data.bookingId } : null,
      });
      const saved = await repo.save(log);
      return { status: true, data: saved };
    } catch (error) {
      // @ts-ignore
      logger?.error("NotificationLogService.createLog error:", error);
      // @ts-ignore
      return { status: false, message: error.message, data: null };
    }
  }

  //#endregion
}

module.exports = { NotificationLogService, LOG_STATUS };

// src/renderer/api/notificationLog.ts
// Similar structure to audit.ts – Notification Log API client

// ----------------------------------------------------------------------
// 📦 Types & Interfaces
// ----------------------------------------------------------------------

export interface NotificationLogEntry {
  id: number;
  recipient_email: string;
  subject: string | null;
  payload: string | null;
  status: "queued" | "sent" | "failed" | "resend";
  error_message: string | null;
  retry_count: number;
  resend_count: number;
  sent_at: string | null;
  last_error_at: string | null;
  created_at: string;
  updated_at: string;
  booking?: {
    id: number;
    checkInDate?: string;
    checkOutDate?: string;
    guest?: { fullName?: string; email?: string };
  } | null;
}

export interface PaginatedNotifications {
  items: NotificationLogEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface NotificationStats {
  total: number;
  byStatus: Record<string, number>;
  avgRetryFailed: number;
  last24h: number;
}

// ----------------------------------------------------------------------
// 📨 Response Interfaces (mirror IPC response format)
// ----------------------------------------------------------------------

export interface NotificationsResponse {
  status: boolean;
  message: string;
  data: PaginatedNotifications;
}

export interface NotificationResponse {
  status: boolean;
  message: string;
  data: NotificationLogEntry;
}

export interface NotificationStatsResponse {
  status: boolean;
  message: string;
  data: NotificationStats;
}

export interface NotificationActionResult {
  status: boolean;
  message: string;
  data?: NotificationLogEntry | NotificationLogEntry[] | { sendResult?: any };
}

// Generic response for retry/resend/delete/update operations
export interface NotificationActionResponse {
  status: boolean;
  message: string;
  data?: any;
}

// ----------------------------------------------------------------------
// 🧠 NotificationLogAPI Class
// ----------------------------------------------------------------------

class NotificationLogAPI {
  // --------------------------------------------------------------------
  // 🔎 READ-ONLY METHODS
  // --------------------------------------------------------------------

  /**
   * Get all notification logs with pagination and optional filters
   * @param params.page - Page number (1‑based)
   * @param params.limit - Items per page (default 50, max 100)
   * @param params.status - Filter by status ('queued', 'sent', 'failed', 'resend')
   * @param params.startDate - ISO date string
   * @param params.endDate - ISO date string
   * @param params.sortBy - Field to sort by (default 'created_at')
   * @param params.sortOrder - 'ASC' or 'DESC' (default 'DESC')
   */
  async getAll(params?: {
    page?: number;
    limit?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: "ASC" | "DESC";
  }): Promise<NotificationsResponse> {
    try {
      if (!window.backendAPI?.notification) {
        throw new Error("Electron API (notification) not available");
      }

      const response = await window.backendAPI.notification({
        method: "getAllNotifications",
        params: params || {},
      });

      if (response.status) {
        return response;
      }
      throw new Error(response.message || "Failed to fetch notification logs");
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch notification logs");
    }
  }

  /**
   * Get a single notification log by ID
   * @param id - Notification log ID
   */
  async getById(id: number): Promise<NotificationResponse> {
    try {
      if (!window.backendAPI?.notification) {
        throw new Error("Electron API (notification) not available");
      }

      const response = await window.backendAPI.notification({
        method: "getNotificationById",
        params: { id },
      });

      if (response.status) {
        return response;
      }
      throw new Error(response.message || "Failed to fetch notification log");
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch notification log");
    }
  }

  /**
   * Get notification logs filtered by recipient email
   * @param params.recipient_email - Email address
   * @param params.page - Page number
   * @param params.limit - Items per page
   */
  async getByRecipient(params: {
    recipient_email: string;
    page?: number;
    limit?: number;
  }): Promise<NotificationsResponse> {
    try {
      if (!window.backendAPI?.notification) {
        throw new Error("Electron API (notification) not available");
      }

      const response = await window.backendAPI.notification({
        method: "getNotificationsByRecipient",
        params,
      });

      if (response.status) {
        return response;
      }
      throw new Error(response.message || "Failed to fetch notifications by recipient");
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch notifications by recipient");
    }
  }

  /**
   * Get notification logs associated with a booking
   * @param params.bookingId - Booking ID
   * @param params.page - Page number
   * @param params.limit - Items per page
   */
  async getByBooking(params: {
    bookingId: number;
    page?: number;
    limit?: number;
  }): Promise<NotificationsResponse> {
    try {
      if (!window.backendAPI?.notification) {
        throw new Error("Electron API (notification) not available");
      }

      const response = await window.backendAPI.notification({
        method: "getNotificationsByBooking",
        params,
      });

      if (response.status) {
        return response;
      }
      throw new Error(response.message || "Failed to fetch notifications by booking");
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch notifications by booking");
    }
  }

  /**
   * Search notification logs by keyword in recipient, subject, or payload
   * @param params.keyword - Search term
   * @param params.page - Page number
   * @param params.limit - Items per page
   */
  async search(params: {
    keyword: string;
    page?: number;
    limit?: number;
  }): Promise<NotificationsResponse> {
    try {
      if (!window.backendAPI?.notification) {
        throw new Error("Electron API (notification) not available");
      }

      const response = await window.backendAPI.notification({
        method: "searchNotifications",
        params,
      });

      if (response.status) {
        return response;
      }
      throw new Error(response.message || "Failed to search notifications");
    } catch (error: any) {
      throw new Error(error.message || "Failed to search notifications");
    }
  }

  /**
   * Get notification logs filtered by status (shortcut)
   * @param params.status - Status value
   * @param params.page - Page number
   * @param params.limit - Items per page
   */
  async getByStatus(params: {
    status: string;
    page?: number;
    limit?: number;
  }): Promise<NotificationsResponse> {
    // Reuse getAll with status filter
    return this.getAll({ ...params });
  }

  // --------------------------------------------------------------------
  // 📊 STATISTICS
  // --------------------------------------------------------------------

  /**
   * Get summary statistics of notification logs
   * @param params.startDate - Optional start date
   * @param params.endDate - Optional end date
   */
  async getStats(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<NotificationStatsResponse> {
    try {
      if (!window.backendAPI?.notification) {
        throw new Error("Electron API (notification) not available");
      }

      const response = await window.backendAPI.notification({
        method: "getNotificationStats",
        params: params || {},
      });

      if (response.status) {
        return response;
      }
      throw new Error(response.message || "Failed to fetch notification stats");
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch notification stats");
    }
  }

  // --------------------------------------------------------------------
  // ✏️ WRITE OPERATIONS (status updates, delete)
  // --------------------------------------------------------------------

  /**
   * Delete a notification log entry
   * @param id - Notification log ID
   * @param userId - Optional user ID for audit logging
   */
  async delete(id: number, userId?: string | number): Promise<NotificationActionResponse> {
    try {
      if (!window.backendAPI?.notification) {
        throw new Error("Electron API (notification) not available");
      }

      const response = await window.backendAPI.notification({
        method: "deleteNotification",
        params: { id, userId },
      });

      if (response.status) {
        return response;
      }
      throw new Error(response.message || "Failed to delete notification log");
    } catch (error: any) {
      throw new Error(error.message || "Failed to delete notification log");
    }
  }

  /**
   * Manually update the status of a notification
   * @param params.id - Notification log ID
   * @param params.status - New status
   * @param params.errorMessage - Optional error message if failed
   * @param params.userId - Optional user ID for audit logging
   */
  async updateStatus(params: {
    id: number;
    status: string;
    errorMessage?: string | null;
    userId?: string | number;
  }): Promise<NotificationActionResponse> {
    try {
      if (!window.backendAPI?.notification) {
        throw new Error("Electron API (notification) not available");
      }

      const response = await window.backendAPI.notification({
        method: "updateNotificationStatus",
        params,
      });

      if (response.status) {
        return response;
      }
      throw new Error(response.message || "Failed to update notification status");
    } catch (error: any) {
      throw new Error(error.message || "Failed to update notification status");
    }
  }

  // --------------------------------------------------------------------
  // 🔄 RETRY / RESEND OPERATIONS
  // --------------------------------------------------------------------

  /**
   * Retry sending a failed or queued notification
   * @param id - Notification log ID
   * @param userId - Optional user ID for audit logging
   */
  async retryFailed(id: number, userId?: string | number): Promise<NotificationActionResponse> {
    try {
      if (!window.backendAPI?.notification) {
        throw new Error("Electron API (notification) not available");
      }

      const response = await window.backendAPI.notification({
        method: "retryFailedNotification",
        params: { id, userId },
      });

      if (response.status) {
        return response;
      }
      throw new Error(response.message || "Failed to retry notification");
    } catch (error: any) {
      throw new Error(error.message || "Failed to retry notification");
    }
  }

  /**
   * Retry all failed/queued notifications (with optional filters)
   * @param params.filters - Optional filters (recipient_email, createdBefore)
   * @param params.userId - Optional user ID for audit logging
   */
  async retryAllFailed(params?: {
    filters?: {
      recipient_email?: string;
      createdBefore?: string;
    };
    userId?: string | number;
  }): Promise<NotificationActionResponse> {
    try {
      if (!window.backendAPI?.notification) {
        throw new Error("Electron API (notification) not available");
      }

      const response = await window.backendAPI.notification({
        method: "retryAllFailed",
        params: params || {},
      });

      if (response.status) {
        return response;
      }
      throw new Error(response.message || "Failed to retry all failed notifications");
    } catch (error: any) {
      throw new Error(error.message || "Failed to retry all failed notifications");
    }
  }

  /**
   * Resend a notification (force resend, increments resend_count)
   * @param id - Notification log ID
   * @param userId - Optional user ID for audit logging
   */
  async resend(id: number, userId?: string | number): Promise<NotificationActionResponse> {
    try {
      if (!window.backendAPI?.notification) {
        throw new Error("Electron API (notification) not available");
      }

      const response = await window.backendAPI.notification({
        method: "resendNotification",
        params: { id, userId },
      });

      if (response.status) {
        return response;
      }
      throw new Error(response.message || "Failed to resend notification");
    } catch (error: any) {
      throw new Error(error.message || "Failed to resend notification");
    }
  }

  // --------------------------------------------------------------------
  // 🧰 UTILITY METHODS
  // --------------------------------------------------------------------

  /**
   * Check if a specific recipient has any notification logs
   * @param recipient_email - Email address
   */
  async hasLogs(recipient_email: string): Promise<boolean> {
    try {
      const response = await this.getByRecipient({ recipient_email, limit: 1 });
      return response.data.total > 0;
    } catch (error) {
      console.error("Error checking notification logs:", error);
      return false;
    }
  }

  /**
   * Get the latest notification log entry for a recipient
   * @param recipient_email - Email address
   */
  async getLatestByRecipient(recipient_email: string): Promise<NotificationLogEntry | null> {
    try {
      const response = await this.getByRecipient({ recipient_email, limit: 1, page: 1 });
      return response.data.items[0] || null;
    } catch (error) {
      console.error("Error fetching latest notification:", error);
      return null;
    }
  }

  /**
   * Check if the backend API is available
   */
  async isAvailable(): Promise<boolean> {
    return !!(window.backendAPI?.notification);
  }
}

// ----------------------------------------------------------------------
// 📤 Export singleton instance
// ----------------------------------------------------------------------

const notificationLogAPI = new NotificationLogAPI();
export default notificationLogAPI;
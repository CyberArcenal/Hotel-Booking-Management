// src/main/ipc/dashboard/index.ipc.js
// Dashboard IPC Handler (Read-Only Reporting)
const { ipcMain } = require("electron");
const { logger } = require("../../../utils/logger");
const reportService = require("../../../services/Report");
const { withErrorHandling } = require("../../../middlewares/errorHandler");

class DashboardHandler {
  constructor() {
    // Initialize all dashboard handlers
    this.initializeHandlers();
  }

  initializeHandlers() {
    // 📊 DASHBOARD & OVERVIEW HANDLERS
    this.getDashboardData = this.importHandler("./get/dashboard.ipc");
    this.getBookingStatistics = this.importHandler("./get/bookingStatistics.ipc");

    // 📈 TREND & PERFORMANCE HANDLERS
    this.getRevenueTrend = this.importHandler("./get/revenueTrend.ipc");
    this.getOccupancyReport = this.importHandler("./get/occupancyReport.ipc");
    this.getRoomPerformance = this.importHandler("./get/roomPerformance.ipc");

    // 👥 GUEST INSIGHTS HANDLERS
    this.getGuestSegmentation = this.importHandler("./get/guestSegmentation.ipc");
    this.getUpcomingBookings = this.importHandler("./get/upcomingBookings.ipc");

    // 💰 FINANCIAL & SEASONAL HANDLERS
    this.getFinancialSummary = this.importHandler("./get/financialSummary.ipc");
    this.getSeasonalTrends = this.importHandler("./get/seasonalTrends.ipc");

    // 📄 REPORT GENERATION HANDLER
    this.generateReport = this.importHandler("./generate/report.ipc");
  }

  /**
   * Import a handler module with fallback for unimplemented paths
   * @param {string} path - Relative path to handler file
   */
  importHandler(path) {
    try {
      const fullPath = require.resolve(`./${path}`, { paths: [__dirname] });
      return require(fullPath);
    } catch (error) {
      console.warn(
        `[DashboardHandler] Failed to load handler: ${path}`,
        error.message
      );
      // Return a fallback handler
      return async (params = {}) => ({
        status: false,
        message: `Handler not implemented: ${path}`,
        data: null,
        params,
      });
    }
  }

  /**
   * Main request handler – routes method calls to individual handlers
   * @param {Electron.IpcMainInvokeEvent} event
   * @param {{ method: string; params: object }} payload
   */
  async handleRequest(event, payload) {
    try {
      const { method, params = {} } = payload;

      // Log dashboard request (redact sensitive filters if any)
      if (logger) {
        logger.info(`DashboardHandler: ${method}`, {
          params: this.sanitizeParams(params),
        });
      }

      // Ensure report service is ready
      await this.ensureReportService();

      // Route to the appropriate handler
      switch (method) {
        // 📊 DASHBOARD & OVERVIEW
        case "getDashboardData":
          return await this.getDashboardData(params);
        case "getBookingStatistics":
          return await this.getBookingStatistics(params);

        // 📈 TREND & PERFORMANCE
        case "getRevenueTrend":
          return await this.getRevenueTrend(params);
        case "getOccupancyReport":
          return await this.getOccupancyReport(params);
        case "getRoomPerformance":
          return await this.getRoomPerformance(params);

        // 👥 GUEST INSIGHTS
        case "getGuestSegmentation":
          return await this.getGuestSegmentation(params);
        case "getUpcomingBookings":
          return await this.getUpcomingBookings(params);

        // 💰 FINANCIAL & SEASONAL
        case "getFinancialSummary":
          return await this.getFinancialSummary(params);
        case "getSeasonalTrends":
          return await this.getSeasonalTrends(params);

        // 📄 REPORT GENERATION
        case "generateReport":
          return await this.generateReport(params);

        default:
          return {
            status: false,
            message: `Unknown dashboard method: ${method}`,
            data: null,
          };
      }
    } catch (error) {
      console.error("[DashboardHandler] Unhandled error:", error);
      if (logger) {
        logger.error("[DashboardHandler] Unhandled error:", error);
      }
      return {
        status: false,
        message: error.message || "Internal dashboard handler error",
        data: null,
      };
    }
  }

  /**
   * Ensure the ReportService is initialized before handling requests
   */
  async ensureReportService() {
    if (!reportService.bookingRepository) {
      await reportService.initialize();
    }
    return reportService;
  }

  /**
   * Sanitize parameters to avoid logging sensitive data
   * @param {object} params
   */
  sanitizeParams(params) {
    const sanitized = { ...params };
    // Redact any personally identifiable information or search terms
    if (sanitized.user) sanitized.user = "[REDACTED]";
    if (sanitized.email) sanitized.email = "[REDACTED]";
    if (sanitized.guestId) sanitized.guestId = "[REDACTED]";
    // Keep all report‑related parameters (dates, periods, etc.) visible
    return sanitized;
  }
}

// ---------------------------------------------------------------------
// Register IPC handler with error‑handling middleware
// ---------------------------------------------------------------------
const dashboardHandler = new DashboardHandler();

ipcMain.handle(
  "dashboard",
  withErrorHandling(
    dashboardHandler.handleRequest.bind(dashboardHandler),
    "IPC:dashboard"
  )
);

module.exports = { DashboardHandler, dashboardHandler };
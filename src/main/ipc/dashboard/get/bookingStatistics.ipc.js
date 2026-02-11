// src/main/ipc/dashboard/get/bookingStatistics.ipc.js
const reportService = require("../../../../services/Report");

/**
 * Retrieve booking statistics (counts, revenue, status breakdown)
 * @param {Object} params - Optional filters
 * @param {string} [params.period] - 'day', 'week', 'month', 'year'
 * @returns {Promise<{status: boolean, data: Object, message: string}>}
 */
module.exports = async (params = {}) => {
  try {
    const data = await reportService.getBookingStatistics(params);
    return {
      status: true,
      data,
      message: "Booking statistics retrieved",
    };
  } catch (error) {
    console.error("[getBookingStatistics] Error:", error.message);
    return {
      status: false,
      data: null,
      message: error.message || "Failed to fetch booking statistics",
    };
  }
};
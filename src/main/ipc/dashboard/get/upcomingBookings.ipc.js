// src/main/ipc/dashboard/get/upcomingBookings.ipc.js
const reportService = require("../../../../services/Report");

/**
 * Get bookings for the next X days
 * @param {Object} params
 * @param {number} [params.days=7] - Number of days ahead
 * @returns {Promise<{status: boolean, data: Array, message: string}>}
 */
module.exports = async (params = {}) => {
  try {
    const { days = 7 } = params;
    const data = await reportService.getUpcomingBookings(Number(days));
    return {
      status: true,
      data,
      message: `Upcoming bookings (next ${days} days) retrieved`,
    };
  } catch (error) {
    console.error("[getUpcomingBookings] Error:", error.message);
    return {
      status: false,
      data: [],
      message: error.message || "Failed to fetch upcoming bookings",
    };
  }
};
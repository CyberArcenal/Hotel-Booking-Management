// src/main/ipc/dashboard/get/occupancyReport.ipc.js
const reportService = require("../../../../services/Report");

/**
 * Retrieve occupancy rates for a given period
 * @param {Object} params
 * @param {string} [params.period='day'] - 'day', 'week', 'month'
 * @param {number} [params.days=30] - Number of days to analyze
 * @returns {Promise<{status: boolean, data: Array, message: string}>}
 */
module.exports = async (params = {}) => {
  try {
    const { period = "day", days = 30 } = params;
    const data = await reportService.getOccupancyReport(period, Number(days));
    return {
      status: true,
      data,
      message: `Occupancy report (${period}) retrieved`,
    };
  } catch (error) {
    console.error("[getOccupancyReport] Error:", error.message);
    return {
      status: false,
      data: [],
      message: error.message || "Failed to fetch occupancy report",
    };
  }
};
// src/main/ipc/dashboard/get/revenueTrend.ipc.js
const reportService = require("../../../../services/Report");

/**
 * Get revenue trend over time
 * @param {Object} params
 * @param {string} [params.period='month'] - 'day', 'week', 'month', 'year'
 * @param {number} [params.count=6] - Number of periods to return
 * @returns {Promise<{status: boolean, data: Array, message: string}>}
 */
module.exports = async (params = {}) => {
  try {
    const { period = "month", count = 6 } = params;
    const data = await reportService.getRevenueTrend(period, Number(count));
    return {
      status: true,
      data,
      message: `Revenue trend (${period}) retrieved`,
    };
  } catch (error) {
    console.error("[getRevenueTrend] Error:", error.message);
    return {
      status: false,
      data: [],
      message: error.message || "Failed to fetch revenue trend",
    };
  }
};
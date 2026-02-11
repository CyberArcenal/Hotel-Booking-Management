// src/main/ipc/dashboard/get/seasonalTrends.ipc.js
const reportService = require("../../../../services/Report");

/**
 * Get seasonal trends over several years
 * @param {Object} params
 * @param {number} [params.years=3] - Number of years to analyze
 * @returns {Promise<{status: boolean, data: Object, message: string}>}
 */
module.exports = async (params = {}) => {
  try {
    const { years = 3 } = params;
    const data = await reportService.getSeasonalTrends(Number(years));
    return {
      status: true,
      data,
      message: `Seasonal trends (${years} years) retrieved`,
    };
  } catch (error) {
    console.error("[getSeasonalTrends] Error:", error.message);
    return {
      status: false,
      data: null,
      message: error.message || "Failed to fetch seasonal trends",
    };
  }
};
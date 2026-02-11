// src/main/ipc/dashboard/get/financialSummary.ipc.js
const reportService = require("../../../../services/Report");

/**
 * Generate financial summary for a date range
 * @param {Object} params
 * @param {string} params.startDate - YYYY-MM-DD
 * @param {string} params.endDate - YYYY-MM-DD
 * @returns {Promise<{status: boolean, data: Object, message: string}>}
 */
module.exports = async (params = {}) => {
  try {
    const { startDate, endDate } = params;

    // --- Validation ---
    if (!startDate || !endDate) {
      return {
        status: false,
        data: null,
        message: "startDate and endDate are required",
      };
    }
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      return {
        status: false,
        data: null,
        message: "Invalid date format. Use YYYY-MM-DD",
      };
    }

    const data = await reportService.getFinancialSummary(startDate, endDate);
    return {
      status: true,
      data,
      message: `Financial summary (${startDate} to ${endDate}) retrieved`,
    };
  } catch (error) {
    console.error("[getFinancialSummary] Error:", error.message);
    return {
      status: false,
      data: null,
      message: error.message || "Failed to fetch financial summary",
    };
  }
};
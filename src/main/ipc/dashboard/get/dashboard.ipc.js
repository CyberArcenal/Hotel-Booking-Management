// src/main/ipc/dashboard/get/dashboard.ipc.js
const reportService = require("../../../../services/Report");

/**
 * Fetch the complete dashboard overview
 * @param {Object} params - No parameters required
 * @returns {Promise<{status: boolean, data: Object, message: string}>}
 */
module.exports = async (params = {}) => {
  try {
    const data = await reportService.getDashboardData();
    return {
      status: true,
      data,
      message: "Dashboard data retrieved successfully",
    };
  } catch (error) {
    console.error("[getDashboardData] Error:", error.message);
    return {
      status: false,
      data: null,
      message: error.message || "Failed to fetch dashboard data",
    };
  }
};
// src/main/ipc/dashboard/get/roomPerformance.ipc.js
const reportService = require("../../../../services/Report");

/**
 * Get performance metrics per room
 * @param {Object} params - No parameters required
 * @returns {Promise<{status: boolean, data: Array, message: string}>}
 */
module.exports = async (params = {}) => {
  try {
    const data = await reportService.getRoomPerformance();
    return {
      status: true,
      data,
      message: "Room performance data retrieved",
    };
  } catch (error) {
    console.error("[getRoomPerformance] Error:", error.message);
    return {
      status: false,
      data: [],
      message: error.message || "Failed to fetch room performance",
    };
  }
};
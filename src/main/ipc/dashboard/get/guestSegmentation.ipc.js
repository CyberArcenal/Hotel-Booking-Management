// src/main/ipc/dashboard/get/guestSegmentation.ipc.js
const reportService = require("../../../../services/Report");

/**
 * Retrieve guest segmentation insights
 * @param {Object} params - No parameters required
 * @returns {Promise<{status: boolean, data: Object, message: string}>}
 */
module.exports = async (params = {}) => {
  try {
    const data = await reportService.getGuestSegmentation();
    return {
      status: true,
      data,
      message: "Guest segmentation retrieved",
    };
  } catch (error) {
    console.error("[getGuestSegmentation] Error:", error.message);
    return {
      status: false,
      data: null,
      message: error.message || "Failed to fetch guest segmentation",
    };
  }
};
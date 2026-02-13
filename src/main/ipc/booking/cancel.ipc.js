// cancel.ipc.js placeholder
const bookingService = require("../../../services/Booking");

/**
 * Cancel a booking
 * @param {Object} params
 * @param {number} params.id - Booking ID
 * @param {string} [params.reason] - Cancellation reason
 * @param {string} [params.user] - Username for audit
 * @returns {Promise<{ status: boolean; message: string; data: object | null }>}
 */
module.exports = async (params) => {
  try {
    const { id, reason, user = "system" } = params;
    if (!id) throw new Error("Booking ID is required");

    const cancelled = await bookingService.cancel(id, reason, user);
    return {
      status: true,
      message: "Booking cancelled successfully",
      data: cancelled,
    };
  } catch (error) {
    console.error("[cancel.ipc] Error:", error.message);
    return {
      status: false,
      message: error.message || "Failed to cancel booking",
      data: null,
    };
  }
};

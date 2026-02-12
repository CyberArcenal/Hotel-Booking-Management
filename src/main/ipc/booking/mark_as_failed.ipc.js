//@ts-check

const bookingService = require("../../../services/Booking");

/**
 * Update only the status of a booking
 * @param {Object} params
 * @param {number} params.id - Booking ID
 * @param {string} params.status - New status (confirmed, checked_in, checked_out, cancelled)
 * @param {string} [params.reason] - Reason for status change (e.g., cancellation reason)
 * @param {string} [params.user] - Username for audit
 * @returns {Promise<{ status: boolean; message: string; data: object | null }>}
 */
module.exports = async (params) => {
  try {
    const { id, reason = null } = params;
    if (!id) throw new Error("Booking ID is required");

    const updated = await bookingService.markAsFailed(id, reason);

    return {
      status: true,
      message: `Booking marked as failed: ${reason}`,

      data: updated,
    };
  } catch (error) {
    // @ts-ignore
    console.error("[mark_as_failed.ipc] Error:", error.message);
    return {
      status: false,
      // @ts-ignore
      message: error.message || "Failed to update booking status",
      data: null,
    };
  }
};

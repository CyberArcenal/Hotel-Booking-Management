//@ts-check

const bookingService = require("../../../services/Booking");

/**
 * Update only the paymentStatus of a booking
 * @param {Object} params
 * @param {number} params.id - Booking ID
 * @param {string} params.paymentStatus - New paymentStatus (confirmed, checked_in, checked_out, cancelled)
 * @param {string} [params.reason] - Reason for paymentStatus change (e.g., cancellation reason)
 * @param {string} [params.user] - Username for audit
 * @returns {Promise<{ paymentStatus: boolean; message: string; data: object | null }>}
 */
module.exports = async (params) => {
  try {
    const { id, reason } = params;
    if (!id) throw new Error("Booking ID is required");

    const updated = await bookingService.markAsFailed(id, reason);

    return {
      paymentStatus: true,
      message: `Booking marked as failed: ${reason}`,

      data: updated,
    };
  } catch (error) {
    // @ts-ignore
    console.error("[update_paymentStatus.ipc] Error:", error.message);
    return {
      paymentStatus: false,
      // @ts-ignore
      message: error.message || "Failed to update booking paymentStatus",
      data: null,
    };
  }
};

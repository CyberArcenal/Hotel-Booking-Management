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
    const { id, reason = null } = params;
    if (!id) throw new Error("Booking ID is required");

    // @ts-ignore
    const updated = await bookingService.markAsPaid(id, reason);

    return {
      // @ts-ignore
      status: true,
      message: `Booking marked as paid`,

      data: updated,
    };
  } catch (error) {
    // @ts-ignore
    console.error("[mark_as_paid.ipc] Error:", error.message);
    return {
      // @ts-ignore
      status: false,
      // @ts-ignore
      message: error.message || "Failed to mark booking as paid",
      data: null,
    };
  }
};

const bookingService = require("../../../services/Booking");

/**
 * Check out a guest
 * @param {Object} params
 * @param {number} params.id - Booking ID
 * @param {string} [params.notes] - Check-out notes
 * @param {string} [params.user] - Username for audit
 * @returns {Promise<{ status: boolean; message: string; data: object | null }>}
 */
module.exports = async (params) => {
  try {
    const { id, notes, user = "system" } = params;
    if (!id) throw new Error("Booking ID is required");

    const booking = await bookingService.checkOut(id, notes, user);
    return {
      status: true,
      message: "Guest checked out successfully",
      data: booking,
    };
  } catch (error) {
    console.error("[check_out.ipc] Error:", error.message);
    return {
      status: false,
      message: error.message || "Failed to check out guest",
      data: null,
    };
  }
};

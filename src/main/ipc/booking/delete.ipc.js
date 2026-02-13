const bookingService = require("../../../services/Booking");

/**
 * Delete a booking (permanent deletion, usually not recommended)
 * @param {Object} params
 * @param {number} params.id - Booking ID
 * @param {string} [params.user] - Username for audit
 * @returns {Promise<{ status: boolean; message: string; data: null }>}
 */
module.exports = async (params) => {
  try {
    const { id, user = "system" } = params;
    if (!id) throw new Error("Booking ID is required");

    // Use bookingService.cancel? No, this is permanent delete.
    // Since service doesn't have a delete method, we implement via repository.
    const { booking: bookingRepo } = await bookingService.getRepositories();
    const booking = await bookingRepo.findOne({ where: { id } });
    if (!booking) throw new Error(`Booking with ID ${id} not found`);

    await bookingRepo.remove(booking);

    // Log deletion via auditLogger
    const auditLogger = require("../../../utils/auditLogger");
    await auditLogger.logDelete("Booking", id, booking, user);

    return {
      status: true,
      message: "Booking deleted successfully",
      data: null,
    };
  } catch (error) {
    console.error("[delete.ipc] Error:", error.message);
    return {
      status: false,
      message: error.message || "Failed to delete booking",
      data: null,
    };
  }
};

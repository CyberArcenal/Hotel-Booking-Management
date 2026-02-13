const bookingService = require("../../../../services/Booking");

/**
 * Get all bookings for a specific room
 * @param {Object} params
 * @param {number} params.roomId - Room ID
 * @returns {Promise<{ status: boolean; message: string; data: any[] }>}
 */
module.exports = async (params) => {
  try {
    const { roomId } = params;
    if (!roomId) throw new Error("Room ID is required");

    const bookings = await bookingService.findAll({ roomId });
    return {
      status: true,
      message: "Room bookings retrieved successfully",
      data: bookings,
    };
  } catch (error) {
    console.error("[get/by_room.ipc] Error:", error.message);
    return {
      status: false,
      message: error.message || "Failed to retrieve room bookings",
      data: [],
    };
  }
};

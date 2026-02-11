const bookingService = require("../../../../services/booking");

/**
 * Get a summary of bookings (counts, revenue, etc.)
 * @returns {Promise<{ status: boolean; message: string; data: object }>}
 */
module.exports = async () => {
  try {
    const statistics = await bookingService.getStatistics();
    return {
      status: true,
      message: 'Booking summary retrieved successfully',
      data: statistics
    };
  } catch (error) {
    console.error('[get/summary.ipc] Error:', error.message);
    return {
      status: false,
      message: error.message || 'Failed to retrieve booking summary',
      data: {}
    };
  }
};
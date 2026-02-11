const bookingService = require("../../../../services/booking");

/**
 * Get detailed booking statistics (revenue, occupancy, trends)
 * @returns {Promise<{ status: boolean; message: string; data: object }>}
 */
module.exports = async () => {
  try {
    const stats = await bookingService.getStatistics();
    // getOccupancyRates is separate, but we can add it here if needed
    return {
      status: true,
      message: 'Booking statistics retrieved successfully',
      data: stats
    };
  } catch (error) {
    console.error('[get/stats.ipc] Error:', error.message);
    return {
      status: false,
      message: error.message || 'Failed to retrieve booking statistics',
      data: {}
    };
  }
};
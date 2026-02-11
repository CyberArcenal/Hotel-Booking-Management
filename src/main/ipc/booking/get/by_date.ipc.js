
const bookingService = require("../../../../services/booking");

/**
 * Get bookings that fall within a specific date range
 * @param {Object} params
 * @param {string} params.startDate - Start date (YYYY-MM-DD)
 * @param {string} params.endDate - End date (YYYY-MM-DD)
 * @returns {Promise<{ status: boolean; message: string; data: any[] }>}
 */
module.exports = async (params) => {
  try {
    const { startDate, endDate } = params;
    if (!startDate || !endDate) {
      throw new Error('startDate and endDate are required');
    }

    // Use findAll with date filters
    const bookings = await bookingService.findAll({
      checkInDate: startDate,
      checkOutDate: endDate
    });
    return {
      status: true,
      message: 'Bookings by date retrieved successfully',
      data: bookings
    };
  } catch (error) {
    console.error('[get/by_date.ipc] Error:', error.message);
    return {
      status: false,
      message: error.message || 'Failed to retrieve bookings by date',
      data: []
    };
  }
};
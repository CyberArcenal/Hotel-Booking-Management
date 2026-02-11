

const bookingService = require("../../../../services/booking");

/**
 * Get a single booking by its ID
 * @param {Object} params
 * @param {number} params.id - Booking ID
 * @returns {Promise<{ status: boolean; message: string; data: object | null }>}
 */
module.exports = async (params) => {
  try {
    const { id } = params;
    if (!id) throw new Error('Booking ID is required');

    const booking = await bookingService.findById(id);
    return {
      status: true,
      message: 'Booking retrieved successfully',
      data: booking
    };
  } catch (error) {
    console.error('[get/by_id.ipc] Error:', error.message);
    return {
      status: false,
      message: error.message || 'Failed to retrieve booking',
      data: null
    };
  }
};
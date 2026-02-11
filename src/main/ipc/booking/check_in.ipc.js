const bookingService = require('../../../services/booking');

/**
 * Check in a guest
 * @param {Object} params
 * @param {number} params.id - Booking ID
 * @param {string} [params.user] - Username for audit
 * @returns {Promise<{ status: boolean; message: string; data: object | null }>}
 */
module.exports = async (params) => {
  try {
    const { id, user = 'system' } = params;
    if (!id) throw new Error('Booking ID is required');

    const booking = await bookingService.checkIn(id, user);
    return {
      status: true,
      message: 'Guest checked in successfully',
      data: booking
    };
  } catch (error) {
    console.error('[check_in.ipc] Error:', error.message);
    return {
      status: false,
      message: error.message || 'Failed to check in guest',
      data: null
    };
  }
};
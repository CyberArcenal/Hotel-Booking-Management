// update.ipc.js placeholder
//@ts-check

const bookingService = require("../../../services/Booking");

/**
 * Update an existing booking
 * @param {Object} params
 * @param {number} params.id - Booking ID
 * @param {Object} params.bookingData - Updated fields
 * @param {string} [params.user] - Username for audit
 * @returns {Promise<{ status: boolean; message: string; data: object | null }>}
 */
module.exports = async (params) => {
  try {
    const { id, bookingData, user = 'system' } = params;
    if (!id) throw new Error('Booking ID is required');
    if (!bookingData) throw new Error('Booking data is required');

    const updated = await bookingService.update(id, bookingData, user);
    return {
      status: true,
      message: 'Booking updated successfully',
      data: updated
    };
  } catch (error) {
    // @ts-ignore
    console.error('[update.ipc] Error:', error.message);
    return {
      status: false,
      // @ts-ignore
      message: error.message || 'Failed to update booking',
      data: null
    };
  }
};
const bookingService = require("../../../../services/booking");

/**
 * Get all bookings for a specific guest
 * @param {Object} params
 * @param {number} params.guestId - Guest ID
 * @returns {Promise<{ status: boolean; message: string; data: any[] }>}
 */
module.exports = async (params) => {
  try {
    const { guestId } = params;
    if (!guestId) throw new Error('Guest ID is required');

    const bookings = await bookingService.findAll({ guestId });
    return {
      status: true,
      message: 'Guest bookings retrieved successfully',
      data: bookings
    };
  } catch (error) {
    console.error('[get/by_guest.ipc] Error:', error.message);
    return {
      status: false,
      message: error.message || 'Failed to retrieve guest bookings',
      data: []
    };
  }
};
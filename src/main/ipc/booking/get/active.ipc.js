

const bookingService = require("../../../../services/booking");

/**
 * Get all active bookings (confirmed + checked-in)
 * @returns {Promise<{ status: boolean; message: string; data: any[] }>}
 */
module.exports = async () => {
  try {
    const active = await bookingService.findAll({
      status: ['confirmed', 'checked_in']
    });
    return {
      status: true,
      message: 'Active bookings retrieved successfully',
      data: active
    };
  } catch (error) {
    console.error('[get/active.ipc] Error:', error.message);
    return {
      status: false,
      message: error.message || 'Failed to retrieve active bookings',
      data: []
    };
  }
};
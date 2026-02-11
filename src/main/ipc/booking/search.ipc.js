const bookingService = require('../../../services/booking');

/**
 * Search bookings by guest name, email, or phone
 * @param {Object} params
 * @param {string} params.query - Search query
 * @returns {Promise<{ status: boolean; message: string; data: any[] }>}
 */
module.exports = async (params) => {
  try {
    const { query } = params;
    if (!query) throw new Error('Search query is required');

    const bookings = await bookingService.findAll({ search: query });
    return {
      status: true,
      message: 'Search completed successfully',
      data: bookings
    };
  } catch (error) {
    console.error('[search.ipc] Error:', error.message);
    return {
      status: false,
      message: error.message || 'Failed to search bookings',
      data: []
    };
  }
};
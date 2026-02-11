

const bookingService = require("../../../../services/booking");

/**
 * Get all bookings with optional filtering, sorting, and pagination
 * @param {Object} params - Request parameters
 * @param {string} [params.status] - Filter by booking status
 * @param {number} [params.roomId] - Filter by room ID
 * @param {number} [params.guestId] - Filter by guest ID
 * @param {string} [params.checkInDate] - Filter by check-in date (>=)
 * @param {string} [params.checkOutDate] - Filter by check-out date (<=)
 * @param {string} [params.search] - Search guest name/email/phone
 * @param {string} [params.sortBy='createdAt'] - Sort field
 * @param {string} [params.sortOrder='DESC'] - Sort order (ASC/DESC)
 * @param {number} [params.page] - Page number (1-indexed)
 * @param {number} [params.limit] - Items per page
 * @returns {Promise<{ status: boolean; message: string; data: any[]; pagination?: any }>}
 */
module.exports = async (params) => {
  try {
    const bookings = await bookingService.findAll(params);
    return {
      status: true,
      message: 'Bookings retrieved successfully',
      data: bookings,
      ...(params.page && params.limit && {
        pagination: {
          page: params.page,
          limit: params.limit,
          // totalCount not returned by findAll; can be added if needed
        }
      })
    };
  } catch (error) {
    console.error('[get/all.ipc] Error:', error.message);
    return {
      status: false,
      message: error.message || 'Failed to retrieve bookings',
      data: []
    };
  }
};
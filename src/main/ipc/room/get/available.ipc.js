const roomService = require('../../../../services/Room');

/**
 * Get rooms available for a specific date range.
 * @param {Object} params
 * @param {string} params.checkInDate - Check-in date (YYYY-MM-DD).
 * @param {string} params.checkOutDate - Check-out date (YYYY-MM-DD).
 * @param {Object} [params.filters] - Additional filters (type, minCapacity, maxPrice).
 * @returns {Promise<{status: boolean, message: string, data: import('../../../../entities/Room').Room[] | null}>}
 */
module.exports = async function getAvailableRooms(params) {
  try {
    const { checkInDate, checkOutDate, filters = {} } = params;
    if (!checkInDate || !checkOutDate) {
      throw new Error('Check-in and check-out dates are required');
    }

    await roomService.getRepository();
    const rooms = await roomService.getAvailableRooms(checkInDate, checkOutDate, filters);
    return {
      status: true,
      message: 'Available rooms retrieved successfully',
      data: rooms,
    };
  } catch (error) {
    console.error('[getAvailableRooms]', error.message);
    return {
      status: false,
      message: error.message || 'Failed to retrieve available rooms',
      data: null,
    };
  }
};
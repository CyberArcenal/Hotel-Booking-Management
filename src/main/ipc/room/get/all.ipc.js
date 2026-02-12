

const roomService = require('../../../../services/Room');

/**
 * Retrieve all rooms with optional filtering and sorting.
 * @param {Object} params - Query parameters.
 * @param {string} [params.type] - Filter by room type.
 * @param {number} [params.minCapacity] - Minimum guest capacity.
 * @param {number} [params.maxPrice] - Maximum price per night.
 * @param {boolean} [params.availableOnly] - Show only available rooms.
 * @param {string} [params.status] - Filter by room status (available/occupied/maintenance).
 * @param {string} [params.sortBy] - Field to sort by (e.g., 'roomNumber', 'pricePerNight').
 * @param {string} [params.sortOrder] - Sort order: 'ASC' or 'DESC' (default 'ASC').
 * @returns {Promise<{status: boolean, message: string, data: import('../../../../entities/Room').Room[] | null}>}
 */
module.exports = async function getAllRooms(params = {}) {
  try {
    await roomService.getRepository(); // ensure DB is ready
    const rooms = await roomService.findAll(params);
    return {
      status: true,
      message: 'Rooms retrieved successfully',
      data: rooms,
    };
  } catch (error) {
    console.error('[getAllRooms]', error.message);
    return {
      status: false,
      message: error.message || 'Failed to retrieve rooms',
      data: null,
    };
  }
};
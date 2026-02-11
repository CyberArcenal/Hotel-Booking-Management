const roomService = require('../../../services/Room');

/**
 * Search rooms by a text query (room number, type, or amenities).
 * @param {Object} params
 * @param {string} params.query - Search term.
 * @returns {Promise<{status: boolean, message: string, data: import('../../../../entities/Room').Room[] | null}>}
 */
module.exports = async function searchRooms(params) {
  try {
    if (!params.query || typeof params.query !== 'string') {
      throw new Error('Search query is required and must be a string');
    }

    await roomService.getRepository();
    // Use findAll with a custom condition – simple LIKE emulation.
    // For production, consider a dedicated search method in the service.
    const allRooms = await roomService.findAll();
    const query = params.query.toLowerCase();
    const filtered = allRooms.filter(
      (room) =>
        room.roomNumber.toLowerCase().includes(query) ||
        room.type.toLowerCase().includes(query) ||
        (room.amenities && room.amenities.toLowerCase().includes(query))
    );

    return {
      status: true,
      message: 'Search completed successfully',
      data: filtered,
    };
  } catch (error) {
    console.error('[searchRooms]', error.message);
    return {
      status: false,
      message: error.message || 'Failed to search rooms',
      data: null,
    };
  }
};
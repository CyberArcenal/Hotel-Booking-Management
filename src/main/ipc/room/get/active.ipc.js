

const roomService = require('../../../../services/Room');

/**
 * Retrieve all rooms that are currently marked as available.
 * @returns {Promise<{status: boolean, message: string, data: import('../../../../entities/Room').Room[] | null}>}
 */
module.exports = async function getActiveRooms() {
  try {
    await roomService.getRepository();
    const rooms = await roomService.findAll({ availableOnly: true });
    return {
      status: true,
      message: 'Active rooms retrieved successfully',
      data: rooms,
    };
  } catch (error) {
    console.error('[getActiveRooms]', error.message);
    return {
      status: false,
      message: error.message || 'Failed to retrieve active rooms',
      data: null,
    };
  }
};
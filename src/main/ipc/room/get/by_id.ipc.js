const roomService = require('../../../../services/Room');

/**
 * Fetch a single room by its ID.
 * @param {Object} params
 * @param {number|string} params.id - Room ID (will be converted to number).
 * @returns {Promise<{status: boolean, message: string, data: import('../../../../entities/Room').Room | null}>}
 */
module.exports = async function getRoomById(params) {
  try {
    const id = Number(params.id);
    if (isNaN(id) || id <= 0) {
      throw new Error('Invalid or missing room ID');
    }

    await roomService.getRepository();
    const room = await roomService.findById(id);
    return {
      status: true,
      message: 'Room retrieved successfully',
      data: room,
    };
  } catch (error) {
    console.error('[getRoomById]', error.message);
    return {
      status: false,
      message: error.message || 'Failed to retrieve room',
      data: null,
    };
  }
};
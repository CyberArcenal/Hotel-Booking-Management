const roomService = require('../../../../services/Room');

/**
 * Fetch a single room by its room number.
 * @param {Object} params
 * @param {string} params.roomNumber - Unique room number.
 * @returns {Promise<{status: boolean, message: string, data: import('../../../../entities/Room').Room | null}>}
 */
module.exports = async function getRoomByNumber(params) {
  try {
    if (!params.roomNumber || typeof params.roomNumber !== 'string') {
      throw new Error('Room number is required and must be a string');
    }

    await roomService.getRepository();
    const room = await roomService.findByRoomNumber(params.roomNumber);
    return {
      status: true,
      message: 'Room retrieved successfully',
      data: room,
    };
  } catch (error) {
    console.error('[getRoomByNumber]', error.message);
    return {
      status: false,
      message: error.message || 'Failed to retrieve room',
      data: null,
    };
  }
};
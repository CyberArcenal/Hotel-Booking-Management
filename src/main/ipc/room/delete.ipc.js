// delete.ipc.js placeholder
const roomService = require('../../../services/Room');

/**
 * Delete a room (only if no active bookings).
 * @param {Object} params
 * @param {number|string} params.id - Room ID.
 * @param {string} [params.user] - Username performing the action.
 * @param {import('typeorm').QueryRunner} [queryRunner] - Optional transaction runner.
 * @returns {Promise<{status: boolean, message: string, data: null}>}
 */
module.exports = async function deleteRoom(params, queryRunner) {
  try {
    const { id, user = 'system' } = params;
    const roomId = Number(id);
    if (isNaN(roomId) || roomId <= 0) {
      throw new Error('Valid room ID is required');
    }

    await roomService.getRepository();
    await roomService.delete(roomId, user);
    return {
      status: true,
      message: 'Room deleted successfully',
      data: null,
    };
  } catch (error) {
    console.error('[deleteRoom]', error.message);
    return {
      status: false,
      message: error.message || 'Failed to delete room',
      data: null,
    };
  }
};
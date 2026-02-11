const roomService = require('../../../services/Room');

/**
 * Update the general status of a room (alias for setRoomAvailability).
 * @param {Object} params
 * @param {number|string} params.id - Room ID.
 * @param {boolean} params.isAvailable - New availability status.
 * @param {string} [params.user] - Username performing the action.
 * @param {import('typeorm').QueryRunner} [queryRunner] - Optional transaction runner.
 * @returns {Promise<{status: boolean, message: string, data: import('../../../../entities/Room').Room | null}>}
 */
module.exports = async function updateRoomStatus(params, queryRunner) {
  try {
    const { id, isAvailable, user = 'system' } = params;
    const roomId = Number(id);
    if (isNaN(roomId) || roomId <= 0) {
      throw new Error('Valid room ID is required');
    }
    if (typeof isAvailable !== 'boolean') {
      throw new Error('isAvailable must be a boolean');
    }

    await roomService.getRepository();
    const updated = await roomService.setAvailability(roomId, isAvailable, user);
    return {
      status: true,
      message: `Room status updated to ${isAvailable ? 'available' : 'unavailable'}`,
      data: updated,
    };
  } catch (error) {
    console.error('[updateRoomStatus]', error.message);
    return {
      status: false,
      message: error.message || 'Failed to update room status',
      data: null,
    };
  }
};
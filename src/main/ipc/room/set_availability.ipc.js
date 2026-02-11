const roomService = require('../../../services/Room');

/**
 * Explicitly set room availability (identical to updateRoomStatus).
 * @param {Object} params
 * @param {number|string} params.id - Room ID.
 * @param {boolean} params.isAvailable - Availability flag.
 * @param {string} [params.user] - Username.
 * @param {import('typeorm').QueryRunner} [queryRunner] - Optional transaction runner.
 * @returns {Promise<{status: boolean, message: string, data: import('../../../../entities/Room').Room | null}>}
 */
module.exports = async function setRoomAvailability(params, queryRunner) {
  // Reuse the same logic as updateRoomStatus.
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
      message: `Room availability set to ${isAvailable}`,
      data: updated,
    };
  } catch (error) {
    console.error('[setRoomAvailability]', error.message);
    return {
      status: false,
      message: error.message || 'Failed to set room availability',
      data: null,
    };
  }
};
const roomService = require('../../../services/Room');

/**
 * Update the room status using the exact enum value.
 * Allowed values: "available", "occupied", "maintenance".
 *
 * @param {Object} params
 * @param {number|string} params.id - Room ID.
 * @param {string} params.status - New status (available/occupied/maintenance).
 * @param {string} [params.user] - Username performing the action.
 * @param {import('typeorm').QueryRunner} [queryRunner] - Optional transaction runner.
 * @returns {Promise<{status: boolean, message: string, data: import('../../../../entities/Room').Room | null}>}
 */
module.exports = async function updateRoomStatus(params, queryRunner) {
  try {
    const { id, status, user = 'system' } = params;
    const roomId = Number(id);
    if (isNaN(roomId) || roomId <= 0) {
      throw new Error('Valid room ID is required');
    }
    if (!status || typeof status !== 'string') {
      throw new Error('status must be a string (available/occupied/maintenance)');
    }

    await roomService.getRepository();
    const updated = await roomService.update(roomId, { status }, user);

    return {
      status: true,
      message: `Room status updated to "${status}"`,
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
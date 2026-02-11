// update.ipc.js placeholder
const roomService = require('../../../services/Room');

/**
 * Update an existing room.
 * @param {Object} params
 * @param {number|string} params.id - Room ID.
 * @param {Object} params.updates - Partial room data to update.
 * @param {string} [params.user] - Username performing the action.
 * @param {import('typeorm').QueryRunner} [queryRunner] - Optional transaction runner.
 * @returns {Promise<{status: boolean, message: string, data: import('../../../../entities/Room').Room | null}>}
 */
module.exports = async function updateRoom(params, queryRunner) {
  try {
    const { id, updates, user = 'system' } = params;
    const roomId = Number(id);
    if (isNaN(roomId) || roomId <= 0) {
      throw new Error('Valid room ID is required');
    }
    if (!updates || typeof updates !== 'object') {
      throw new Error('Updates object is required');
    }

    await roomService.getRepository();
    const updated = await roomService.update(roomId, updates, user);
    return {
      status: true,
      message: 'Room updated successfully',
      data: updated,
    };
  } catch (error) {
    console.error('[updateRoom]', error.message);
    return {
      status: false,
      message: error.message || 'Failed to update room',
      data: null,
    };
  }
};
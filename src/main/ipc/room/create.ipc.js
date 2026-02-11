// create.ipc.js placeholder
const roomService = require('../../../services/Room');

/**
 * Create a new room.
 * @param {Object} params
 * @param {Object} params.roomData - Room data matching the Room entity.
 * @param {string} [params.user] - Username performing the action (default 'system').
 * @param {import('typeorm').QueryRunner} [queryRunner] - Optional transaction runner (not used by service yet).
 * @returns {Promise<{status: boolean, message: string, data: import('../../../../entities/Room').Room | null}>}
 */
module.exports = async function createRoom(params, queryRunner) {
  try {
    const { roomData, user = 'system' } = params;
    if (!roomData || typeof roomData !== 'object') {
      throw new Error('Room data is required');
    }

    await roomService.getRepository();
    const newRoom = await roomService.create(roomData, user);
    return {
      status: true,
      message: 'Room created successfully',
      data: newRoom,
    };
  } catch (error) {
    console.error('[createRoom]', error.message);
    return {
      status: false,
      message: error.message || 'Failed to create room',
      data: null,
    };
  }
};
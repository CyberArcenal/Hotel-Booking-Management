// list.ipc.js placeholder
const roomService = require('../../../services/Room');

/**
 * Retrieve all rooms (no filters, simple list).
 * @returns {Promise<{status: boolean, message: string, data: import('../../../../entities/Room').Room[] | null}>}
 */
module.exports = async function listRooms() {
  try {
    await roomService.getRepository();
    const rooms = await roomService.findAll({}); // no filters
    return {
      status: true,
      message: 'Rooms retrieved successfully',
      data: rooms,
    };
  } catch (error) {
    console.error('[listRooms]', error.message);
    return {
      status: false,
      message: error.message || 'Failed to retrieve rooms',
      data: null,
    };
  }
};
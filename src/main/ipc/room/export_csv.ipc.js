const roomService = require('../../../services/Room');

/**
 * Export rooms to CSV format.
 * @param {Object} params
 * @param {Object} [params.filters] - Optional filters (same as findAll).
 * @param {string} [params.user] - Username.
 * @returns {Promise<{status: boolean, message: string, data: {format: string, data: string, filename: string} | null}>}
 */
module.exports = async function exportRoomsToCSV(params) {
  try {
    const { filters = {}, user = 'system' } = params;
    await roomService.getRepository();
    const exportResult = await roomService.exportRooms('csv', filters, user);
    return {
      status: true,
      message: 'Rooms exported to CSV successfully',
      data: exportResult,
    };
  } catch (error) {
    console.error('[exportRoomsToCSV]', error.message);
    return {
      status: false,
      message: error.message || 'Failed to export rooms to CSV',
      data: null,
    };
  }
};
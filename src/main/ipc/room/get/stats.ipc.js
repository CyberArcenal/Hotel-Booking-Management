const roomService = require('../../../../services/Room');

/**
 * Get comprehensive room statistics.
 * @returns {Promise<{status: boolean, message: string, data: Object | null}>}
 */
module.exports = async function getRoomStats() {
  try {
    await roomService.getRepository();
    const stats = await roomService.getStatistics();
    return {
      status: true,
      message: 'Room statistics retrieved successfully',
      data: stats,
    };
  } catch (error) {
    console.error('[getRoomStats]', error.message);
    return {
      status: false,
      message: error.message || 'Failed to retrieve room statistics',
      data: null,
    };
  }
};
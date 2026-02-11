const roomService = require('../../../services/Room');

/**
 * Get distribution of rooms by type.
 * @returns {Promise<{status: boolean, message: string, data: Array<{type: string, count: number}> | null}>}
 */
module.exports = async function getRoomTypeDistribution() {
  try {
    await roomService.getRepository();
    const stats = await roomService.getStatistics();
    return {
      status: true,
      message: 'Room type distribution retrieved successfully',
      data: stats.typeDistribution || [],
    };
  } catch (error) {
    console.error('[getRoomTypeDistribution]', error.message);
    return {
      status: false,
      message: error.message || 'Failed to retrieve room type distribution',
      data: null,
    };
  }
};
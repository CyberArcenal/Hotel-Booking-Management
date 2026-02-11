const roomService = require('../../../../services/Room');

/**
 * Get a lightweight summary of room statistics.
 * @returns {Promise<{status: boolean, message: string, data: Object | null}>}
 */
module.exports = async function getRoomSummary() {
  try {
    await roomService.getRepository();
    const stats = await roomService.getStatistics();
    const summary = {
      totalRooms: stats.totalRooms,
      availableRooms: stats.availableRooms,
      occupiedRooms: stats.occupiedRooms,
      occupancyRate: stats.occupancyRate,
    };
    return {
      status: true,
      message: 'Room summary retrieved successfully',
      data: summary,
    };
  } catch (error) {
    console.error('[getRoomSummary]', error.message);
    return {
      status: false,
      message: error.message || 'Failed to retrieve room summary',
      data: null,
    };
  }
};
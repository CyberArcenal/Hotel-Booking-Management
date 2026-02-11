const roomService = require('../../../services/Room');

/**
 * Get current room occupancy statistics.
 * @returns {Promise<{status: boolean, message: string, data: Object | null}>}
 */
module.exports = async function getRoomOccupancy() {
  try {
    await roomService.getRepository();
    const stats = await roomService.getStatistics();
    const occupancy = {
      totalRooms: stats.totalRooms,
      availableRooms: stats.availableRooms,
      occupiedRooms: stats.occupiedRooms,
      occupancyRate: stats.occupancyRate,
    };
    return {
      status: true,
      message: 'Occupancy data retrieved successfully',
      data: occupancy,
    };
  } catch (error) {
    console.error('[getRoomOccupancy]', error.message);
    return {
      status: false,
      message: error.message || 'Failed to retrieve occupancy',
      data: null,
    };
  }
};
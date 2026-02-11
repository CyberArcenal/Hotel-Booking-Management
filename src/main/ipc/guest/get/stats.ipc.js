// src/main/ipc/guest/get/stats.ipc.js
const guestService = require("../../../../services/Guest");

/**
 * @returns {Promise<{status: boolean, message: string, data: any}>}
 */
module.exports = async function getGuestStats() {
  try {
    const stats = await guestService.getStatistics();
    return {
      status: true,
      message: 'Guest statistics retrieved',
      data: stats
    };
  } catch (error) {
    console.error('[getGuestStats]', error.message);
    return {
      status: false,
      message: error.message || 'Failed to retrieve guest statistics',
      data: null
    };
  }
};
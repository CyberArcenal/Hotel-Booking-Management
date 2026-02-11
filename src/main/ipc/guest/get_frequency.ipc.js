// src/main/ipc/guest/get_frequency.ipc.js
const guestService = require('../../../services/Guest');

/**
 * @returns {Promise<{status: boolean, message: string, data: any}>}
 */
module.exports = async function getGuestFrequency() {
  try {
    const stats = await guestService.getStatistics();
    return {
      status: true,
      message: 'Guest booking frequency retrieved',
      data: stats.bookingFrequency || { distribution: {}, average: 0 }
    };
  } catch (error) {
    console.error('[getGuestFrequency]', error.message);
    return {
      status: false,
      message: error.message || 'Failed to retrieve guest frequency',
      data: null
    };
  }
};
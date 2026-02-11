// src/main/ipc/guest/get/summary.ipc.js
const guestService = require("../../../../services/Guest");

/**
 * @typedef {Object} GuestSummary
 * @property {number} totalGuests
 * @property {number} activeGuests
 * @property {number} newThisMonth
 * @property {Array} recentGuests
 */

/**
 * @returns {Promise<{status: boolean, message: string, data: GuestSummary | null}>}
 */
module.exports = async function getGuestSummary() {
  try {
    // Get statistics for totals and new guests
    const stats = await guestService.getStatistics();
    
    // Get recent 5 guests
    const recent = await guestService.search({
      sortBy: 'createdAt',
      sortOrder: 'DESC',
      page: 1,
      limit: 5
    });

    const summary = {
      totalGuests: stats.totalGuests || 0,
      activeGuests: stats.guestsWithBookings || 0, // active = have at least one booking
      newThisMonth: stats.newGuestsThisMonth || 0,
      recentGuests: recent.guests || []
    };

    return {
      status: true,
      message: 'Guest summary retrieved',
      data: summary
    };
  } catch (error) {
    console.error('[getGuestSummary]', error.message);
    return {
      status: false,
      message: error.message || 'Failed to retrieve guest summary',
      data: null
    };
  }
};
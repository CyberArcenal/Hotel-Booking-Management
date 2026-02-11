
const guestService = require("../../../../services/Guest");

/**
 * @typedef {Object} GetActiveGuestsParams
 * @property {number} [page=1]
 * @property {number} [limit=20]
 */

/**
 * @param {GetActiveGuestsParams} params
 * @returns {Promise<{status: boolean, message: string, data: any}>}
 */
module.exports = async function getActiveGuests(params = {}) {
  try {
    const { page = 1, limit = 20 } = params;

    // Use search with custom criteria for active bookings
    const result = await guestService.search({
      hasBookings: true,
      page,
      limit,
      sortBy: 'lastVisit',
      sortOrder: 'DESC'
    });

    // Additional client-side filtering for active bookings status
    // (server-side would be better; here we rely on the service's search)
    const activeGuests = result.guests.filter(guest => 
      guest.activeBookings > 0
    );

    return {
      status: true,
      message: 'Active guests retrieved',
      data: {
        guests: activeGuests,
        total: activeGuests.length,
        page,
        limit
      }
    };
  } catch (error) {
    console.error('[getActiveGuests]', error.message);
    return {
      status: false,
      message: error.message || 'Failed to retrieve active guests',
      data: null
    };
  }
};
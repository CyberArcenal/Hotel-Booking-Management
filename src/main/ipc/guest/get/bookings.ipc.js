// src/main/ipc/guest/get/bookings.ipc.js
const guestService = require("../../../../services/Guest");

/**
 * @typedef {Object} GetGuestBookingsParams
 * @property {number} guestId
 * @property {Object} [options]
 * @property {string} [options.status]
 * @property {Date} [options.fromDate]
 * @property {Date} [options.toDate]
 * @property {string} [options.sortBy]
 * @property {string} [options.sortOrder]
 * @property {number} [options.page]
 * @property {number} [options.limit]
 */

/**
 * @param {GetGuestBookingsParams} params
 * @returns {Promise<{status: boolean, message: string, data: any}>}
 */
module.exports = async function getGuestBookings(params) {
  try {
    const { guestId, options = {} } = params;
    if (!guestId) throw new Error('Guest ID is required');

    const history = await guestService.getBookingHistory(guestId, options);
    return {
      status: true,
      message: 'Booking history retrieved',
      data: history
    };
  } catch (error) {
    console.error('[getGuestBookings]', error.message);
    return {
      status: false,
      message: error.message || 'Failed to retrieve booking history',
      data: null
    };
  }
};
// src/main/ipc/guest/get/by_id.ipc.js
const guestService = require("../../../../services/Guest");

/**
 * @typedef {Object} GetGuestByIdParams
 * @property {number} id
 * @property {boolean} [includeBookings=true]
 */

/**
 * @param {GetGuestByIdParams} params
 * @returns {Promise<{status: boolean, message: string, data: any}>}
 */
module.exports = async function getGuestById(params) {
  try {
    const { id, includeBookings = true } = params;
    if (!id) throw new Error('Guest ID is required');

    const guest = await guestService.findById(id, includeBookings);
    return {
      status: true,
      message: 'Guest retrieved successfully',
      data: guest
    };
  } catch (error) {
    console.error('[getGuestById]', error.message);
    return {
      status: false,
      message: error.message || 'Failed to retrieve guest',
      data: null
    };
  }
};
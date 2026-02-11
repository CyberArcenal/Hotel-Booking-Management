// src/main/ipc/guest/get/by_email.ipc.js
const guestService = require("../../../../services/Guest");

/**
 * @typedef {Object} GetGuestByEmailParams
 * @property {string} email
 * @property {boolean} [includeBookings=false]
 */

/**
 * @param {GetGuestByEmailParams} params
 * @returns {Promise<{status: boolean, message: string, data: any}>}
 */
module.exports = async function getGuestByEmail(params) {
  try {
    const { email, includeBookings = false } = params;
    if (!email) throw new Error('Email is required');

    const guest = await guestService.findByEmail(email, includeBookings);
    return {
      status: true,
      message: 'Guest retrieved successfully',
      data: guest
    };
  } catch (error) {
    console.error('[getGuestByEmail]', error.message);
    return {
      status: false,
      message: error.message || 'Failed to retrieve guest by email',
      data: null
    };
  }
};
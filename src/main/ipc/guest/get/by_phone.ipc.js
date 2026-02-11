// src/main/ipc/guest/get/by_phone.ipc.js
const guestService = require("../../../../services/Guest");

/**
 * @typedef {Object} GetGuestByPhoneParams
 * @property {string} phone
 */

/**
 * @param {GetGuestByPhoneParams} params
 * @returns {Promise<{status: boolean, message: string, data: any}>}
 */
module.exports = async function getGuestByPhone(params) {
  try {
    const { phone } = params;
    if (!phone) throw new Error('Phone number is required');

    // Use search with exact phone match
    const result = await guestService.search({ phone, page: 1, limit: 1 });
    const guest = result.guests?.[0] || null;

    return {
      status: true,
      message: guest ? 'Guest retrieved successfully' : 'No guest found with that phone number',
      data: guest
    };
  } catch (error) {
    console.error('[getGuestByPhone]', error.message);
    return {
      status: false,
      message: error.message || 'Failed to retrieve guest by phone',
      data: null
    };
  }
};
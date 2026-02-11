// src/main/ipc/guest/get_loyalty.ipc.js
const guestService = require('../../../services/Guest');

/**
 * @typedef {Object} GetLoyaltyParams
 * @property {number} [minBookings=3]
 * @property {number} [minSpent=10000]
 */

/**
 * @param {GetLoyaltyParams} params
 * @returns {Promise<{status: boolean, message: string, data: any}>}
 */
module.exports = async function getGuestLoyalty(params = {}) {
  try {
    const { minBookings = 3, minSpent = 10000 } = params;
    const vipGuests = await guestService.getVIPGuests({ minBookings, minSpent });
    return {
      status: true,
      message: 'VIP guests retrieved',
      data: vipGuests
    };
  } catch (error) {
    console.error('[getGuestLoyalty]', error.message);
    return {
      status: false,
      message: error.message || 'Failed to retrieve VIP guests',
      data: null
    };
  }
};
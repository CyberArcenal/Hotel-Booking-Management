// src/main/ipc/guest/get/all.ipc.js
const guestService = require("../../../../services/Guest");

/**
 * @typedef {Object} GetAllGuestsParams
 * @property {Object} [filters] - Optional filters (passed to findAll)
 */

/**
 * Get all guests (with optional filters)
 * @param {GetAllGuestsParams} params
 * @returns {Promise<{status: boolean, message: string, data: any}>}
 */
module.exports = async function getAllGuests(params = {}) {
  try {
    const guests = await guestService.findAll(params.filters || {});
    return {
      status: true,
      message: 'Guests retrieved successfully',
      data: guests
    };
  } catch (error) {
    console.error('[getAllGuests]', error.message);
    return {
      status: false,
      message: error.message || 'Failed to retrieve guests',
      data: null
    };
  }
};
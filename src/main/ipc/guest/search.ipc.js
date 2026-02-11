// src/main/ipc/guest/search.ipc.js

const guestService = require('../../../services/Guest');


/**
 * @typedef {import('../../../services/Guest').SearchCriteria} SearchCriteria
 */

/**
 * @param {SearchCriteria} params
 * @returns {Promise<{status: boolean, message: string, data: any}>}
 */
module.exports = async function searchGuests(params) {
  try {
    const result = await guestService.search(params);
    return {
      status: true,
      message: 'Search completed',
      data: result
    };
  } catch (error) {
    console.error('[searchGuests]', error.message);
    return {
      status: false,
      message: error.message || 'Search failed',
      data: null
    };
  }
};
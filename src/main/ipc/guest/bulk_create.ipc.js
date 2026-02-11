// src/main/ipc/guest/bulk_create.ipc.js
const guestService = require('../../../services/Guest');

/**
 * @typedef {Object} BulkCreateGuestsParams
 * @property {Array<Object>} guests
 * @property {string} [user='system']
 */

/**
 * @param {BulkCreateGuestsParams} params
 * @param {import('typeorm').QueryRunner} [queryRunner]
 * @returns {Promise<{status: boolean, message: string, data: any}>}
 */
module.exports = async function bulkCreateGuests(params, queryRunner) {
  try {
    const { guests, user = 'system' } = params;
    if (!Array.isArray(guests) || guests.length === 0) {
      throw new Error('Guests array is required and must not be empty');
    }

    const created = [];
    const errors = [];

    for (const guestData of guests) {
      try {
        const newGuest = await guestService.create(guestData, user);
        created.push(newGuest);
      } catch (err) {
        errors.push({ guestData, error: err.message });
      }
    }

    return {
      status: errors.length === 0,
      message: `Created ${created.length} guests, ${errors.length} failed`,
      data: { created, errors }
    };
  } catch (error) {
    console.error('[bulkCreateGuests]', error.message);
    return {
      status: false,
      message: error.message || 'Bulk create failed',
      data: null
    };
  }
};
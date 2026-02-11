// src/main/ipc/guest/bulk_update.ipc.js
const guestService = require('../../../services/Guest');

/**
 * @typedef {Object} BulkUpdateGuestsParams
 * @property {Array<{id: number, data: Object}>} updates
 * @property {string} [user='system']
 */

/**
 * @param {BulkUpdateGuestsParams} params
 * @param {import('typeorm').QueryRunner} [queryRunner]
 * @returns {Promise<{status: boolean, message: string, data: any}>}
 */
module.exports = async function bulkUpdateGuests(params, queryRunner) {
  try {
    const { updates, user = 'system' } = params;
    if (!Array.isArray(updates) || updates.length === 0) {
      throw new Error('Updates array is required');
    }

    const updated = [];
    const errors = [];

    for (const { id, data } of updates) {
      try {
        const updatedGuest = await guestService.update(id, data, user);
        updated.push(updatedGuest);
      } catch (err) {
        errors.push({ id, error: err.message });
      }
    }

    return {
      status: errors.length === 0,
      message: `Updated ${updated.length} guests, ${errors.length} failed`,
      data: { updated, errors }
    };
  } catch (error) {
    console.error('[bulkUpdateGuests]', error.message);
    return {
      status: false,
      message: error.message || 'Bulk update failed',
      data: null
    };
  }
};
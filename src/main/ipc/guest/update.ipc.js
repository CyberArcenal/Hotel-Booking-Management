// src/main/ipc/guest/update.ipc.js
const guestService = require('../../../services/Guest');

/**
 * @typedef {Object} UpdateGuestParams
 * @property {number} id
 * @property {Object} guestData
 * @property {string} [user='system']
 */

/**
 * @param {UpdateGuestParams} params
 * @param {import('typeorm').QueryRunner} [queryRunner]
 * @returns {Promise<{status: boolean, message: string, data: any}>}
 */
module.exports = async function updateGuest(params, queryRunner) {
  try {
    const { id, guestData, user = 'system' } = params;
    if (!id) throw new Error('Guest ID is required');
    if (!guestData) throw new Error('Guest data is required');

    const updated = await guestService.update(id, guestData, user);
    return {
      status: true,
      message: 'Guest updated successfully',
      data: updated
    };
  } catch (error) {
    console.error('[updateGuest]', error.message);
    return {
      status: false,
      message: error.message || 'Failed to update guest',
      data: null
    };
  }
};
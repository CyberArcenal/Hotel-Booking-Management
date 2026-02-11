// src/main/ipc/guest/delete.ipc.js
const guestService = require('../../../services/Guest');

/**
 * @typedef {Object} DeleteGuestParams
 * @property {number} id
 * @property {string} [user='system']
 */

/**
 * @param {DeleteGuestParams} params
 * @param {import('typeorm').QueryRunner} [queryRunner]
 * @returns {Promise<{status: boolean, message: string, data: any}>}
 */
module.exports = async function deleteGuest(params, queryRunner) {
  try {
    const { id, user = 'system' } = params;
    if (!id) throw new Error('Guest ID is required');

    const success = await guestService.delete(id, user);
    return {
      status: success,
      message: success ? 'Guest deleted successfully' : 'Failed to delete guest',
      data: { deleted: success }
    };
  } catch (error) {
    console.error('[deleteGuest]', error.message);
    return {
      status: false,
      message: error.message || 'Failed to delete guest',
      data: null
    };
  }
};
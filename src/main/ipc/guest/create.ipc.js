// src/main/ipc/guest/create.ipc.js
const guestService = require('../../../services/Guest');

/**
 * @typedef {Object} CreateGuestParams
 * @property {Object} guestData
 * @property {string} guestData.fullName
 * @property {string} guestData.email
 * @property {string} guestData.phone
 * @property {string} [guestData.address]
 * @property {string} [guestData.idNumber]
 * @property {string} [user='system']
 */

/**
 * Transactional handler – receives queryRunner but service doesn't use it yet.
 * @param {CreateGuestParams} params
 * @param {import('typeorm').QueryRunner} [queryRunner] - unused, kept for compatibility
 * @returns {Promise<{status: boolean, message: string, data: any}>}
 */
module.exports = async function createGuest(params, queryRunner) {
  try {
    const { guestData, user = 'system' } = params;
    if (!guestData) throw new Error('Guest data is required');

    const newGuest = await guestService.create(guestData, user);
    return {
      status: true,
      message: 'Guest created successfully',
      data: newGuest
    };
  } catch (error) {
    console.error('[createGuest]', error.message);
    return {
      status: false,
      message: error.message || 'Failed to create guest',
      data: null
    };
  }
};
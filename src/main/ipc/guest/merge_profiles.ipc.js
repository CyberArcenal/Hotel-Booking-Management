// src/main/ipc/guest/merge_profiles.ipc.js
const guestService = require('../../../services/Guest');

/**
 * @typedef {Object} MergeGuestProfilesParams
 * @property {number[]} guestIds
 * @property {Object} [masterData]
 * @property {string} [user='system']
 */

/**
 * @param {MergeGuestProfilesParams} params
 * @param {import('typeorm').QueryRunner} [queryRunner]
 * @returns {Promise<{status: boolean, message: string, data: any}>}
 */
module.exports = async function mergeGuestProfiles(params, queryRunner) {
  try {
    const { guestIds, masterData = {}, user = 'system' } = params;
    if (!guestIds || guestIds.length < 2) {
      throw new Error('At least two guest IDs are required for merging');
    }

    const result = await guestService.mergeGuests(guestIds, masterData, user);
    return {
      status: true,
      message: 'Guest profiles merged successfully',
      data: result
    };
  } catch (error) {
    console.error('[mergeGuestProfiles]', error.message);
    return {
      status: false,
      message: error.message || 'Failed to merge guest profiles',
      data: null
    };
  }
};
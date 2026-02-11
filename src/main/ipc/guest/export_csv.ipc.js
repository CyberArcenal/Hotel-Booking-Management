// src/main/ipc/guest/export_csv.ipc.js
const guestService = require('../../../services/Guest');

/**
 * @typedef {Object} ExportGuestsToCSVParams
 * @property {Object} [filters]
 * @property {string} [user='system']
 */

/**
 * @param {ExportGuestsToCSVParams} params
 * @returns {Promise<{status: boolean, message: string, data: any}>}
 */
module.exports = async function exportGuestsToCSV(params = {}) {
  try {
    const { filters = {}, user = 'system' } = params;
    const exportData = await guestService.exportGuests('csv', filters, user);
    return {
      status: true,
      message: 'Guests exported to CSV',
      data: exportData
    };
  } catch (error) {
    console.error('[exportGuestsToCSV]', error.message);
    return {
      status: false,
      message: error.message || 'CSV export failed',
      data: null
    };
  }
};
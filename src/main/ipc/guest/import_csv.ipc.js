// src/main/ipc/guest/import_csv.ipc.js
const guestService = require('../../../services/Guest');

/**
 * Very basic CSV import – assumes first row is header.
 * For production, use a robust CSV parser (e.g., csv-parse).
 *
 * @typedef {Object} ImportGuestsFromCSVParams
 * @property {string} csvData - Raw CSV string
 * @property {string} [user='system']
 */

/**
 * @param {ImportGuestsFromCSVParams} params
 * @param {import('typeorm').QueryRunner} [queryRunner]
 * @returns {Promise<{status: boolean, message: string, data: any}>}
 */
module.exports = async function importGuestsFromCSV(params, queryRunner) {
  try {
    const { csvData, user = 'system' } = params;
    if (!csvData) throw new Error('CSV data is required');

    const lines = csvData.trim().split('\n');
    if (lines.length < 2) throw new Error('CSV must contain header + at least one row');

    const headers = lines[0].split(',').map(h => h.trim());
    const required = ['fullName', 'email', 'phone'];
    const missing = required.filter(r => !headers.includes(r));
    if (missing.length) {
      throw new Error(`Missing required columns: ${missing.join(', ')}`);
    }

    const guests = [];
    const errors = [];

    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(',').map(v => v.trim());
      if (row.length !== headers.length) continue;

      const guestData = headers.reduce((obj, header, idx) => {
        obj[header] = row[idx];
        return obj;
      }, {});

      try {
        const newGuest = await guestService.create(guestData, user);
        guests.push(newGuest);
      } catch (err) {
        errors.push({ row: i + 1, data: guestData, error: err.message });
      }
    }

    return {
      status: errors.length === 0,
      message: `Imported ${guests.length} guests, ${errors.length} failed`,
      data: { imported: guests, errors }
    };
  } catch (error) {
    console.error('[importGuestsFromCSV]', error.message);
    return {
      status: false,
      message: error.message || 'CSV import failed',
      data: null
    };
  }
};
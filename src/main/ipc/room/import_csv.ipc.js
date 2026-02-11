const roomService = require('../../../services/Room');

/**
 * Import rooms from a CSV string.
 * Expected CSV headers: roomNumber, type, capacity, pricePerNight, isAvailable, amenities
 * @param {Object} params
 * @param {string} params.csvData - Raw CSV string.
 * @param {string} [params.user] - Username.
 * @param {import('typeorm').QueryRunner} [queryRunner] - Optional transaction runner.
 * @returns {Promise<{status: boolean, message: string, data: {imported: number, failed: Array}}>}
 */
module.exports = async function importRoomsFromCSV(params, queryRunner) {
  try {
    const { csvData, user = 'system' } = params;
    if (!csvData || typeof csvData !== 'string') {
      throw new Error('CSV data is required');
    }

    await roomService.getRepository();

    // Simple CSV parser (assumes first line is header, comma separated).
    const lines = csvData.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV must contain at least a header and one data row');
    }

    const headers = lines[0].split(',').map(h => h.trim());
    const expectedHeaders = ['roomNumber', 'type', 'capacity', 'pricePerNight', 'isAvailable', 'amenities'];
    // Optional: validate headers.

    const results = { imported: 0, failed: [] };

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const values = line.split(',').map(v => v.trim());
      const roomData = {};
      headers.forEach((header, idx) => {
        roomData[header] = values[idx];
      });

      // Basic type conversion.
      if (roomData.capacity) roomData.capacity = parseInt(roomData.capacity, 10);
      if (roomData.pricePerNight) roomData.pricePerNight = parseFloat(roomData.pricePerNight);
      if (roomData.isAvailable !== undefined) {
        roomData.isAvailable = roomData.isAvailable.toLowerCase() === 'true';
      }

      try {
        const newRoom = await roomService.create(roomData, user);
        results.imported++;
      } catch (err) {
        results.failed.push({ row: i + 1, data: roomData, error: err.message });
      }
    }

    return {
      status: true,
      message: `CSV import finished: ${results.imported} imported, ${results.failed.length} failed`,
      data: results,
    };
  } catch (error) {
    console.error('[importRoomsFromCSV]', error.message);
    return {
      status: false,
      message: error.message || 'Failed to import rooms from CSV',
      data: null,
    };
  }
};
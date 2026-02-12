const roomService = require('../../../services/Room');

/**
 * Import rooms from a CSV string.
 * Expected CSV headers (case‑sensitive): roomNumber, type, capacity, pricePerNight, [status|isAvailable], amenities
 * - If both "status" and "isAvailable" are present, "status" wins.
 * - "status" must be one of: available, occupied, maintenance.
 * - "isAvailable" (true/false) is converted to status (true → available, false → occupied).
 *
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

    const lines = csvData.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV must contain at least a header and one data row');
    }

    const headers = lines[0].split(',').map(h => h.trim());
    const results = { imported: 0, failed: [] };

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(',').map(v => v.trim());
      const roomData = {};
      headers.forEach((header, idx) => {
        roomData[header] = values[idx];
      });

      // ----- Type conversions -----
      if (roomData.capacity) roomData.capacity = parseInt(roomData.capacity, 10);
      if (roomData.pricePerNight) roomData.pricePerNight = parseFloat(roomData.pricePerNight);

      // ----- Handle status vs isAvailable -----
      if (roomData.status !== undefined && roomData.status !== '') {
        // status column present – use as is (service will validate)
        // no conversion needed
      } else if (roomData.isAvailable !== undefined && roomData.isAvailable !== '') {
        // legacy isAvailable column – convert to boolean then to status
        const isAvail = roomData.isAvailable.toLowerCase() === 'true';
        roomData.status = isAvail ? 'available' : 'occupied';
      }
      // If neither column exists, the service will use the default ('available')

      // Remove isAvailable if present to avoid confusion (service derives it from status)
      delete roomData.isAvailable;

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
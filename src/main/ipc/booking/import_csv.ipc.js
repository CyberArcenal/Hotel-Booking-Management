
const fs = require('fs').promises;
const path = require('path');
const csv = require('csv-parse/sync'); // you may need to install this package
const bookingService = require('../../../services/booking');

/**
 * Import bookings from a CSV file
 * @param {Object} params
 * @param {string} params.filePath - Absolute path to CSV file
 * @param {string} [params.user] - Username for audit
 * @returns {Promise<{ status: boolean; message: string; data: { imported: number; failed: number; errors: any[] } }>}
 */
module.exports = async (params) => {
  try {
    const { filePath, user = 'system' } = params;
    if (!filePath) throw new Error('File path is required');

    const fileContent = await fs.readFile(filePath, 'utf-8');
    const records = csv.parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    const results = {
      imported: 0,
      failed: 0,
      errors: []
    };

    for (const record of records) {
      try {
        // Transform CSV record into bookingData structure
        const bookingData = {
          checkInDate: record.checkInDate || record.check_in_date,
          checkOutDate: record.checkOutDate || record.check_out_date,
          numberOfGuests: parseInt(record.numberOfGuests || record.guests || 1),
          roomId: parseInt(record.roomId || record.room_id),
          guestData: {
            fullName: record.guestName || record.full_name,
            email: record.email,
            phone: record.phone,
            address: record.address,
            idNumber: record.idNumber || record.id_number
          },
          specialRequests: record.specialRequests || record.special_requests || null
        };

        await bookingService.create(bookingData, user);
        results.imported++;
      } catch (err) {
        results.failed++;
        results.errors.push({
          record,
          error: err.message
        });
      }
    }

    return {
      status: true,
      message: `CSV import completed: ${results.imported} imported, ${results.failed} failed`,
      data: results
    };
  } catch (error) {
    console.error('[import_csv.ipc] Error:', error.message);
    return {
      status: false,
      message: error.message || 'Failed to import CSV',
      data: { imported: 0, failed: 0, errors: [] }
    };
  }
};
const bookingService = require('../../../services/booking');
const fs = require('fs').promises;
const path = require('path');

/**
 * Export bookings to CSV file
 * @param {Object} params
 * @param {string} params.filePath - Destination file path
 * @param {Object} [params.filters] - Filter options for findAll
 * @param {string} [params.user] - Username for audit
 * @returns {Promise<{ status: boolean; message: string; data: { filePath: string; count: number } }>}
 */
module.exports = async (params) => {
  try {
    const { filePath, filters = {}, user = 'system' } = params;
    if (!filePath) throw new Error('File path is required');

    const exportData = await bookingService.exportBookings('csv', filters, user);
    
    // Write CSV content to file
    await fs.writeFile(filePath, exportData.data, 'utf-8');

    return {
      status: true,
      message: `Exported ${exportData.data.split('\n').length - 1} bookings to CSV`,
      data: {
        filePath,
        count: exportData.data.split('\n').length - 1 // subtract header
      }
    };
  } catch (error) {
    console.error('[export_csv.ipc] Error:', error.message);
    return {
      status: false,
      message: error.message || 'Failed to export CSV',
      data: null
    };
  }
};
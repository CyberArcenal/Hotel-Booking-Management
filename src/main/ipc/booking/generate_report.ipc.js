const bookingService = require('../../../services/booking');

/**
 * Generate a custom booking report
 * @param {Object} params
 * @param {string} params.reportType - 'summary', 'detailed', 'revenue', 'occupancy'
 * @param {string} params.startDate - Start date (YYYY-MM-DD)
 * @param {string} params.endDate - End date (YYYY-MM-DD)
 * @param {string} [params.format='json'] - Output format (json, csv)
 * @returns {Promise<{ status: boolean; message: string; data: object | string }>}
 */
module.exports = async (params) => {
  try {
    const { reportType, startDate, endDate, format = 'json' } = params;
    if (!reportType) throw new Error('Report type is required');
    if (!startDate || !endDate) throw new Error('Start date and end date are required');

    let reportData;
    const filters = { startDate, endDate };

    switch (reportType) {
      case 'summary':
        reportData = await bookingService.getStatistics();
        break;
      case 'detailed':
        reportData = await bookingService.findAll({ 
          checkInDate: startDate, 
          checkOutDate: endDate 
        });
        break;
      case 'revenue':
        const stats = await bookingService.getStatistics();
        reportData = { revenue: stats.revenue, monthlyTrends: stats.monthlyTrends };
        break;
      case 'occupancy':
        // Use the occupancy handler logic
        const occupancyHandler = require('./get_occupancy_rates.ipc');
        const occupancyResult = await occupancyHandler({ startDate, endDate });
        reportData = occupancyResult.data;
        break;
      default:
        throw new Error(`Unsupported report type: ${reportType}`);
    }

    if (format === 'csv') {
      // Convert to CSV (simple implementation)
      const { Parser } = require('json2csv');
      const parser = new Parser();
      const csv = parser.parse(reportData);
      return {
        status: true,
        message: 'Report generated in CSV format',
        data: csv
      };
    }

    return {
      status: true,
      message: 'Report generated successfully',
      data: reportData
    };
  } catch (error) {
    console.error('[generate_report.ipc] Error:', error.message);
    return {
      status: false,
      message: error.message || 'Failed to generate report',
      data: null
    };
  }
};
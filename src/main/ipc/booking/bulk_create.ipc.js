
const bookingService = require('../../../services/booking');
const auditLogger = require('../../../utils/auditLogger');

/**
 * Create multiple bookings at once
 * @param {Object} params
 * @param {Array<Object>} params.bookings - Array of booking objects
 * @param {string} [params.user] - Username for audit
 * @returns {Promise<{ status: boolean; message: string; data: { created: number; failed: number; errors: any[] } }>}
 */
module.exports = async (params) => {
  try {
    const { bookings, user = 'system' } = params;
    if (!Array.isArray(bookings) || bookings.length === 0) {
      throw new Error('Bookings array is required and must not be empty');
    }

    const results = {
      created: 0,
      failed: 0,
      errors: []
    };

    for (const bookingData of bookings) {
      try {
        await bookingService.create(bookingData, user);
        results.created++;
      } catch (err) {
        results.failed++;
        results.errors.push({
          bookingData,
          error: err.message
        });
      }
    }

    return {
      status: true,
      message: `Bulk create completed: ${results.created} created, ${results.failed} failed`,
      data: results
    };
  } catch (error) {
    console.error('[bulk_create.ipc] Error:', error.message);
    return {
      status: false,
      message: error.message || 'Failed to bulk create bookings',
      data: { created: 0, failed: 0, errors: [] }
    };
  }
};
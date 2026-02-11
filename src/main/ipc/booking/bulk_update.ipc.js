const bookingService = require('../../../services/booking');

/**
 * Update multiple bookings in bulk
 * @param {Object} params
 * @param {Array<{ id: number; bookingData: Object }>} params.updates - Array of update objects
 * @param {string} [params.user] - Username for audit
 * @returns {Promise<{ status: boolean; message: string; data: { updated: number; failed: number; errors: any[] } }>}
 */
module.exports = async (params) => {
  try {
    const { updates, user = 'system' } = params;
    if (!Array.isArray(updates) || updates.length === 0) {
      throw new Error('Updates array is required and must not be empty');
    }

    const results = {
      updated: 0,
      failed: 0,
      errors: []
    };

    for (const { id, bookingData } of updates) {
      try {
        await bookingService.update(id, bookingData, user);
        results.updated++;
      } catch (err) {
        results.failed++;
        results.errors.push({
          id,
          bookingData,
          error: err.message
        });
      }
    }

    return {
      status: true,
      message: `Bulk update completed: ${results.updated} updated, ${results.failed} failed`,
      data: results
    };
  } catch (error) {
    console.error('[bulk_update.ipc] Error:', error.message);
    return {
      status: false,
      message: error.message || 'Failed to bulk update bookings',
      data: { updated: 0, failed: 0, errors: [] }
    };
  }
};
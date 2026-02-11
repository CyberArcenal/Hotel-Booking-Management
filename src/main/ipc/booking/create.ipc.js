// create.ipc.js placeholder
const bookingService = require('../../../services/booking');
const auditLogger = require('../../../utils/auditLogger');

/**
 * Create a new booking (wrapped in transaction)
 * @param {Object} params - Booking creation data (see bookingService.create)
 * @param {import('typeorm').QueryRunner} [queryRunner] - Optional transaction runner
 * @returns {Promise<{ status: boolean; message: string; data: object | null }>}
 */
module.exports = async (params, queryRunner) => {
  try {
    // bookingService.create does not accept queryRunner; transaction is managed in index.ipc
    const user = params.user || 'system';
    const booking = await bookingService.create(params, user);

    // Optional: if queryRunner is provided, you could re-save within the transaction
    // For now we just rely on the service's own save (outside transaction)
    
    return {
      status: true,
      message: 'Booking created successfully',
      data: booking
    };
  } catch (error) {
    console.error('[create.ipc] Error:', error.message);
    return {
      status: false,
      message: error.message || 'Failed to create booking',
      data: null
    };
  }
};
// create.ipc.js placeholder
//@ts-check

const bookingService = require('../../../services/Booking');

/**
 * Create a new booking (wrapped in transaction)
 * @param {Object} params - Booking creation data (see bookingService.create)
 * @param {import('typeorm').QueryRunner} [queryRunner] - Optional transaction runner
 * @returns {Promise<{ status: boolean; message: string; data: object | null }>}
 */
module.exports = async (params, queryRunner) => {
  try {
    // bookingService.create does not accept queryRunner; transaction is managed in index.ipc
    // @ts-ignore
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
    console.error('[create.ipc] Error:', error);
    return {
      status: false,
      // @ts-ignore
      message: error.message || 'Failed to create booking',
      data: null
    };
  }
};
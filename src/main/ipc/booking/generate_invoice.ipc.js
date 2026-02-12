const bookingService = require('../../../services/Booking');

/**
 * Generate an invoice for a booking
 * @param {Object} params
 * @param {number} params.bookingId - Booking ID
 * @returns {Promise<{ status: boolean; message: string; data: object | null }>}
 */
module.exports = async (params) => {
  try {
    const { bookingId } = params;
    if (!bookingId) throw new Error('Booking ID is required');

    const invoice = await bookingService.generateInvoice(bookingId);
    return {
      status: true,
      message: 'Invoice generated successfully',
      data: invoice
    };
  } catch (error) {
    console.error('[generate_invoice.ipc] Error:', error.message);
    return {
      status: false,
      message: error.message || 'Failed to generate invoice',
      data: null
    };
  }
};
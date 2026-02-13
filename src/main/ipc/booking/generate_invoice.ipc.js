const bookingService = require("../../../services/Booking");

/**
 * Print an invoice for a booking
 * @param {Object} params
 * @param {number} params.bookingId - Booking ID
 * @returns {Promise<{ status: boolean; message: string; data: object | null }>}
 */
module.exports = async (params) => {
  try {
    const { bookingId } = params;
    if (!bookingId) throw new Error("Booking ID is required");

    // Generate invoice data
    const invoice = await bookingService.generateInvoice(bookingId);

    // Print invoice using service
    const printResult = await bookingService.printInvoice(invoice);

    return {
      status: printResult.status,
      message: printResult.message,
      data: invoice,
    };
  } catch (error) {
    console.error("[print_invoice.ipc] Error:", error.message);
    return {
      status: false,
      message: error.message || "Failed to print invoice",
      data: null,
    };
  }
};

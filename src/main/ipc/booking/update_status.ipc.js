//@ts-check

const bookingService = require("../../../services/Booking");

/**
 * Update only the status of a booking
 * @param {Object} params
 * @param {number} params.id - Booking ID
 * @param {string} params.status - New status (confirmed, checked_in, checked_out, cancelled)
 * @param {string} [params.reason] - Reason for status change (e.g., cancellation reason)
 * @param {string} [params.user] - Username for audit
 * @returns {Promise<{ status: boolean; message: string; data: object | null }>}
 */
module.exports = async (params) => {
  try {
    const { id, status, reason, user = 'system' } = params;
    if (!id) throw new Error('Booking ID is required');
    if (!status) throw new Error('Status is required');


    if (!['confirmed', 'checked_in', 'checked_out', 'cancelled'].includes(status)) {
      throw new Error('Invalid status value');
    }

    let updated;
    switch (status) {
      case 'cancelled':
        updated = await bookingService.cancel(id, reason, user);
        break;
      case 'checked_in':
        updated = await bookingService.checkIn(id, user);
        break;
      case 'checked_out':
        updated = await bookingService.checkOut(id, reason, user);
        break;
      default:
        // For other status changes (confirmed, etc.) use update method
        updated = await bookingService.update(id, { status }, user);
    }

    return {
      status: true,
      message: `Booking status updated to ${status}`,
      data: updated
    };
  } catch (error) {
    // @ts-ignore
    console.error('[update_status.ipc] Error:', error.message);
    return {
      status: false,
      // @ts-ignore
      message: error.message || 'Failed to update booking status',
      data: null
    };
  }
};
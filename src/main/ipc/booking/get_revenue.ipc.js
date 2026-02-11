const bookingService = require('../../../services/booking');

/**
 * Get revenue statistics (total, average, monthly)
 * @returns {Promise<{ status: boolean; message: string; data: object }>}
 */
module.exports = async () => {
  try {
    const stats = await bookingService.getStatistics();
    return {
      status: true,
      message: 'Revenue statistics retrieved successfully',
      data: {
        totalRevenue: stats.revenue?.total || 0,
        averageBookingValue: stats.revenue?.average || 0,
        totalBookings: stats.revenue?.totalBookings || 0,
        monthlyTrends: stats.monthlyTrends || []
      }
    };
  } catch (error) {
    console.error('[get_revenue.ipc] Error:', error.message);
    return {
      status: false,
      message: error.message || 'Failed to retrieve revenue statistics',
      data: {}
    };
  }
};
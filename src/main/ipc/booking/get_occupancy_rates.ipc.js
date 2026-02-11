
const { AppDataSource } = require('../../db/datasource');
const { Room } = require('../../../entities/Room');
const { Booking } = require('../../../entities/Booking');

/**
 * Calculate occupancy rates for a given date range
 * @param {Object} params
 * @param {string} params.startDate - Start date (YYYY-MM-DD)
 * @param {string} params.endDate - End date (YYYY-MM-DD)
 * @returns {Promise<{ status: boolean; message: string; data: object }>}
 */
module.exports = async (params) => {
  try {
    const { startDate, endDate } = params;
    if (!startDate || !endDate) {
      throw new Error('startDate and endDate are required');
    }

    const roomRepo = AppDataSource.getRepository(Room);
    const bookingRepo = AppDataSource.getRepository(Booking);

    const totalRooms = await roomRepo.count();
    if (totalRooms === 0) {
      return {
        status: true,
        message: 'No rooms available',
        data: { occupancyRate: 0, occupiedRooms: 0, totalRooms: 0 }
      };
    }

    // Count distinct rooms that have bookings overlapping the date range
    const occupiedRoomsResult = await bookingRepo
      .createQueryBuilder('booking')
      .select('COUNT(DISTINCT booking.roomId)', 'count')
      .where('booking.checkInDate < :endDate', { endDate })
      .andWhere('booking.checkOutDate > :startDate', { startDate })
      .andWhere('booking.status IN (:...statuses)', {
        statuses: ['confirmed', 'checked_in']
      })
      .getRawOne();

    const occupiedRooms = parseInt(occupiedRoomsResult?.count || 0);
    const occupancyRate = (occupiedRooms / totalRooms) * 100;

    return {
      status: true,
      message: 'Occupancy rates calculated successfully',
      data: {
        startDate,
        endDate,
        totalRooms,
        occupiedRooms,
        occupancyRate: parseFloat(occupancyRate.toFixed(2))
      }
    };
  } catch (error) {
    console.error('[get_occupancy_rates.ipc] Error:', error.message);
    return {
      status: false,
      message: error.message || 'Failed to calculate occupancy rates',
      data: {}
    };
  }
};
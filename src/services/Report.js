
const { AppDataSource } = require('../main/db/datasource');
const { Booking } = require('../entities/Booking');
const { Room } = require('../entities/Room');
const { Guest } = require('../entities/Guest');
const auditLogger = require('../utils/auditLogger');
const roomService = require('./Room');
const guestService = require('./Guest');
const bookingService = require('./booking');

class ReportService {
  constructor() {
    this.bookingRepository = null;
    this.roomRepository = null;
    this.guestRepository = null;
  }

  async initialize() {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    this.bookingRepository = AppDataSource.getRepository(Booking);
    this.roomRepository = AppDataSource.getRepository(Room);
    this.guestRepository = AppDataSource.getRepository(Guest);
    console.log('ReportService initialized');
  }

  async getRepositories() {
    if (!this.bookingRepository) {
      await this.initialize();
    }
    return {
      booking: this.bookingRepository,
      room: this.roomRepository,
      guest: this.guestRepository
    };
  }

  /**
   * Get comprehensive dashboard data
   * @returns {Promise<Object>} Dashboard data
   */
  async getDashboardData() {
    try {
      const [bookingStats, roomStats, guestStats, todaysOps, revenueTrend, upcomingBookings] = await Promise.all([
        this.getBookingStatistics(),
        roomService.getStatistics(),
        guestService.getStatistics(),
        bookingService.getTodaysOperations(),
        this.getRevenueTrend('month', 6),
        this.getUpcomingBookings(7)
      ]);

      const dashboard = {
        overview: {
          totalRevenue: bookingStats.revenue.total,
          totalBookings: bookingStats.revenue.totalBookings,
          totalRooms: roomStats.totalRooms,
          totalGuests: guestStats.totalGuests,
          occupancyRate: roomStats.occupancyRate,
          averageDailyRate: this.calculateAverageDailyRate(bookingStats.revenue.total, bookingStats.revenue.totalBookings)
        },
        today: {
          arrivals: todaysOps.arrivalsCount,
          departures: todaysOps.departuresCount,
          inHouse: todaysOps.inHouseCount,
          availableRooms: roomStats.availableRooms,
          occupancyRate: roomStats.totalRooms > 0 
            ? ((todaysOps.inHouseCount / roomStats.totalRooms) * 100).toFixed(2) 
            : 0
        },
        bookingStatus: bookingStats.statusCounts,
        revenueTrend: revenueTrend,
        upcomingBookings: upcomingBookings,
        roomTypes: roomStats.typeDistribution,
        guestLoyalty: {
          repeatGuests: guestStats.repeatGuests,
          newGuestsThisMonth: guestStats.newGuestsThisMonth,
          repeatRate: guestStats.repeatRate
        }
      };

      // Log dashboard view
      await auditLogger.log({
        action: 'VIEW_DASHBOARD',
        entity: 'Dashboard',
        entityId: null,
        user: 'system'
      });

      return dashboard;
    } catch (error) {
      console.error('Failed to get dashboard data:', error);
      throw error;
    }
  }

  /**
   * Get booking statistics
   * @returns {Promise<Object>} Booking statistics
   */
  async getBookingStatistics() {
    try {
      return await bookingService.getStatistics();
    } catch (error) {
      console.error('Failed to get booking statistics:', error);
      throw error;
    }
  }

  /**
   * Get revenue trend for specified period
   * @param {string} period - 'day', 'week', 'month', 'year'
   * @param {number} count - Number of periods to return
   * @returns {Promise<Array>} Revenue trend data
   */
  async getRevenueTrend(period = 'month', count = 6) {
    const { booking: bookingRepo } = await this.getRepositories();
    
    try {
      let dateFormat, interval;
      
      switch (period) {
        case 'day':
          dateFormat = '%Y-%m-%d';
          interval = `${count} days`;
          break;
        case 'week':
          dateFormat = '%Y-%W';
          interval = `${count} weeks`;
          break;
        case 'year':
          dateFormat = '%Y';
          interval = `${count} years`;
          break;
        case 'month':
        default:
          dateFormat = '%Y-%m';
          interval = `${count} months`;
      }
      
      const trendQuery = await bookingRepo
        .createQueryBuilder('booking')
        .select([
          `strftime('${dateFormat}', booking.checkInDate) as period`,
          'COUNT(*) as bookings',
          'SUM(booking.totalPrice) as revenue',
          'AVG(booking.totalPrice) as averageValue'
        ])
        .where('booking.checkInDate >= date("now", :interval)')
        .andWhere('booking.status IN (:...statuses)', {
          statuses: ['confirmed', 'checked_in', 'checked_out']
        })
        .setParameter('interval', `-${interval}`)
        .groupBy(`strftime('${dateFormat}', booking.checkInDate)`)
        .orderBy('period', 'ASC')
        .getRawMany();
      
      // Calculate growth percentage
      const trendWithGrowth = trendQuery.map((item, index, array) => {
        let growth = 0;
        if (index > 0) {
          const prevRevenue = parseFloat(array[index - 1].revenue) || 0;
          const currentRevenue = parseFloat(item.revenue) || 0;
          growth = prevRevenue > 0 
            ? ((currentRevenue - prevRevenue) / prevRevenue) * 100 
            : (currentRevenue > 0 ? 100 : 0);
        }
        
        return {
          period: item.period,
          bookings: parseInt(item.bookings),
          revenue: parseFloat(item.revenue) || 0,
          averageValue: parseFloat(item.averageValue) || 0,
          growth: parseFloat(growth.toFixed(2))
        };
      });
      
      return trendWithGrowth;
    } catch (error) {
      console.error('Failed to get revenue trend:', error);
      throw error;
    }
  }

  /**
   * Get occupancy rate by day/week/month
   * @param {string} period - 'day', 'week', 'month'
   * @param {number} days - Number of days to analyze
   * @returns {Promise<Array>} Occupancy data
   */
  async getOccupancyReport(period = 'day', days = 30) {
    const { booking: bookingRepo, room: roomRepo } = await this.getRepositories();
    
    try {
      const totalRooms = await roomRepo.count();
      if (totalRooms === 0) return [];
      
      let dateFormat;
      switch (period) {
        case 'week':
          dateFormat = '%Y-%W';
          break;
        case 'month':
          dateFormat = '%Y-%m';
          break;
        case 'day':
        default:
          dateFormat = '%Y-%m-%d';
      }
      
      // Get occupancy by period
      const occupancyQuery = await bookingRepo
        .createQueryBuilder('booking')
        .select([
          `strftime('${dateFormat}', date(booking.checkInDate, '+' || julianday || ' days')) as date`,
          'COUNT(DISTINCT booking.roomId) as occupiedRooms'
        ])
        .innerJoin(
          `(SELECT julianday FROM (
            SELECT julianday(date('now', '-${days} days', '+' || value || ' days')) - 
                   julianday(date('now', '-${days} days')) as julianday
            FROM (
              SELECT @row := @row + 1 as value FROM 
              (SELECT 0 UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3) t1,
              (SELECT 0 UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3) t2,
              (SELECT 0 UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3) t3,
              (SELECT @row := -1) t0
            ) dates
            WHERE value <= ${days}
          ))`,
          'dates',
          'dates.julianday BETWEEN julianday(booking.checkInDate) - julianday(date("now", :interval)) AND ' +
          'julianday(booking.checkOutDate) - julianday(date("now", :interval)) - 1'
        )
        .where('booking.checkInDate <= date("now")')
        .andWhere('booking.checkOutDate >= date("now", :interval)')
        .andWhere('booking.status IN (:...statuses)', {
          statuses: ['confirmed', 'checked_in']
        })
        .setParameter('interval', `-${days} days`)
        .groupBy(`strftime('${dateFormat}', date(booking.checkInDate, '+' || julianday || ' days'))`)
        .orderBy('date', 'ASC')
        .getRawMany();
      
      // Format results
      const occupancyData = occupancyQuery.map(item => ({
        date: item.date,
        occupiedRooms: parseInt(item.occupiedRooms),
        totalRooms: totalRooms,
        occupancyRate: ((item.occupiedRooms / totalRooms) * 100).toFixed(2)
      }));
      
      return occupancyData;
    } catch (error) {
      console.error('Failed to get occupancy report:', error);
      throw error;
    }
  }

  /**
   * Get upcoming bookings for next X days
   * @param {number} days - Number of days to look ahead
   * @returns {Promise<Array>} Upcoming bookings
   */
  async getUpcomingBookings(days = 7) {
    const { booking: bookingRepo } = await this.getRepositories();
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);
      const futureDateStr = futureDate.toISOString().split('T')[0];
      
      const upcoming = await bookingRepo
        .createQueryBuilder('booking')
        .leftJoinAndSelect('booking.room', 'room')
        .leftJoinAndSelect('booking.guest', 'guest')
        .where('booking.checkInDate BETWEEN :today AND :futureDate', {
          today,
          futureDate: futureDateStr
        })
        .andWhere('booking.status = :status', { status: 'confirmed' })
        .orderBy('booking.checkInDate', 'ASC')
        .addOrderBy('room.roomNumber', 'ASC')
        .getMany();
      
      // Group by day
      const groupedByDay = upcoming.reduce((groups, booking) => {
        const date = booking.checkInDate;
        if (!groups[date]) {
          groups[date] = {
            date,
            bookings: [],
            count: 0,
            totalRevenue: 0
          };
        }
        groups[date].bookings.push(booking);
        groups[date].count++;
        groups[date].totalRevenue += booking.totalPrice;
        return groups;
      }, {});
      
      return Object.values(groupedByDay);
    } catch (error) {
      console.error('Failed to get upcoming bookings:', error);
      throw error;
    }
  }

  /**
   * Get room performance report
   * @returns {Promise<Array>} Room performance data
   */
  async getRoomPerformance() {
    const { room: roomRepo, booking: bookingRepo } = await this.getRepositories();
    
    try {
      const rooms = await roomRepo.find({
        relations: ['bookings']
      });
      
      const roomPerformance = await Promise.all(rooms.map(async (room) => {
        // Get booking stats for this room
        const bookings = await bookingRepo
          .createQueryBuilder('booking')
          .where('booking.roomId = :roomId', { roomId: room.id })
          .andWhere('booking.status IN (:...statuses)', {
            statuses: ['confirmed', 'checked_in', 'checked_out']
          })
          .getMany();
        
        const totalBookings = bookings.length;
        const totalRevenue = bookings.reduce((sum, b) => sum + b.totalPrice, 0);
        const averageRate = totalBookings > 0 ? totalRevenue / totalBookings : 0;
        
        // Calculate occupancy rate (based on last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const recentBookings = bookings.filter(b => 
          new Date(b.checkInDate) >= thirtyDaysAgo
        );
        
        // Simple occupancy calculation (days booked / 30)
        const bookedDays = recentBookings.reduce((days, booking) => {
          const checkIn = new Date(booking.checkInDate);
          const checkOut = new Date(booking.checkOutDate);
          const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
          return days + nights;
        }, 0);
        
        const occupancyRate = (bookedDays / 30) * 100;
        
        return {
          roomId: room.id,
          roomNumber: room.roomNumber,
          type: room.type,
          pricePerNight: room.pricePerNight,
          totalBookings,
          totalRevenue,
          averageRate: parseFloat(averageRate.toFixed(2)),
          occupancyRate: parseFloat(occupancyRate.toFixed(2)),
          isAvailable: room.isAvailable,
          lastBooking: bookings.length > 0 
            ? bookings[bookings.length - 1].checkInDate 
            : null
        };
      }));
      
      // Sort by revenue (highest first)
      return roomPerformance.sort((a, b) => b.totalRevenue - a.totalRevenue);
    } catch (error) {
      console.error('Failed to get room performance:', error);
      throw error;
    }
  }

  /**
   * Get guest segmentation report
   * @returns {Promise<Object>} Guest segmentation data
   */
  async getGuestSegmentation() {
    try {
      const { guests } = await guestService.search({
        page: 1,
        limit: 10000
      });
      
      // Segment by booking frequency
      const frequencySegments = {
        firstTime: 0,
        occasional: 0, // 2-3 bookings
        frequent: 0,   // 4-10 bookings
        vip: 0         // 10+ bookings
      };
      
      // Segment by spending
      const spendingSegments = {
        low: 0,    // < ₱5,000 total
        medium: 0, // ₱5,000 - ₱20,000
        high: 0,   // ₱20,000 - ₱50,000
        premium: 0 // > ₱50,000
      };
      
      // Segment by nationality
      const nationalitySegments = {};
      
      // Segment by recency (last booking)
      const recencySegments = {
        active: 0,    // Last booking < 30 days
        recent: 0,    // 30-90 days
        occasional: 0, // 90-365 days
        inactive: 0   // > 365 days
      };
      
      const now = new Date();
      
      for (const guest of guests) {
        const bookingCount = guest.bookings ? guest.bookings.length : 0;
        const totalSpent = guest.bookings 
          ? guest.bookings.reduce((sum, b) => sum + b.totalPrice, 0)
          : 0;
        
        // Frequency segmentation
        if (bookingCount === 1) frequencySegments.firstTime++;
        else if (bookingCount >= 2 && bookingCount <= 3) frequencySegments.occasional++;
        else if (bookingCount >= 4 && bookingCount <= 10) frequencySegments.frequent++;
        else if (bookingCount > 10) frequencySegments.vip++;
        
        // Spending segmentation
        if (totalSpent < 5000) spendingSegments.low++;
        else if (totalSpent < 20000) spendingSegments.medium++;
        else if (totalSpent < 50000) spendingSegments.high++;
        else spendingSegments.premium++;
        
        // Nationality segmentation
        if (guest.nationality) {
          nationalitySegments[guest.nationality] = (nationalitySegments[guest.nationality] || 0) + 1;
        }
        
        // Recency segmentation (based on last booking)
        if (bookingCount > 0) {
          const lastBooking = guest.bookings.sort((a, b) => 
            new Date(b.checkInDate) - new Date(a.checkInDate)
          )[0];
          
          const lastBookingDate = new Date(lastBooking.checkInDate);
          const daysSinceLastBooking = Math.floor((now - lastBookingDate) / (1000 * 60 * 60 * 24));
          
          if (daysSinceLastBooking < 30) recencySegments.active++;
          else if (daysSinceLastBooking < 90) recencySegments.recent++;
          else if (daysSinceLastBooking < 365) recencySegments.occasional++;
          else recencySegments.inactive++;
        } else {
          recencySegments.inactive++;
        }
      }
      
      // Sort nationalities by count
      const topNationalities = Object.entries(nationalitySegments)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([nationality, count]) => ({ nationality, count }));
      
      return {
        frequency: frequencySegments,
        spending: spendingSegments,
        recency: recencySegments,
        topNationalities,
        totalGuests: guests.length
      };
    } catch (error) {
      console.error('Failed to get guest segmentation:', error);
      throw error;
    }
  }

  /**
   * Get financial summary report
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   * @returns {Promise<Object>} Financial summary
   */
  async getFinancialSummary(startDate, endDate) {
    const { booking: bookingRepo } = await this.getRepositories();
    
    try {
      // Get revenue by room type
      const revenueByRoomType = await bookingRepo
        .createQueryBuilder('booking')
        .leftJoin('booking.room', 'room')
        .select([
          'room.type as roomType',
          'COUNT(booking.id) as bookings',
          'SUM(booking.totalPrice) as revenue',
          'AVG(booking.totalPrice) as averageRate'
        ])
        .where('booking.checkInDate BETWEEN :startDate AND :endDate')
        .andWhere('booking.status IN (:...statuses)', {
          statuses: ['confirmed', 'checked_in', 'checked_out']
        })
        .setParameters({ startDate, endDate })
        .groupBy('room.type')
        .orderBy('revenue', 'DESC')
        .getRawMany();
      
      // Get revenue by day of week
      const revenueByDay = await bookingRepo
        .createQueryBuilder('booking')
        .select([
          "strftime('%w', booking.checkInDate) as dayOfWeek",
          'COUNT(*) as bookings',
          'SUM(booking.totalPrice) as revenue'
        ])
        .where('booking.checkInDate BETWEEN :startDate AND :endDate')
        .andWhere('booking.status IN (:...statuses)', {
          statuses: ['confirmed', 'checked_in', 'checked_out']
        })
        .setParameters({ startDate, endDate })
        .groupBy("strftime('%w', booking.checkInDate)")
        .orderBy('revenue', 'DESC')
        .getRawMany();
      
      // Map day numbers to names
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const revenueByDayNamed = revenueByDay.map(item => ({
        day: dayNames[parseInt(item.dayOfWeek)],
        bookings: parseInt(item.bookings),
        revenue: parseFloat(item.revenue) || 0
      }));
      
      // Get total summary
      const totalSummary = await bookingRepo
        .createQueryBuilder('booking')
        .select([
          'COUNT(*) as totalBookings',
          'SUM(booking.totalPrice) as totalRevenue',
          'AVG(booking.totalPrice) as averageBookingValue',
          'COUNT(DISTINCT booking.guestId) as uniqueGuests'
        ])
        .where('booking.checkInDate BETWEEN :startDate AND :endDate')
        .andWhere('booking.status IN (:...statuses)', {
          statuses: ['confirmed', 'checked_in', 'checked_out']
        })
        .setParameters({ startDate, endDate })
        .getRawOne();
      
      // Get cancellation rate
      const cancellationStats = await bookingRepo
        .createQueryBuilder('booking')
        .select([
          'COUNT(*) as totalBookingsInPeriod',
          'SUM(CASE WHEN booking.status = "cancelled" THEN 1 ELSE 0 END) as cancelledBookings'
        ])
        .where('booking.createdAt BETWEEN :startDate AND :endDate')
        .setParameters({ startDate, endDate })
        .getRawOne();
      
      const cancellationRate = cancellationStats.totalBookingsInPeriod > 0
        ? (cancellationStats.cancelledBookings / cancellationStats.totalBookingsInPeriod) * 100
        : 0;
      
      return {
        period: { startDate, endDate },
        summary: {
          totalBookings: parseInt(totalSummary.totalBookings) || 0,
          totalRevenue: parseFloat(totalSummary.totalRevenue) || 0,
          averageBookingValue: parseFloat(totalSummary.averageBookingValue) || 0,
          uniqueGuests: parseInt(totalSummary.uniqueGuests) || 0,
          cancellationRate: parseFloat(cancellationRate.toFixed(2))
        },
        revenueByRoomType: revenueByRoomType.map(item => ({
          roomType: item.roomType,
          bookings: parseInt(item.bookings),
          revenue: parseFloat(item.revenue) || 0,
          averageRate: parseFloat(item.averageRate) || 0
        })),
        revenueByDay: revenueByDayNamed
      };
    } catch (error) {
      console.error('Failed to get financial summary:', error);
      throw error;
    }
  }

  /**
   * Get seasonal trends report
   * @param {number} years - Number of years to analyze
   * @returns {Promise<Object>} Seasonal trends
   */
  async getSeasonalTrends(years = 3) {
    const { booking: bookingRepo } = await this.getRepositories();
    
    try {
      const currentYear = new Date().getFullYear();
      const startYear = currentYear - years + 1;
      
      const seasonalData = await bookingRepo
        .createQueryBuilder('booking')
        .select([
          "strftime('%Y', booking.checkInDate) as year",
          "strftime('%m', booking.checkInDate) as month",
          'COUNT(*) as bookings',
          'SUM(booking.totalPrice) as revenue',
          'AVG(booking.totalPrice) as averageRate'
        ])
        .where("strftime('%Y', booking.checkInDate) >= :startYear")
        .andWhere('booking.status IN (:...statuses)', {
          statuses: ['confirmed', 'checked_in', 'checked_out']
        })
        .setParameter('startYear', startYear.toString())
        .groupBy("strftime('%Y', booking.checkInDate), strftime('%m', booking.checkInDate)")
        .orderBy('year', 'ASC')
        .addOrderBy('month', 'ASC')
        .getRawMany();
      
      // Organize by year and month
      const trendsByYear = {};
      const monthNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];
      
      seasonalData.forEach(item => {
        const year = item.year;
        const month = parseInt(item.month) - 1; // Convert to 0-indexed
        const monthName = monthNames[month];
        
        if (!trendsByYear[year]) {
          trendsByYear[year] = {
            year: parseInt(year),
            months: {}
          };
        }
        
        trendsByYear[year].months[monthName] = {
          bookings: parseInt(item.bookings),
          revenue: parseFloat(item.revenue) || 0,
          averageRate: parseFloat(item.averageRate) || 0
        };
      });
      
      // Fill missing months with zeros
      Object.values(trendsByYear).forEach(yearData => {
        monthNames.forEach(monthName => {
          if (!yearData.months[monthName]) {
            yearData.months[monthName] = {
              bookings: 0,
              revenue: 0,
              averageRate: 0
            };
          }
        });
      });
      
      // Calculate year-over-year growth
      const yearsArray = Object.keys(trendsByYear).sort();
      const growthData = {};
      
      for (let i = 1; i < yearsArray.length; i++) {
        const currentYear = yearsArray[i];
        const prevYear = yearsArray[i - 1];
        const growth = {};
        
        monthNames.forEach(monthName => {
          const current = trendsByYear[currentYear].months[monthName].revenue;
          const previous = trendsByYear[prevYear].months[monthName].revenue;
          
          growth[monthName] = previous > 0 
            ? ((current - previous) / previous) * 100 
            : (current > 0 ? 100 : 0);
        });
        
        growthData[currentYear] = growth;
      }
      
      return {
        trendsByYear,
        growthData,
        peakMonths: this.identifyPeakMonths(trendsByYear),
        averageMonthlyRevenue: this.calculateAverageMonthlyRevenue(trendsByYear)
      };
    } catch (error) {
      console.error('Failed to get seasonal trends:', error);
      throw error;
    }
  }

  /**
   * Generate PDF/CSV report
   * @param {string} reportType - Type of report
   * @param {Object} parameters - Report parameters
   * @param {string} format - 'pdf' or 'csv'
   * @param {string} user - User requesting report
   * @returns {Promise<Object>} Report data
   */
  async generateReport(reportType, parameters, format = 'pdf', user = 'system') {
    try {
      let reportData;
      let filename;
      
      switch (reportType) {
        case 'financial_summary':
          reportData = await this.getFinancialSummary(
            parameters.startDate,
            parameters.endDate
          );
          filename = `financial_summary_${parameters.startDate}_to_${parameters.endDate}`;
          break;
          
        case 'occupancy_report':
          reportData = await this.getOccupancyReport(
            parameters.period || 'day',
            parameters.days || 30
          );
          filename = `occupancy_report_${parameters.period}_${parameters.days}days`;
          break;
          
        case 'guest_segmentation':
          reportData = await this.getGuestSegmentation();
          filename = 'guest_segmentation_report';
          break;
          
        case 'room_performance':
          reportData = await this.getRoomPerformance();
          filename = 'room_performance_report';
          break;
          
        case 'seasonal_trends':
          reportData = await this.getSeasonalTrends(parameters.years || 3);
          filename = `seasonal_trends_${parameters.years || 3}years`;
          break;
          
        default:
          throw new Error(`Unknown report type: ${reportType}`);
      }
      
      // Log report generation
      await auditLogger.log({
        action: 'GENERATE_REPORT',
        entity: 'Report',
        entityId: null,
        newData: { 
          reportType, 
          format, 
          parameters,
          filename 
        },
        user
      });
      
      return {
        success: true,
        data: reportData,
        format,
        filename: `${filename}_${new Date().toISOString().split('T')[0]}.${format}`,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to generate report:', error);
      throw error;
    }
  }

  // Helper methods
  calculateAverageDailyRate(totalRevenue, totalBookings) {
    return totalBookings > 0 ? (totalRevenue / totalBookings).toFixed(2) : 0;
  }

  identifyPeakMonths(trendsByYear) {
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    
    const monthlyAverages = {};
    monthNames.forEach(month => {
      monthlyAverages[month] = 0;
    });
    
    // Calculate average revenue for each month across all years
    Object.values(trendsByYear).forEach(yearData => {
      monthNames.forEach(month => {
        monthlyAverages[month] += yearData.months[month].revenue;
      });
    });
    
    const yearCount = Object.keys(trendsByYear).length;
    Object.keys(monthlyAverages).forEach(month => {
      monthlyAverages[month] = monthlyAverages[month] / yearCount;
    });
    
    // Find top 3 months
    const sortedMonths = monthNames.sort((a, b) => 
      monthlyAverages[b] - monthlyAverages[a]
    );
    
    return sortedMonths.slice(0, 3);
  }

  calculateAverageMonthlyRevenue(trendsByYear) {
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    
    const averages = {};
    monthNames.forEach(month => {
      averages[month] = 0;
    });
    
    Object.values(trendsByYear).forEach(yearData => {
      monthNames.forEach(month => {
        averages[month] += yearData.months[month].revenue;
      });
    });
    
    const yearCount = Object.keys(trendsByYear).length;
    Object.keys(averages).forEach(month => {
      averages[month] = yearCount > 0 ? averages[month] / yearCount : 0;
    });
    
    return averages;
  }
}

// Create singleton instance
const reportService = new ReportService();

module.exports = reportService;
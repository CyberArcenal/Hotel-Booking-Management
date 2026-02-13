//@ts-check
const { AppDataSource } = require("../main/db/datasource");
const { Booking } = require("../entities/Booking");
const { Room } = require("../entities/Room");
const { Guest } = require("../entities/Guest");

const roomService = require("./Room");
const guestService = require("./Guest");
const bookingService = require("./Booking");
const auditLogger = require("../utils/auditLogger");

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
    console.log("ReportService initialized");
  }

  async getRepositories() {
    if (!this.bookingRepository) {
      await this.initialize();
    }
    return {
      booking: this.bookingRepository,
      room: this.roomRepository,
      guest: this.guestRepository,
    };
  }

  /**
   * Get comprehensive dashboard data
   * @returns {Promise<Object>} Dashboard data
   */
  async getDashboardData() {
    
    try {
      const [
        bookingStats,
        roomStats,
        guestStats,
        todaysOps,
        revenueTrend,
        upcomingBookings,
      ] = await Promise.all([
        this.getBookingStatistics(),
        roomService.getStatistics(),
        guestService.getStatistics(),
        bookingService.getTodaysOperations(),
        this.getRevenueTrend("month", 6),
        this.getUpcomingBookings(7),
      ]);

      const dashboard = {
        overview: {
          // @ts-ignore
          totalRevenue: bookingStats.revenue.total,
          // @ts-ignore
          totalBookings: bookingStats.revenue.totalBookings,
          // @ts-ignore
          totalRooms: roomStats.totalRooms,
          // @ts-ignore
          totalGuests: guestStats.totalGuests,
          // @ts-ignore
          occupancyRate: roomStats.occupancyRate,
          // @ts-ignore
          averageDailyRate: this.calculateAverageDailyRate(
            // @ts-ignore
            bookingStats.revenue.total,
            // @ts-ignore
            bookingStats.revenue.totalBookings,
          ),
        },
        today: {
          // @ts-ignore
          arrivals: todaysOps.arrivalsCount,
          // @ts-ignore
          departures: todaysOps.departuresCount,
          // @ts-ignore
          inHouse: todaysOps.inHouseCount,
          // @ts-ignore
          availableRooms: roomStats.availableRooms,
          // @ts-ignore
          occupancyRate:
            // @ts-ignore
            roomStats.totalRooms > 0
              ? // @ts-ignore
                ((todaysOps.inHouseCount / roomStats.totalRooms) * 100).toFixed(
                  2,
                )
              : 0,
        },
        // @ts-ignore
        bookingStatus: bookingStats.statusCounts,
        revenueTrend: revenueTrend,
        upcomingBookings: upcomingBookings,
        // @ts-ignore
        roomTypes: roomStats.typeDistribution,
        guestLoyalty: {
          // @ts-ignore
          repeatGuests: guestStats.repeatGuests,
          // @ts-ignore
          newGuestsThisMonth: guestStats.newGuestsThisMonth,
          // @ts-ignore
          repeatRate: guestStats.repeatRate,
        },
      };

      // Log dashboard view
      await auditLogger.log({
        action: "VIEW_DASHBOARD",
        entity: "Dashboard",
        // @ts-ignore
        entityId: null,
        user: "system",
      });

      return dashboard;
    } catch (error) {
      console.error("Failed to get dashboard data:", error);
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
      console.error("Failed to get booking statistics:", error);
      throw error;
    }
  }

  /**
   * Get revenue trend for specified period
   * @param {string} period - 'day', 'week', 'month', 'year'
   * @param {number} count - Number of periods to return
   */
  async getRevenueTrend(period = "month", count = 6) {
    const { booking: bookingRepo } = await this.getRepositories();

    try {
      let dateFormat, interval;

      switch (period) {
        case "day":
          dateFormat = "%Y-%m-%d";
          interval = `${count} days`;
          break;
        case "week":
          dateFormat = "%Y-%W";
          interval = `${count} weeks`;
          break;
        case "year":
          dateFormat = "%Y";
          interval = `${count} years`;
          break;
        case "month":
        default:
          dateFormat = "%Y-%m";
          interval = `${count} months`;
      }

      // @ts-ignore
      const trendQuery = await bookingRepo
        .createQueryBuilder("booking")
        .select([
          `strftime('${dateFormat}', booking.checkInDate) as period`,
          "COUNT(*) as bookings",
          "SUM(booking.totalPrice) as revenue",
          "AVG(booking.totalPrice) as averageValue",
        ])
        .where('booking.checkInDate >= date("now", :interval)')
        .andWhere("booking.status IN (:...statuses)", {
          statuses: ["confirmed", "checked_in", "checked_out"],
        })
        .setParameter("interval", `-${interval}`)
        .groupBy(`strftime('${dateFormat}', booking.checkInDate)`)
        .orderBy("period", "ASC")
        .getRawMany();

      // Calculate growth percentage
      const trendWithGrowth = trendQuery.map((item, index, array) => {
        let growth = 0;
        if (index > 0) {
          const prevRevenue = parseFloat(array[index - 1].revenue) || 0;
          const currentRevenue = parseFloat(item.revenue) || 0;
          growth =
            prevRevenue > 0
              ? ((currentRevenue - prevRevenue) / prevRevenue) * 100
              : currentRevenue > 0
                ? 100
                : 0;
        }

        return {
          period: item.period,
          bookings: parseInt(item.bookings),
          revenue: parseFloat(item.revenue) || 0,
          averageValue: parseFloat(item.averageValue) || 0,
          growth: parseFloat(growth.toFixed(2)),
        };
      });

      return trendWithGrowth;
    } catch (error) {
      console.error("Failed to get revenue trend:", error);
      throw error;
    }
  }

  /**
   * Get occupancy rate by day/week/month
   * @param {string} period - 'day', 'week', 'month'
   * @param {number} days - Number of days to analyze
   */
  /**
   * Get occupancy rate by day/week/month
   * @param {string} period - 'day', 'week', 'month'
   * @param {number} days - Number of days to analyze
   */
  async getOccupancyReport(period = "day", days = 30) {
    const { booking: bookingRepo, room: roomRepo } =
      await this.getRepositories();

    try {
      // @ts-ignore
      const totalRooms = await roomRepo.count();
      if (totalRooms === 0) return [];

      // Choose date format based on period
      let dateFormat;
      switch (period) {
        case "week":
          dateFormat = "%Y-%W";
          break;
        case "month":
          dateFormat = "%Y-%m";
          break;
        case "day":
        default:
          dateFormat = "%Y-%m-%d";
      }

      // ---- RAW SQL WITH RECURSIVE CTE (SQLITE COMPATIBLE) ----
      const sql = `
      WITH RECURSIVE
      -- Generate numbers 0 .. days-1
      day_offsets(x) AS (
        SELECT 0
        UNION ALL
        SELECT x + 1 FROM day_offsets WHERE x < ?
      ),
      -- Convert offsets to actual dates (from start_date = 'now' - days)
      date_series AS (
        SELECT
          x,
          date('now', '-' || ? || ' days', '+' || x || ' days') AS date
        FROM day_offsets
      )
      SELECT
        strftime(?, ds.date) AS date,
        COUNT(DISTINCT b.roomId) AS occupiedRooms
      FROM date_series ds
      LEFT JOIN bookings b ON
        b.checkInDate <= ds.date
        AND b.checkOutDate > ds.date
        AND b.status IN (?, ?)
      GROUP BY ds.date
      ORDER BY ds.date ASC
    `;

      const statuses = ["confirmed", "checked_in"];
      // @ts-ignore
      const results = await bookingRepo.manager.query(sql, [
        days, // for day_offsets WHERE x < ?
        days, // for start date offset
        dateFormat, // strftime format
        ...statuses, // two status placeholders
      ]);

      // Format the results
      // @ts-ignore
      const occupancyData = results.map((item) => ({
        date: item.date,
        occupiedRooms: parseInt(item.occupiedRooms),
        totalRooms: totalRooms,
        occupancyRate: ((item.occupiedRooms / totalRooms) * 100).toFixed(2),
      }));

      return occupancyData;
    } catch (error) {
      console.error("Failed to get occupancy report:", error);
      throw error;
    }
  }

  /**
   * Get upcoming bookings for next X days
   * @param {number} days - Number of days to look ahead
   */
  async getUpcomingBookings(days = 7) {
    const { booking: bookingRepo } = await this.getRepositories();

    try {
      const today = new Date().toISOString().split("T")[0];
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);
      const futureDateStr = futureDate.toISOString().split("T")[0];

      // @ts-ignore
      const upcoming = await bookingRepo
        .createQueryBuilder("booking")
        .leftJoinAndSelect("booking.room", "room")
        .leftJoinAndSelect("booking.guest", "guest")
        .where("booking.checkInDate BETWEEN :today AND :futureDate", {
          today,
          futureDate: futureDateStr,
        })
        .andWhere("booking.status = :status", { status: "confirmed" })
        .orderBy("booking.checkInDate", "ASC")
        .addOrderBy("room.roomNumber", "ASC")
        .getMany();

      // Group by day
      const groupedByDay = upcoming.reduce((groups, booking) => {
        const date = booking.checkInDate;
        // @ts-ignore
        if (!groups[date]) {
          // @ts-ignore
          groups[date] = {
            date,
            bookings: [],
            count: 0,
            totalRevenue: 0,
          };
        }
        // @ts-ignore
        groups[date].bookings.push(booking);
        // @ts-ignore
        groups[date].count++;
        // @ts-ignore
        groups[date].totalRevenue += booking.totalPrice;
        return groups;
      }, {});

      return Object.values(groupedByDay);
    } catch (error) {
      console.error("Failed to get upcoming bookings:", error);
      throw error;
    }
  }

  /**
   * Get room performance report
   */
  async getRoomPerformance() {
    const { room: roomRepo, booking: bookingRepo } =
      await this.getRepositories();

    try {
      // @ts-ignore
      const rooms = await roomRepo.find({
        relations: ["bookings"],
      });

      const roomPerformance = await Promise.all(
        rooms.map(async (room) => {
          // Get booking stats for this room
          // @ts-ignore
          const bookings = await bookingRepo
            .createQueryBuilder("booking")
            .where("booking.roomId = :roomId", { roomId: room.id })
            .andWhere("booking.status IN (:...statuses)", {
              statuses: ["confirmed", "checked_in", "checked_out"],
            })
            .getMany();

          const totalBookings = bookings.length;
          // @ts-ignore
          const totalRevenue = bookings.reduce(
            // @ts-ignore
            (sum, b) => sum + b.totalPrice,
            0,
          );
          const averageRate =
            totalBookings > 0 ? totalRevenue / totalBookings : 0;

          // Calculate occupancy rate (based on last 30 days)
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

          const recentBookings = bookings.filter(
            (b) =>
              // @ts-ignore
              new Date(b.checkInDate) >= thirtyDaysAgo,
          );

          // Simple occupancy calculation (days booked / 30)
          const bookedDays = recentBookings.reduce((days, booking) => {
            // @ts-ignore
            const checkIn = new Date(booking.checkInDate);
            // @ts-ignore
            const checkOut = new Date(booking.checkOutDate);
            // @ts-ignore
            const nights = Math.ceil(
              // @ts-ignore
              (checkOut - checkIn) / (1000 * 60 * 60 * 24),
            );
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
            lastBooking:
              bookings.length > 0
                ? bookings[bookings.length - 1].checkInDate
                : null,
          };
        }),
      );

      // Sort by revenue (highest first)
      return roomPerformance.sort((a, b) => b.totalRevenue - a.totalRevenue);
    } catch (error) {
      console.error("Failed to get room performance:", error);
      throw error;
    }
  }

  /**
   * Get guest segmentation report
   * @returns {Promise<Object>} Guest segmentation data
   */
  async getGuestSegmentation() {
    try {
      // @ts-ignore
      const { guests } = await guestService.search({
        page: 1,
        limit: 10000,
      });

      // Segment by booking frequency
      const frequencySegments = {
        firstTime: 0,
        occasional: 0, // 2-3 bookings
        frequent: 0, // 4-10 bookings
        vip: 0, // 10+ bookings
      };

      // Segment by spending
      const spendingSegments = {
        low: 0, // < ₱5,000 total
        medium: 0, // ₱5,000 - ₱20,000
        high: 0, // ₱20,000 - ₱50,000
        premium: 0, // > ₱50,000
      };

      // Segment by nationality
      const nationalitySegments = {};

      // Segment by recency (last booking)
      const recencySegments = {
        active: 0, // Last booking < 30 days
        recent: 0, // 30-90 days
        occasional: 0, // 90-365 days
        inactive: 0, // > 365 days
      };

      const now = new Date();

      for (const guest of guests) {
        const bookingCount = guest.bookings ? guest.bookings.length : 0;
        const totalSpent = guest.bookings
          ? // @ts-ignore
            guest.bookings.reduce((sum, b) => sum + b.totalPrice, 0)
          : 0;

        // Frequency segmentation
        if (bookingCount === 1) frequencySegments.firstTime++;
        else if (bookingCount >= 2 && bookingCount <= 3)
          frequencySegments.occasional++;
        else if (bookingCount >= 4 && bookingCount <= 10)
          frequencySegments.frequent++;
        else if (bookingCount > 10) frequencySegments.vip++;

        // Spending segmentation
        if (totalSpent < 5000) spendingSegments.low++;
        else if (totalSpent < 20000) spendingSegments.medium++;
        else if (totalSpent < 50000) spendingSegments.high++;
        else spendingSegments.premium++;

        // Nationality segmentation
        if (guest.nationality) {
          // @ts-ignore
          nationalitySegments[guest.nationality] =
            // @ts-ignore
            (nationalitySegments[guest.nationality] || 0) + 1;
        }

        // Recency segmentation (based on last booking)
        if (bookingCount > 0) {
          // @ts-ignore
          const lastBooking = guest.bookings.sort(
            // @ts-ignore
            (a, b) =>
              // @ts-ignore
              new Date(b.checkInDate) - new Date(a.checkInDate),
          )[0];

          const lastBookingDate = new Date(lastBooking.checkInDate);
          // @ts-ignore
          const daysSinceLastBooking = Math.floor(
            // @ts-ignore
            (now - lastBookingDate) / (1000 * 60 * 60 * 24),
          );

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
        totalGuests: guests.length,
      };
    } catch (error) {
      console.error("Failed to get guest segmentation:", error);
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
      // @ts-ignore
      const revenueByRoomType = await bookingRepo
        .createQueryBuilder("booking")
        .leftJoin("booking.room", "room")
        .select([
          "room.type as roomType",
          "COUNT(booking.id) as bookings",
          "SUM(booking.totalPrice) as revenue",
          "AVG(booking.totalPrice) as averageRate",
        ])
        .where("booking.checkInDate BETWEEN :startDate AND :endDate")
        .andWhere("booking.status IN (:...statuses)", {
          statuses: ["confirmed", "checked_in", "checked_out"],
        })
        .setParameters({ startDate, endDate })
        .groupBy("room.type")
        .orderBy("revenue", "DESC")
        .getRawMany();

      // Get revenue by day of week
      // @ts-ignore
      const revenueByDay = await bookingRepo
        .createQueryBuilder("booking")
        .select([
          "strftime('%w', booking.checkInDate) as dayOfWeek",
          "COUNT(*) as bookings",
          "SUM(booking.totalPrice) as revenue",
        ])
        .where("booking.checkInDate BETWEEN :startDate AND :endDate")
        .andWhere("booking.status IN (:...statuses)", {
          statuses: ["confirmed", "checked_in", "checked_out"],
        })
        .setParameters({ startDate, endDate })
        .groupBy("strftime('%w', booking.checkInDate)")
        .orderBy("revenue", "DESC")
        .getRawMany();

      // Map day numbers to names
      const dayNames = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      const revenueByDayNamed = revenueByDay.map((item) => ({
        day: dayNames[parseInt(item.dayOfWeek)],
        bookings: parseInt(item.bookings),
        revenue: parseFloat(item.revenue) || 0,
      }));

      // Get total summary
      // @ts-ignore
      const totalSummary = await bookingRepo
        .createQueryBuilder("booking")
        .select([
          "COUNT(*) as totalBookings",
          "SUM(booking.totalPrice) as totalRevenue",
          "AVG(booking.totalPrice) as averageBookingValue",
          "COUNT(DISTINCT booking.guestId) as uniqueGuests",
        ])
        .where("booking.checkInDate BETWEEN :startDate AND :endDate")
        .andWhere("booking.status IN (:...statuses)", {
          statuses: ["confirmed", "checked_in", "checked_out"],
        })
        .setParameters({ startDate, endDate })
        .getRawOne();

      // Get cancellation rate
      // @ts-ignore
      const cancellationStats = await bookingRepo
        .createQueryBuilder("booking")
        .select([
          "COUNT(*) as totalBookingsInPeriod",
          'SUM(CASE WHEN booking.status = "cancelled" THEN 1 ELSE 0 END) as cancelledBookings',
        ])
        .where("booking.createdAt BETWEEN :startDate AND :endDate")
        .setParameters({ startDate, endDate })
        .getRawOne();

      const cancellationRate =
        cancellationStats.totalBookingsInPeriod > 0
          ? (cancellationStats.cancelledBookings /
              cancellationStats.totalBookingsInPeriod) *
            100
          : 0;

      return {
        period: { startDate, endDate },
        summary: {
          totalBookings: parseInt(totalSummary.totalBookings) || 0,
          totalRevenue: parseFloat(totalSummary.totalRevenue) || 0,
          averageBookingValue:
            parseFloat(totalSummary.averageBookingValue) || 0,
          uniqueGuests: parseInt(totalSummary.uniqueGuests) || 0,
          cancellationRate: parseFloat(cancellationRate.toFixed(2)),
        },
        revenueByRoomType: revenueByRoomType.map((item) => ({
          roomType: item.roomType,
          bookings: parseInt(item.bookings),
          revenue: parseFloat(item.revenue) || 0,
          averageRate: parseFloat(item.averageRate) || 0,
        })),
        revenueByDay: revenueByDayNamed,
      };
    } catch (error) {
      console.error("Failed to get financial summary:", error);
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

      // @ts-ignore
      const seasonalData = await bookingRepo
        .createQueryBuilder("booking")
        .select([
          "strftime('%Y', booking.checkInDate) as year",
          "strftime('%m', booking.checkInDate) as month",
          "COUNT(*) as bookings",
          "SUM(booking.totalPrice) as revenue",
          "AVG(booking.totalPrice) as averageRate",
        ])
        .where("strftime('%Y', booking.checkInDate) >= :startYear")
        .andWhere("booking.status IN (:...statuses)", {
          statuses: ["confirmed", "checked_in", "checked_out"],
        })
        .setParameter("startYear", startYear.toString())
        .groupBy(
          "strftime('%Y', booking.checkInDate), strftime('%m', booking.checkInDate)",
        )
        .orderBy("year", "ASC")
        .addOrderBy("month", "ASC")
        .getRawMany();

      // Organize by year and month
      const trendsByYear = {};
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      seasonalData.forEach((item) => {
        const year = item.year;
        const month = parseInt(item.month) - 1; // Convert to 0-indexed
        const monthName = monthNames[month];

        // @ts-ignore
        if (!trendsByYear[year]) {
          // @ts-ignore
          trendsByYear[year] = {
            year: parseInt(year),
            months: {},
          };
        }

        // @ts-ignore
        trendsByYear[year].months[monthName] = {
          bookings: parseInt(item.bookings),
          revenue: parseFloat(item.revenue) || 0,
          averageRate: parseFloat(item.averageRate) || 0,
        };
      });

      // Fill missing months with zeros
      Object.values(trendsByYear).forEach((yearData) => {
        monthNames.forEach((monthName) => {
          if (!yearData.months[monthName]) {
            yearData.months[monthName] = {
              bookings: 0,
              revenue: 0,
              averageRate: 0,
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

        monthNames.forEach((monthName) => {
          // @ts-ignore
          const current = trendsByYear[currentYear].months[monthName].revenue;
          // @ts-ignore
          const previous = trendsByYear[prevYear].months[monthName].revenue;

          // @ts-ignore
          growth[monthName] =
            previous > 0
              ? ((current - previous) / previous) * 100
              : current > 0
                ? 100
                : 0;
        });

        // @ts-ignore
        growthData[currentYear] = growth;
      }

      return {
        trendsByYear,
        growthData,
        peakMonths: this.identifyPeakMonths(trendsByYear),
        averageMonthlyRevenue:
          this.calculateAverageMonthlyRevenue(trendsByYear),
      };
    } catch (error) {
      console.error("Failed to get seasonal trends:", error);
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
  async generateReport(
    reportType,
    parameters,
    format = "pdf",
    user = "system",
  ) {
    
    try {
      let reportData;
      let filename;

      switch (reportType) {
        case "financial_summary":
          reportData = await this.getFinancialSummary(
            // @ts-ignore
            parameters.startDate,
            // @ts-ignore
            parameters.endDate,
          );
          // @ts-ignore
          filename = `financial_summary_${parameters.startDate}_to_${parameters.endDate}`;
          break;

        case "occupancy_report":
          reportData = await this.getOccupancyReport(
            // @ts-ignore
            parameters.period || "day",
            // @ts-ignore
            parameters.days || 30,
          );
          // @ts-ignore
          filename = `occupancy_report_${parameters.period}_${parameters.days}days`;
          break;

        case "guest_segmentation":
          reportData = await this.getGuestSegmentation();
          filename = "guest_segmentation_report";
          break;

        case "room_performance":
          reportData = await this.getRoomPerformance();
          filename = "room_performance_report";
          break;

        case "seasonal_trends":
          // @ts-ignore
          reportData = await this.getSeasonalTrends(parameters.years || 3);
          // @ts-ignore
          filename = `seasonal_trends_${parameters.years || 3}years`;
          break;

        default:
          throw new Error(`Unknown report type: ${reportType}`);
      }

      // Log report generation
      await auditLogger.log({
        action: "GENERATE_REPORT",
        entity: "Report",
        // @ts-ignore
        entityId: null,
        newData: {
          reportType,
          format,
          parameters,
          filename,
        },
        user,
      });

      return {
        success: true,
        data: reportData,
        format,
        filename: `${filename}_${new Date().toISOString().split("T")[0]}.${format}`,
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Failed to generate report:", error);
      throw error;
    }
  }

  // Helper methods
  // @ts-ignore
  calculateAverageDailyRate(totalRevenue, totalBookings) {
    return totalBookings > 0 ? (totalRevenue / totalBookings).toFixed(2) : 0;
  }

  // @ts-ignore
  identifyPeakMonths(trendsByYear) {
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const monthlyAverages = {};
    monthNames.forEach((month) => {
      // @ts-ignore
      monthlyAverages[month] = 0;
    });

    // Calculate average revenue for each month across all years
    Object.values(trendsByYear).forEach((yearData) => {
      monthNames.forEach((month) => {
        // @ts-ignore
        monthlyAverages[month] += yearData.months[month].revenue;
      });
    });

    const yearCount = Object.keys(trendsByYear).length;
    Object.keys(monthlyAverages).forEach((month) => {
      // @ts-ignore
      monthlyAverages[month] = monthlyAverages[month] / yearCount;
    });

    // Find top 3 months
    const sortedMonths = monthNames.sort(
      (a, b) =>
        // @ts-ignore
        monthlyAverages[b] - monthlyAverages[a],
    );

    return sortedMonths.slice(0, 3);
  }

  // @ts-ignore
  calculateAverageMonthlyRevenue(trendsByYear) {
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const averages = {};
    monthNames.forEach((month) => {
      // @ts-ignore
      averages[month] = 0;
    });

    Object.values(trendsByYear).forEach((yearData) => {
      monthNames.forEach((month) => {
        // @ts-ignore
        averages[month] += yearData.months[month].revenue;
      });
    });

    const yearCount = Object.keys(trendsByYear).length;
    Object.keys(averages).forEach((month) => {
      // @ts-ignore
      averages[month] = yearCount > 0 ? averages[month] / yearCount : 0;
    });

    return averages;
  }
}

// Create singleton instance
const reportService = new ReportService();

module.exports = reportService;

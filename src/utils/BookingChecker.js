// src/main/utils/bookingChecker.js
//@ts-check

const { Booking } = require("../entities/Booking");
const { Room } = require("../entities/Room");
const { AppDataSource } = require("../main/db/datasource");

class BookingChecker {
    /**
     * @param {number} intervalMs - Interval ng pag-check (default: 5 minutes)
     */
    constructor(intervalMs = 5 * 60 * 1000) {
        this.intervalMs = intervalMs;
        this.timer = null;
        this.isRunning = false;
        this.checking = false; // para maiwasan ang overlapping checks
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.check(); // run agad
        this.timer = setInterval(() => this.check(), this.intervalMs);
        console.log('✅ BookingChecker started');
    }

    stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        this.isRunning = false;
        console.log('🛑 BookingChecker stopped');
    }

    async check() {
        if (this.checking) return;
        this.checking = true;

        try {
            if (!AppDataSource.isInitialized) {
                console.warn('⚠️ BookingChecker: Database not initialized, skipping');
                return;
            }

            const today = new Date();
            today.setHours(0, 0, 0, 0); // start of day
            const todayStr = today.toISOString().split('T')[0]; // 'YYYY-MM-DD'

            // Hanapin ang mga booking na active ngayong araw:
            // - checkInDate <= today < checkOutDate
            // - status ay confirmed o checked_in (hindi cancelled/checked_out)
            const bookings = await AppDataSource
                .getRepository(Booking)
                .createQueryBuilder('booking')
                .leftJoinAndSelect('booking.room', 'room')
                .where('booking.checkInDate <= :today', { today: todayStr })
                .andWhere('booking.checkOutDate > :today', { today: todayStr })
                .andWhere('booking.status IN (:...statuses)', {
                    statuses: ['confirmed', 'checked_in']
                })
                .getMany();

            for (const booking of bookings) {
                // @ts-ignore
                if (!booking.room) continue;

                // Kung ang room ay hindi pa occupied, i-set sa 'occupied'
                // @ts-ignore
                if (booking.room.status !== 'occupied') {
                    // @ts-ignore
                    booking.room.status = 'occupied';
                    // @ts-ignore
                    await AppDataSource.getRepository(Room).save(booking.room);
                    // @ts-ignore
                    console.log(`🛏️ Room ${booking.room.roomNumber} set to OCCUPIED (Booking ID: ${booking.id})`);
                }
            }
        } catch (error) {
            console.error('❌ BookingChecker error:', error);
        } finally {
            this.checking = false;
        }
    }
}

module.exports = BookingChecker;
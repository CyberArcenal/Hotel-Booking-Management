// src/utils/bookingUtils.js
const { AppDataSource } = require("../main/db/datasource");
const { Between, LessThanOrEqual, MoreThanOrEqual } = require("typeorm");

/**
 * Check if a room is available for a given date range.
 * @param {number} roomId - ID ng room
 * @param {string} checkInDate - YYYY-MM-DD
 * @param {string} checkOutDate - YYYY-MM-DD
 * @param {number} [excludeBookingId] - Kung nag-e-edit, i-exclude ang booking na ito
 * @returns {Promise<boolean>} True kung available
 */
async function checkRoomAvailability(roomId, checkInDate, checkOutDate, excludeBookingId = null) {
  const bookingRepo = AppDataSource.getRepository("Booking");

  // Hanapin ang mga booking na nag-o-overlap sa date range
  const query = bookingRepo
    .createQueryBuilder("booking")
    .where("booking.roomId = :roomId", { roomId })
    .andWhere(
      "(booking.checkInDate < :checkOut AND booking.checkOutDate > :checkIn)",
      { checkIn: checkInDate, checkOut: checkOutDate }
    )
    .andWhere("booking.status NOT IN ('cancelled', 'checked_out')");

  if (excludeBookingId) {
    query.andWhere("booking.id != :excludeId", { excludeId: excludeBookingId });
  }

  const count = await query.getCount();
  return count === 0;
}

/**
 * Validate booking data (including availability)
 * @param {Object} bookingData - Booking data to validate
 * @param {boolean} [isUpdate=false] - Kung update, i-exclude ang sarili sa availability check
 * @returns {Promise<Object>} Validation result { valid: boolean, errors: string[] }
 */
async function validateBookingData(bookingData, isUpdate = false) {
  const guestRepo = AppDataSource.getRepository("Guest");
  const roomRepo = AppDataSource.getRepository("Room");
  const errors = [];

  // --- Required fields ---
  if (!bookingData.checkInDate || bookingData.checkInDate.trim() === "") {
    errors.push("Check-in date is required");
  }

  if (!bookingData.checkOutDate || bookingData.checkOutDate.trim() === "") {
    errors.push("Check-out date is required");
  }

  if (!bookingData.roomId) {
    errors.push("Room selection is required");
  }

  // --- Guest validation ---
  if (!bookingData.guestData) {
    errors.push("Guest information is required");
  } else {
    const guest = bookingData.guestData;
    if (!guest.id) {
      errors.push("Guest selection is required");
    } else if (typeof guest.id !== "number") {
      errors.push("Guest ID must be a number");
    } else {
      const existingGuest = await guestRepo.findOneBy({ id: guest.id });
      if (!existingGuest) {
        errors.push("Selected guest does not exist");
      }
    }
  }

  // --- Date validations ---
  if (bookingData.checkInDate && bookingData.checkOutDate) {
    const checkIn = new Date(bookingData.checkInDate);
    const checkOut = new Date(bookingData.checkOutDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(checkIn.getTime())) {
      errors.push("Invalid check-in date format");
    }
    if (isNaN(checkOut.getTime())) {
      errors.push("Invalid check-out date format");
    }

    if (!isNaN(checkIn.getTime()) && !isNaN(checkOut.getTime())) {
      if (checkIn >= checkOut) {
        errors.push("Check-out date must be after check-in date");
      }

      if (!isUpdate && checkIn < today) {
        errors.push("Check-in date cannot be in the past");
      }
    }
  }

  // --- Number of guests ---
  if (bookingData.numberOfGuests !== undefined) {
    if (
      !Number.isInteger(bookingData.numberOfGuests) ||
      bookingData.numberOfGuests < 1
    ) {
      errors.push("Number of guests must be a positive integer");
    } else {
      // Optional: check kung kaya ng room capacity
      if (bookingData.roomId) {
        const room = await roomRepo.findOneBy({ id: bookingData.roomId });
        if (room && bookingData.numberOfGuests > room.capacity) {
          errors.push(`Room capacity is only ${room.capacity} guests`);
        }
      }
    }
  }

  // --- Availability check (kung walang errors pa) ---
  if (
    errors.length === 0 &&
    bookingData.roomId &&
    bookingData.checkInDate &&
    bookingData.checkOutDate
  ) {
    const available = await checkRoomAvailability(
      bookingData.roomId,
      bookingData.checkInDate,
      bookingData.checkOutDate,
      isUpdate ? bookingData.id : null // para sa update, i-exclude ang sarili
    );
    if (!available) {
      errors.push("Room is not available for the selected dates");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate email format
 * @param {string} email - Email address
 * @returns {boolean} True if valid
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Calculate total price for booking
 * @param {number} pricePerNight - Room price per night
 * @param {string} checkInDate - YYYY-MM-DD
 * @param {string} checkOutDate - YYYY-MM-DD
 * @returns {number} Total price
 */
function calculateTotalPrice(pricePerNight, checkInDate, checkOutDate) {
  const nights = calculateNights(checkInDate, checkOutDate);
  return pricePerNight * nights;
}

/**
 * Calculate number of nights between dates
 * @param {string} checkInDate - YYYY-MM-DD
 * @param {string} checkOutDate - YYYY-MM-DD
 * @returns {number} Number of nights
 */
function calculateNights(checkInDate, checkOutDate) {
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  const diffTime = Math.abs(checkOut - checkIn);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Format date for display
 * @param {string} dateString - YYYY-MM-DD
 * @param {string} [format="MMM DD, YYYY"] - Output format (simple)
 * @returns {string} Formatted date
 */
function formatDate(dateString, format = "MMM DD, YYYY") {
  const date = new Date(dateString);
  const options = { year: "numeric", month: "short", day: "numeric" };
  return date.toLocaleDateString("en-US", options);
}

/**
 * Generate a unique booking confirmation number
 * @returns {string} e.g., BK-2JZ8KX-ABCD
 */
function generateConfirmationNumber() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BK-${timestamp}-${random}`;
}

module.exports = {
  validateBookingData,
  checkRoomAvailability,
  isValidEmail,
  calculateTotalPrice,
  calculateNights,
  formatDate,
  generateConfirmationNumber,
};
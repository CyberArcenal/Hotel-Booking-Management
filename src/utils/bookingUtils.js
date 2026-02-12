const { AppDataSource } = require("../main/db/datasource");

/**
 * Validate booking data
 * @param {Object} bookingData - Booking data to validate
 * @returns {Object} Validation result {valid: boolean, errors: string[]}
 */
async function validateBookingData(bookingData) {
  const guestRepo = AppDataSource.getRepository("Guest");
  const errors = [];

  // Check required fields
  if (!bookingData.checkInDate || bookingData.checkInDate.trim() === "") {
    errors.push("Check-in date is required");
  }

  if (!bookingData.checkOutDate || bookingData.checkOutDate.trim() === "") {
    errors.push("Check-out date is required");
  }

  if (bookingData.checkInDate && bookingData.checkOutDate) {
    const checkIn = new Date(bookingData.checkInDate);
    const checkOut = new Date(bookingData.checkOutDate);

    if (checkIn >= checkOut) {
      errors.push("Check-out date must be after check-in date");
    }

    // Check if dates are in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkIn < today) {
      errors.push("Check-in date cannot be in the past");
    }
  }

  if (!bookingData.roomId) {
    errors.push("Room selection is required");
  }

  // Validate guest data
  if (!bookingData.guestData) {
    errors.push("Guest information is required");
  } else {
    const guest = bookingData.guestData;
    if (!guest.id) {
      errors.push("Guest selection is required");
    } else if (typeof guest.id !== "number") {
      errors.push("Guest ID must be a number");
    }

    const res = await guestRepo.findOneBy({ id: guest.id });
    if (!res) {
      errors.push("Selected guest does not exist");
    }
  }

  // Validate number of guests
  if (bookingData.numberOfGuests !== undefined) {
    if (
      !Number.isInteger(bookingData.numberOfGuests) ||
      bookingData.numberOfGuests < 1
    ) {
      errors.push("Number of guests must be a positive integer");
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
 * @param {string} checkInDate - Check-in date
 * @param {string} checkOutDate - Check-out date
 * @returns {number} Total price
 */
function calculateTotalPrice(pricePerNight, checkInDate, checkOutDate) {
  const nights = calculateNights(checkInDate, checkOutDate);
  return pricePerNight * nights;
}

/**
 * Calculate number of nights between dates
 * @param {string} checkInDate - Check-in date
 * @param {string} checkOutDate - Check-out date
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
 * @param {string} dateString - Date string
 * @param {string} format - Output format
 * @returns {string} Formatted date
 */
function formatDate(dateString, format = "MMM DD, YYYY") {
  const date = new Date(dateString);
  const options = { year: "numeric", month: "short", day: "numeric" };
  return date.toLocaleDateString("en-US", options);
}

/**
 * Generate booking confirmation number
 * @returns {string} Booking confirmation number
 */
function generateConfirmationNumber() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BK-${timestamp}-${random}`;
}

module.exports = {
  validateBookingData,
  isValidEmail,
  calculateTotalPrice,
  calculateNights,
  formatDate,
  generateConfirmationNumber,
};

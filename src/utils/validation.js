// validation.js
/**
 * Allowed room types (must match Room.entity.js)
 */
const ROOM_TYPES = [
  "standard",
  "single",
  "double",
  "twin",
  "suite",
  "deluxe",
  "family",
  "studio",
  "executive",
];

/**
 * Allowed room statuses (must match Room.entity.js)
 */
const ROOM_STATUSES = ["available", "occupied", "maintenance"];

/**
 * Validate room data
 * @param {Object} roomData - Room data to validate
 * @param {boolean} isUpdate - Whether this is an update (fields are optional)
 * @returns {Object} Validation result {valid: boolean, errors: string[]}
 */
function validateRoomData(roomData, isUpdate = false) {
  const errors = [];

  // ----- Room Number -----
  if (!isUpdate || roomData.roomNumber !== undefined) {
    if (!roomData.roomNumber || roomData.roomNumber.trim() === "") {
      errors.push("Room number is required");
    } else if (roomData.roomNumber.length > 10) {
      errors.push("Room number must be 10 characters or less");
    }
  }

  // ----- Room Type (enum) -----
  if (!isUpdate || roomData.type !== undefined) {
    if (!roomData.type) {
      errors.push("Room type is required");
    } else if (!ROOM_TYPES.includes(roomData.type)) {
      errors.push(
        `Room type must be one of: ${ROOM_TYPES.join(", ")}`
      );
    }
  }

  // ----- Capacity -----
  if (!isUpdate || roomData.capacity !== undefined) {
    if (roomData.capacity === undefined || roomData.capacity === null) {
      errors.push("Capacity is required");
    } else if (!Number.isInteger(roomData.capacity) || roomData.capacity < 1) {
      errors.push("Capacity must be a positive integer");
    }
  }

  // ----- Price Per Night -----
  if (!isUpdate || roomData.pricePerNight !== undefined) {
    if (roomData.pricePerNight === undefined || roomData.pricePerNight === null) {
      errors.push("Price per night is required");
    } else if (typeof roomData.pricePerNight !== "number" || roomData.pricePerNight < 0) {
      errors.push("Price per night must be a positive number");
    }
  }

  // ----- Status (enum) -----
  if (roomData.status !== undefined) {
    if (!ROOM_STATUSES.includes(roomData.status)) {
      errors.push(
        `Status must be one of: ${ROOM_STATUSES.join(", ")}`
      );
    }
  }

  // ----- isAvailable (derived, but can be explicitly set) -----
  if (roomData.isAvailable !== undefined) {
    if (typeof roomData.isAvailable !== "boolean") {
      errors.push("isAvailable must be a boolean (true/false)");
    }
  }

  // ----- Amenities (optional string) -----
  if (roomData.amenities !== undefined && roomData.amenities !== null) {
    if (typeof roomData.amenities !== "string") {
      errors.push("Amenities must be a string");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

module.exports = {
  validateRoomData,
  // export constants for reuse if needed elsewhere
  ROOM_TYPES,
  ROOM_STATUSES,
};
// validation.js placeholder
/**
 * Validate room data
 * @param {Object} roomData - Room data to validate
 * @param {boolean} isUpdate - Whether this is an update (some fields optional)
 * @returns {Object} Validation result {valid: boolean, errors: string[]}
 */
function validateRoomData(roomData, isUpdate = false) {
  const errors = [];
  
  if (!isUpdate || roomData.roomNumber !== undefined) {
    if (!roomData.roomNumber || roomData.roomNumber.trim() === '') {
      errors.push('Room number is required');
    } else if (roomData.roomNumber.length > 10) {
      errors.push('Room number must be 10 characters or less');
    }
  }
  
  if (!isUpdate || roomData.type !== undefined) {
    if (!roomData.type || roomData.type.trim() === '') {
      errors.push('Room type is required');
    }
  }
  
  if (!isUpdate || roomData.capacity !== undefined) {
    if (roomData.capacity === undefined || roomData.capacity === null) {
      errors.push('Capacity is required');
    } else if (!Number.isInteger(roomData.capacity) || roomData.capacity < 1) {
      errors.push('Capacity must be a positive integer');
    }
  }
  
  if (!isUpdate || roomData.pricePerNight !== undefined) {
    if (roomData.pricePerNight === undefined || roomData.pricePerNight === null) {
      errors.push('Price per night is required');
    } else if (typeof roomData.pricePerNight !== 'number' || roomData.pricePerNight < 0) {
      errors.push('Price per night must be a positive number');
    }
  }
  
  // Optional field validation
  if (roomData.amenities !== undefined && roomData.amenities !== null) {
    if (typeof roomData.amenities !== 'string') {
      errors.push('Amenities must be a string');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

module.exports = {
  validateRoomData
};
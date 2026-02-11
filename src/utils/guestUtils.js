
/**
 * Validate guest data
 * @param {Object} guestData - Guest data to validate
 * @param {boolean} isUpdate - Whether this is an update (some fields optional)
 * @returns {Object} Validation result {valid: boolean, errors: string[]}
 */
function validateGuestData(guestData, isUpdate = false) {
  const errors = [];
  
  if (!isUpdate || guestData.fullName !== undefined) {
    if (!guestData.fullName || guestData.fullName.trim() === '') {
      errors.push('Full name is required');
    } else if (guestData.fullName.length > 100) {
      errors.push('Full name must be 100 characters or less');
    }
  }
  
  if (!isUpdate || guestData.email !== undefined) {
    if (!guestData.email || guestData.email.trim() === '') {
      errors.push('Email is required');
    } else if (!isValidEmail(guestData.email)) {
      errors.push('Valid email address is required');
    } else if (guestData.email.length > 100) {
      errors.push('Email must be 100 characters or less');
    }
  }
  
  if (!isUpdate || guestData.phone !== undefined) {
    if (!guestData.phone || guestData.phone.trim() === '') {
      errors.push('Phone number is required');
    } else if (guestData.phone.length > 20) {
      errors.push('Phone number must be 20 characters or less');
    }
  }
  
  // Optional field validations
  if (guestData.address !== undefined && guestData.address !== null) {
    if (guestData.address.length > 200) {
      errors.push('Address must be 200 characters or less');
    }
  }
  
  if (guestData.nationality !== undefined && guestData.nationality !== null) {
    if (guestData.nationality.length > 50) {
      errors.push('Nationality must be 50 characters or less');
    }
  }
  
  if (guestData.idType !== undefined && guestData.idType !== null) {
    if (guestData.idType.length > 20) {
      errors.push('ID type must be 20 characters or less');
    }
  }
  
  if (guestData.idNumber !== undefined && guestData.idNumber !== null) {
    if (guestData.idNumber.length > 50) {
      errors.push('ID number must be 50 characters or less');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
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
 * Validate phone number format
 * @param {string} phone - Phone number
 * @returns {boolean} True if valid
 */
function isValidPhone(phone) {
  // Basic phone validation - accepts numbers, spaces, dashes, plus sign
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phoneRegex.test(phone);
}

/**
 * Format guest name for display
 * @param {string} fullName - Full name
 * @returns {Object} Formatted name parts
 */
function formatGuestName(fullName) {
  const parts = fullName.trim().split(' ');
  let firstName = '';
  let lastName = '';
  
  if (parts.length === 1) {
    firstName = parts[0];
  } else if (parts.length === 2) {
    firstName = parts[0];
    lastName = parts[1];
  } else {
    firstName = parts[0];
    lastName = parts.slice(1).join(' ');
  }
  
  return {
    firstName,
    lastName,
    initials: (firstName.charAt(0) + (lastName ? lastName.charAt(0) : '')).toUpperCase()
  };
}

/**
 * Calculate guest loyalty level
 * @param {number} totalBookings - Total bookings
 * @param {number} totalSpent - Total amount spent
 * @returns {string} Loyalty level
 */
function calculateLoyaltyLevel(totalBookings, totalSpent) {
  if (totalBookings >= 10 || totalSpent >= 50000) {
    return 'Platinum';
  } else if (totalBookings >= 5 || totalSpent >= 20000) {
    return 'Gold';
  } else if (totalBookings >= 3 || totalSpent >= 10000) {
    return 'Silver';
  } else if (totalBookings >= 1) {
    return 'Bronze';
  } else {
    return 'New';
  }
}

/**
 * Generate guest ID/room key number
 * @returns {string} Guest reference number
 */
function generateGuestReference() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `GST-${timestamp}-${random}`;
}

module.exports = {
  validateGuestData,
  isValidEmail,
  isValidPhone,
  formatGuestName,
  calculateLoyaltyLevel,
  generateGuestReference
};
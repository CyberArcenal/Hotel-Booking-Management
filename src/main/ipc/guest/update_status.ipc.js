// src/main/ipc/guest/update_status.ipc.js
//@ts-check

/**
 * Guest entity currently has no 'status' field.
 * This handler is a placeholder. If you need a status (e.g. blacklist, VIP),
 * extend the Guest entity and the GuestService first.
 * 
 * @param {Object} params
 * @param {number} params.id
 * @param {string} params.status
 * @param {string} [params.user='system']
 * @returns {Promise<{status: boolean, message: string, data: null}>}
 */
module.exports = async function updateGuestStatus(params) {
  return {
    status: false,
    message: 'Guest status update is not implemented – Guest entity has no status field.',
    data: null
  };
};
const roomService = require("../../../services/Room");

/**
 * Bulk update multiple rooms.
 * @param {Object} params
 * @param {Array<{id: number, updates: Object}>} params.updates - Array of update objects.
 * @param {string} [params.user] - Username.
 * @param {import('typeorm').QueryRunner} [queryRunner] - Optional transaction runner.
 * @returns {Promise<{status: boolean, message: string, data: {success: Array, failed: Array}}>}
 */
module.exports = async function bulkUpdateRooms(params, queryRunner) {
  try {
    const { updates, user = "system" } = params;
    if (!Array.isArray(updates) || updates.length === 0) {
      throw new Error("An array of update objects is required");
    }

    await roomService.getRepository();
    // Use the existing bulkUpdate method from roomService.
    const result = await roomService.bulkUpdate(updates, user);
    return {
      status: true,
      message: `Bulk update completed: ${result.success.length} succeeded, ${result.failed.length} failed`,
      data: result,
    };
  } catch (error) {
    console.error("[bulkUpdateRooms]", error.message);
    return {
      status: false,
      message: error.message || "Failed to perform bulk update",
      data: null,
    };
  }
};

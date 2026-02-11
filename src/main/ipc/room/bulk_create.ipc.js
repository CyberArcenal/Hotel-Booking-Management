const roomService = require("../../../services/Room");

/**
 * Create multiple rooms in a single operation.
 * @param {Object} params
 * @param {Array<Object>} params.rooms - Array of room data objects.
 * @param {string} [params.user] - Username.
 * @param {import('typeorm').QueryRunner} [queryRunner] - Optional transaction runner.
 * @returns {Promise<{status: boolean, message: string, data: {success: Array, failed: Array}}>}
 */
module.exports = async function bulkCreateRooms(params, queryRunner) {
  try {
    const { rooms, user = "system" } = params;
    if (!Array.isArray(rooms) || rooms.length === 0) {
      throw new Error("An array of room data is required");
    }

    await roomService.getRepository();
    const results = { success: [], failed: [] };

    for (const roomData of rooms) {
      try {
        const newRoom = await roomService.create(roomData, user);
        results.success.push({
          id: newRoom.id,
          roomNumber: newRoom.roomNumber,
        });
      } catch (error) {
        results.failed.push({ data: roomData, error: error.message });
      }
    }

    return {
      status: true,
      message: `Bulk create finished: ${results.success.length} succeeded, ${results.failed.length} failed`,
      data: results,
    };
  } catch (error) {
    console.error("[bulkCreateRooms]", error.message);
    return {
      status: false,
      message: error.message || "Failed to perform bulk create",
      data: null,
    };
  }
};

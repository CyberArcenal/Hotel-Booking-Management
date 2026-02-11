// src/main/ipc/dashboard/generate/report.ipc.js
const reportService = require("../../../../services/Report");

/**
 * Generate and export a report (PDF/CSV)
 * @param {Object} params
 * @param {string} params.reportType - e.g. 'financial_summary', 'occupancy_report', ...
 * @param {Object} params.parameters - Report‑specific parameters
 * @param {string} [params.format='pdf'] - 'pdf' or 'csv'
 * @param {string} [params.user='system'] - User who requested the report
 * @returns {Promise<{status: boolean, data: Object, message: string}>}
 */
module.exports = async (params = {}) => {
  try {
    const { reportType, parameters, format = "pdf", user = "system" } = params;

    // --- Validation ---
    if (!reportType) {
      return {
        status: false,
        data: null,
        message: "reportType is required",
      };
    }
    if (!parameters || typeof parameters !== "object") {
      return {
        status: false,
        data: null,
        message: "parameters object is required",
      };
    }
    const validFormats = ["pdf", "csv"];
    if (!validFormats.includes(format.toLowerCase())) {
      return {
        status: false,
        data: null,
        message: `format must be one of: ${validFormats.join(", ")}`,
      };
    }

    const data = await reportService.generateReport(
      reportType,
      parameters,
      format.toLowerCase(),
      user
    );

    return {
      status: true,
      data,
      message: `Report '${reportType}' generated successfully`,
    };
  } catch (error) {
    console.error("[generateReport] Error:", error.message);
    return {
      status: false,
      data: null,
      message: error.message || "Failed to generate report",
    };
  }
};
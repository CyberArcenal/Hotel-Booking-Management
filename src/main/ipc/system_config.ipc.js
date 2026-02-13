// electron-app/main/ipc/handlers/systemConfig.js
const { ipcMain } = require("electron");
const path = require("path");
const { logger } = require("../../utils/logger");
const { AppDataSource } = require("../db/datasource");
const { SettingType, SystemSetting } = require("../../entities/systemSettings");
const { saveDb, updateDb, removeDb } = require("../../utils/dbUtils/dbActions");

class SystemConfigHandler {
  constructor() {
    this._settingsCache = null;
    this._lastCacheUpdate = null;
    this._CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
    this.systemSettingRepository = null;
    this.initializeRepository();
  }

  async initializeRepository() {
    try {
      this.systemSettingRepository = AppDataSource.getRepository(SystemSetting);
      console.log("✅ SystemConfigHandler repository initialized");
    } catch (error) {
      console.error("❌ Failed to initialize repository:", error);
    }
  }

  // ✅ Normalize boolean value to 0/1 for database (for is_public/is_deleted)
  normalizeBoolean(value) {
    if (value === null || value === undefined) return 0;
    if (typeof value === "boolean") return value ? 1 : 0;
    if (typeof value === "number") return value ? 1 : 0;
    if (typeof value === "string") {
      const str = value.toString().toLowerCase().trim();
      if (str === "true" || str === "1" || str === "yes") return 1;
      if (str === "false" || str === "0" || str === "no") return 0;
    }
    return 0;
  }

  // ✅ Convert database boolean (0/1) to JavaScript boolean
  dbToBoolean(value) {
    if (value === null || value === undefined) return false;
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value === 1;
    if (typeof value === "string") {
      return value === "1" || value.toLowerCase() === "true";
    }
    return false;
  }

  // ---------- 🆕 NORMALIZATION PARA SA MGA VALUE NA IISA-SAVE ----------
  _normalizeValueForDb(value) {
    if (value === null || value === undefined) return '';
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    if (typeof value === 'object') {
      try {
        return JSON.stringify(value);
      } catch (e) {
        logger.error('Failed to stringify object for DB', e);
        return String(value);
      }
    }
    if (typeof value === 'number') return String(value);
    return String(value); // string or other
  }

  // ---------- 🆕 DESERIALIZE VALUE MULA SA DATABASE ----------
  _deserializeValue(value) {
    if (value === null || value === undefined) return null;
    if (typeof value !== 'string') return value;

    const trimmed = value.trim();
    
    // 1. JSON object / array
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) ||
        (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      try {
        return JSON.parse(trimmed);
      } catch {
        // ignore, continue
      }
    }

    // 2. Boolean strings
    if (trimmed === 'true') return true;
    if (trimmed === 'false') return false;

    // 3. Numeric strings
    if (/^-?\d+(\.\d+)?$/.test(trimmed) && !isNaN(Number(trimmed))) {
      return Number(trimmed);
    }

    // 4. Plain string
    return value;
  }

  // ----------------------------------------------------------------

  async handleRequest(event, payload) {
    try {
      const method = payload.method;
      const params = payload.params || {};
      const userId = payload.userId || 1;

      logger.info(`SystemConfigHandler: ${method}`, params);

      switch (method) {
        case "getGroupedConfig":
          return await this.getGroupedConfig();
        case "updateGroupedConfig":
          return await this.updateGroupedConfig(params.configData, userId);
        case "getSystemInfo":
          return await this.getSystemInfo();
        case "getAllSettings":
          return await this.getAllSettings();
        case "getPublicSettings":
          return await this.getPublicSettings();
        case "getSettingByKey":
          return await this.getSettingByKey(params.key, params.settingType);
        case "createSetting":
          return await this.createSetting(params.settingData, userId);
        case "updateSetting":
          return await this.updateSetting(params.id, params.settingData, userId);
        case "deleteSetting":
          return await this.deleteSetting(params.id, userId);
        case "getByType":
          return await this.getByType(params.settingType);
        case "getValueByKey":
          return await this.getValueByKey(params.key, params.defaultValue);
        case "setValueByKey":
          return await this.setValueByKey(params.key, params.value, params.options, userId);
        case "bulkUpdate":
          return await this.bulkUpdate(params.settingsData, userId);
        case "bulkDelete":
          return await this.bulkDelete(params.ids, userId);
        case "getSettingsStats":
          return await this.getSettingsStats();
        case "getTaxSettings":
          return await this.getTaxSettings();
        case "getEmailSettings":
          return await this.getEmailSettings();
        case "getSystemInfoForFrontend":
          return await this.getSystemInfoForFrontend();
        default:
          return {
            status: false,
            message: `Unknown method: ${method}`,
            data: null,
          };
      }
    } catch (error) {
      logger.error("SystemConfigHandler error:", error);
      return {
        status: false,
        message: error.message,
        data: null,
      };
    }
  }

  // ----------------------------------------------------------------
  // PUBLIC API METHODS
  // ----------------------------------------------------------------

  async getSystemInfoForFrontend() {
    console.log(`🌐 getSystemInfoForFrontend called`);
    try {
      const [publicSettings, systemInfo] = await Promise.all([
        this.getPublicSettings(),
        this.getSystemInfo(),
      ]);

      const frontendInfo = {
        system_info: systemInfo.data ? systemInfo.data : {},
        public_settings: publicSettings.data ? publicSettings.data : [],
        cache_timestamp: new Date().toISOString(),
      };

      const serializedInfo = JSON.parse(JSON.stringify(frontendInfo));
      console.log(`✅ getSystemInfoForFrontend successful`);
      return {
        status: true,
        message: "Frontend system info fetched successfully",
        data: serializedInfo,
      };
    } catch (error) {
      console.error("❌ getSystemInfoForFrontend error:", error);
      logger.error("getSystemInfoForFrontend error:", error);
      return {
        status: false,
        message: error?.message || "Failed to fetch system info",
        data: {
          system_info: {},
          public_settings: [],
          cache_timestamp: new Date().toISOString(),
        },
      };
    }
  }

  async getGroupedConfig() {
    try {
      if (this._isCacheValid()) {
        return {
          status: true,
          message: "System configuration retrieved from cache",
          data: this._settingsCache,
        };
      }

      if (!this.systemSettingRepository) await this.initializeRepository();

      const settings = await this.systemSettingRepository.find({
        where: { is_deleted: false },
      });

      if (!settings || settings.length === 0) {
        return {
          status: true,
          message: "No system settings found",
          data: {
            settings: [],
            grouped_settings: {},
            system_info: await this._getSystemInfo(),
          },
        };
      }

      // 1. I-serialize ang bawat setting (dito na ginagawa ang deserialize ng value)
      const serializedSettings = await this._serializeSettingsWithBooleanConversion(settings);
      
      // 2. I-group ang settings gamit ang na-deserialize nang values
      const groupedSettings = this._groupSettingsFromSerialized(serializedSettings);

      const result = {
        settings: serializedSettings,
        grouped_settings: groupedSettings,
        system_info: await this._getSystemInfo(),
      };

      this._updateCache(result);
      logger.info("Get system data", result);

      return {
        status: true,
        message: "System configuration retrieved successfully",
        data: result,
      };
    } catch (error) {
      logger.error("getGroupedConfig error:", error);
      return {
        status: false,
        message: `Failed to retrieve system configuration: ${error.message}`,
        data: null,
      };
    }
  }

  async updateGroupedConfig(configData, userId = 1) {
    try {
      console.log("📥 Received configData type:", typeof configData);
      console.log("📥 Received configData:", configData);

      if (!configData) {
        logger.warn("Empty configuration data received");
        return { status: false, message: "Empty configuration data", data: null };
      }

      // Handle possible double‑wrapping
      if (typeof configData === "string") {
        try {
          configData = JSON.parse(configData);
          console.log("✅ Successfully parsed string to object");
        } catch (err) {
          logger.error("Invalid JSON string received", err);
          return { status: false, message: "Invalid JSON string format", data: null };
        }
      }

      if (typeof configData === "object" && configData.configData) {
        if (typeof configData.configData === "string") {
          try {
            configData = JSON.parse(configData.configData);
          } catch (err) {
            logger.error("Invalid JSON in configData property", err);
            return { status: false, message: "Invalid JSON in configData property", data: null };
          }
        } else {
          configData = configData.configData;
        }
      }

      logger.info("Updating system configuration with data", {
        configDataType: typeof configData,
        configDataKeys: Object.keys(configData),
      });

      if (!configData || typeof configData !== "object" || Array.isArray(configData)) {
        logger.warn("Invalid final configuration data format", { type: typeof configData, configData });
        return { status: false, message: "Invalid configuration data format after parsing", data: null };
      }

      if (Object.keys(configData).length === 0) {
        logger.warn("Empty final configuration data");
        return { status: false, message: "Empty configuration data after parsing", data: null };
      }

      console.log("✅ Final configData to process:", configData);

      const updateResult = await this._updateGroupedSettingsWithBooleanNormalization(configData, userId);
      this._clearCache();
      const systemData = await this.getGroupedConfig();

      logger.info("System configuration updated successfully", {
        updatedCategories: Object.keys(configData),
        updatedSettingsCount: updateResult.updatedSettings.length,
        errorsCount: updateResult.errors.length,
        cacheCleared: true,
      });

      return {
        status: true,
        message: "System configuration updated successfully",
        data: systemData.data,
        details: {
          updated: updateResult.updatedSettings,
          errors: updateResult.errors,
        },
      };
    } catch (error) {
      logger.error("updateGroupedConfig error", error);
      return {
        status: false,
        message: `Failed to update system configuration: ${error.message}`,
        data: null,
      };
    }
  }

  async getSystemInfo() {
    try {
      const systemInfo = await this._getSystemInfo();
      return {
        status: true,
        message: "System information retrieved successfully",
        data: systemInfo,
      };
    } catch (error) {
      logger.error("getSystemInfo error:", error);
      return {
        status: false,
        message: `Failed to retrieve system information: ${error.message}`,
        data: null,
      };
    }
  }

  async getAllSettings() {
    try {
      if (!this.systemSettingRepository) await this.initializeRepository();
      const settings = await this.systemSettingRepository.find({
        where: { is_deleted: false },
      });
      const serializedSettings = await this._serializeSettingsWithBooleanConversion(settings);
      return {
        status: true,
        message: "All system settings retrieved successfully",
        data: serializedSettings,
      };
    } catch (error) {
      logger.error("getAllSettings error:", error);
      return {
        status: false,
        message: `Failed to retrieve system settings: ${error.message}`,
        data: null,
      };
    }
  }

  async getPublicSettings() {
    try {
      if (!this.systemSettingRepository) await this.initializeRepository();
      const settings = await this.systemSettingRepository.find({
        where: { is_public: true, is_deleted: false },
      });
      const serializedSettings = await this._serializeSettingsWithBooleanConversion(settings);
      return {
        status: true,
        message: "Public system settings retrieved successfully",
        data: serializedSettings,
      };
    } catch (error) {
      logger.error("getPublicSettings error:", error);
      return {
        status: false,
        message: `Failed to retrieve public settings: ${error.message}`,
        data: null,
      };
    }
  }

  async getSettingByKey(key, settingType = null) {
    try {
      if (!key) return { status: false, message: "Setting key is required", data: null };
      if (!this.systemSettingRepository) await this.initializeRepository();

      const whereClause = { key, is_deleted: false };
      if (settingType) whereClause.setting_type = settingType;

      const setting = await this.systemSettingRepository.findOne({ where: whereClause });
      if (!setting) return { status: true, message: "Setting not found", data: null };

      const serializedSetting = await this._serializeSettingWithBooleanConversion(setting);
      return {
        status: true,
        message: "Setting retrieved successfully",
        data: serializedSetting,
      };
    } catch (error) {
      logger.error("getSettingByKey error:", error);
      return {
        status: false,
        message: `Failed to retrieve setting: ${error.message}`,
        data: null,
      };
    }
  }

  async createSetting(settingData, userId = 1) {
    try {
      if (!settingData) return { status: false, message: "Setting data is required", data: null };
      if (!settingData.key || !settingData.setting_type) {
        return { status: false, message: "Key and setting_type are required", data: null };
      }

      if (!this.systemSettingRepository) await this.initializeRepository();

      // ✅ Normalize value bago i-save
      if (settingData.value !== undefined) {
        settingData.value = this._normalizeValueForDb(settingData.value);
      }

      // Normalize boolean fields
      if (settingData.is_public !== undefined) {
        settingData.is_public = this.normalizeBoolean(settingData.is_public) === 1;
      }
      if (settingData.is_deleted !== undefined) {
        settingData.is_deleted = this.normalizeBoolean(settingData.is_deleted) === 1;
      }

      const newSetting = this.systemSettingRepository.create(settingData);
      const createdSetting = await saveDb(this.systemSettingRepository, newSetting);

      this._clearCache();

      const serializedSetting = await this._serializeSettingWithBooleanConversion(createdSetting);
      return {
        status: true,
        message: "Setting created successfully",
        data: serializedSetting,
      };
    } catch (error) {
      logger.error("createSetting error:", error);
      return {
        status: false,
        message: `Failed to create setting: ${error.message}`,
        data: null,
      };
    }
  }

  async updateSetting(id, settingData, userId = 1) {
    try {
      if (!id || !settingData) {
        return { status: false, message: "ID and setting data are required", data: null };
      }
      if (!this.systemSettingRepository) await this.initializeRepository();

      const existingSetting = await this.systemSettingRepository.findOne({
        where: { id, is_deleted: false },
      });
      if (!existingSetting) return { status: false, message: "Setting not found", data: null };

      // ✅ Normalize value
      if (settingData.value !== undefined) {
        settingData.value = this._normalizeValueForDb(settingData.value);
      }

      // Normalize boolean fields
      if (settingData.is_public !== undefined) {
        settingData.is_public = this.normalizeBoolean(settingData.is_public) === 1;
      }
      if (settingData.is_deleted !== undefined) {
        settingData.is_deleted = this.normalizeBoolean(settingData.is_deleted) === 1;
      }

      this.systemSettingRepository.merge(existingSetting, settingData);
      existingSetting.updated_at = new Date();

      const updatedSetting = await updateDb(this.systemSettingRepository, existingSetting);
      this._clearCache();

      const serializedSetting = await this._serializeSettingWithBooleanConversion(updatedSetting);
      return {
        status: true,
        message: "Setting updated successfully",
        data: serializedSetting,
      };
    } catch (error) {
      logger.error("updateSetting error:", error);
      return {
        status: false,
        message: `Failed to update setting: ${error.message}`,
        data: null,
      };
    }
  }

  async deleteSetting(id, userId = 1) {
    try {
      if (!id) return { status: false, message: "Setting ID is required", data: null };
      if (!this.systemSettingRepository) await this.initializeRepository();

      const setting = await this.systemSettingRepository.findOne({
        where: { id, is_deleted: false },
      });
      if (!setting) return { status: false, message: "Setting not found", data: null };

      setting.is_deleted = true;
      setting.updated_at = new Date();
      await removeDb(this.systemSettingRepository, setting);

      this._clearCache();
      return {
        status: true,
        message: "Setting deleted successfully",
        data: null,
      };
    } catch (error) {
      logger.error("deleteSetting error:", error);
      return {
        status: false,
        message: `Failed to delete setting: ${error.message}`,
        data: null,
      };
    }
  }

  async getByType(settingType) {
    try {
      if (!settingType) return { status: false, message: "Setting type is required", data: null };
      if (!this.systemSettingRepository) await this.initializeRepository();

      const settings = await this.systemSettingRepository.find({
        where: { setting_type: settingType, is_deleted: false },
      });
      const serializedSettings = await this._serializeSettingsWithBooleanConversion(settings);
      return {
        status: true,
        message: `Settings of type ${settingType} retrieved successfully`,
        data: serializedSettings,
      };
    } catch (error) {
      logger.error("getByType error:", error);
      return {
        status: false,
        message: `Failed to retrieve settings by type: ${error.message}`,
        data: null,
      };
    }
  }

  async getValueByKey(key, defaultValue = null) {
    try {
      if (!key) return { status: false, message: "Key is required", data: null };
      const result = await this.getSettingByKey(key);
      if (result.status && result.data) {
        return {
          status: true,
          message: "Value retrieved successfully",
          data: result.data.value, // ← deserialized na ito
        };
      }
      return {
        status: true,
        message: "Using default value",
        data: defaultValue,
      };
    } catch (error) {
      logger.error("getValueByKey error:", error);
      return {
        status: false,
        message: `Failed to retrieve value: ${error.message}`,
        data: null,
      };
    }
  }

  async setValueByKey(key, value, options = {}, userId = 1) {
    try {
      if (!key) return { status: false, message: "Key is required", data: null };
      if (!this.systemSettingRepository) await this.initializeRepository();

      // ✅ Normalize value bago i-save
      const normalizedValue = this._normalizeValueForDb(value);

      // Normalize boolean fields in options
      if (options.is_public !== undefined) {
        options.is_public = this.normalizeBoolean(options.is_public) === 1;
      }

      const settingType = options.setting_type || "general";
      const existing = await this.systemSettingRepository.findOne({
        where: { key, setting_type: settingType, is_deleted: false },
      });

      let setting;
      if (existing) {
        existing.value = normalizedValue;
        if (options.is_public !== undefined) existing.is_public = options.is_public;
        if (options.description !== undefined) existing.description = options.description;
        existing.updated_at = new Date();
        setting = await updateDb(this.systemSettingRepository, existing);
      } else {
        const newSetting = this.systemSettingRepository.create({
          key,
          value: normalizedValue,
          setting_type: settingType,
          description: options.description || `Auto-generated setting for ${key}`,
          is_public: options.is_public || false,
          is_deleted: false,
        });
        setting = await saveDb(this.systemSettingRepository, newSetting);
      }

      this._clearCache();
      const serializedSetting = setting ? await this._serializeSettingWithBooleanConversion(setting) : null;
      return {
        status: true,
        message: "Value set successfully",
        data: serializedSetting,
      };
    } catch (error) {
      logger.error("setValueByKey error:", error);
      return {
        status: false,
        message: `Failed to set value: ${error.message}`,
        data: null,
      };
    }
  }

  async bulkUpdate(settingsData, userId = 1) {
    try {
      if (!settingsData || !Array.isArray(settingsData) || settingsData.length === 0) {
        return { status: false, message: "Settings data array is required", data: null };
      }
      if (!this.systemSettingRepository) await this.initializeRepository();

      const results = [];
      for (const settingData of settingsData) {
        try {
          // ✅ Normalize value
          if (settingData.value !== undefined) {
            settingData.value = this._normalizeValueForDb(settingData.value);
          }

          const normalizedSetting = {
            ...settingData,
            is_public: settingData.is_public !== undefined
              ? this.normalizeBoolean(settingData.is_public) === 1
              : undefined,
            is_deleted: settingData.is_deleted !== undefined
              ? this.normalizeBoolean(settingData.is_deleted) === 1
              : undefined,
          };

          const existing = await this.systemSettingRepository.findOne({
            where: { key: normalizedSetting.key, setting_type: normalizedSetting.setting_type, is_deleted: false },
          });

          if (existing) {
            this.systemSettingRepository.merge(existing, normalizedSetting);
            existing.updated_at = new Date();
            await updateDb(this.systemSettingRepository, existing);
            results.push({ success: true, id: existing.id, action: "updated" });
          } else {
            const newSetting = this.systemSettingRepository.create(normalizedSetting);
            const created = await updateDb(this.systemSettingRepository, newSetting);
            results.push({ success: true, id: created.id, action: "created" });
          }
        } catch (error) {
          results.push({ success: false, key: settingData.key, error: error.message });
        }
      }

      this._clearCache();
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      return {
        status: true,
        message: `Bulk update completed: ${successful} successful, ${failed} failed`,
        data: results,
      };
    } catch (error) {
      logger.error("bulkUpdate error:", error);
      return {
        status: false,
        message: `Failed to bulk update settings: ${error.message}`,
        data: null,
      };
    }
  }

  async bulkDelete(ids, userId = 1) {
    try {
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return { status: false, message: "Setting IDs array is required", data: null };
      }
      if (!this.systemSettingRepository) await this.initializeRepository();

      const results = [];
      for (const id of ids) {
        try {
          const setting = await this.systemSettingRepository.findOne({
            where: { id, is_deleted: false },
          });
          if (setting) {
            setting.is_deleted = true;
            setting.updated_at = new Date();
            await updateDb(this.systemSettingRepository, setting);
            results.push({ success: true, id });
          } else {
            results.push({ success: false, id, error: "Setting not found" });
          }
        } catch (error) {
          results.push({ success: false, id, error: error.message });
        }
      }

      this._clearCache();
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      return {
        status: true,
        message: `Bulk delete completed: ${successful} successful, ${failed} failed`,
        data: results,
      };
    } catch (error) {
      logger.error("bulkDelete error:", error);
      return {
        status: false,
        message: `Failed to bulk delete settings: ${error.message}`,
        data: null,
      };
    }
  }

  async getSettingsStats() {
    try {
      if (!this.systemSettingRepository) await this.initializeRepository();

      const total = await this.systemSettingRepository.count({
        where: { is_deleted: false },
      });

      const byType = await this.systemSettingRepository
        .createQueryBuilder("setting")
        .select("setting.setting_type", "type")
        .addSelect("COUNT(*)", "count")
        .where("setting.is_deleted = :is_deleted", { is_deleted: false })
        .groupBy("setting.setting_type")
        .getRawMany();

      const publicCount = await this.systemSettingRepository.count({
        where: { is_public: true, is_deleted: false },
      });

      const stats = {
        total,
        by_type: byType.reduce((acc, item) => {
          acc[item.type] = parseInt(item.count);
          return acc;
        }, {}),
        public_count: publicCount,
        private_count: total - publicCount,
        timestamp: new Date().toISOString(),
      };

      return {
        status: true,
        message: "Settings statistics retrieved successfully",
        data: stats,
      };
    } catch (error) {
      logger.error("getSettingsStats error:", error);
      return {
        status: false,
        message: `Failed to retrieve settings statistics: ${error.message}`,
        data: null,
      };
    }
  }

  async getTaxSettings() {
    try {
      if (!this.systemSettingRepository) await this.initializeRepository();
      const settings = await this.systemSettingRepository.find({
        where: { setting_type: "tax", is_deleted: false },
      });
      const groupedSettings = await this._groupSettingsWithBooleanConversion(settings);
      return {
        status: true,
        message: "Tax settings retrieved successfully",
        data: groupedSettings.tax || {},
      };
    } catch (error) {
      logger.error("getTaxSettings error:", error);
      return {
        status: false,
        message: `Failed to retrieve tax settings: ${error.message}`,
        data: null,
      };
    }
  }

  async getEmailSettings() {
    try {
      if (!this.systemSettingRepository) await this.initializeRepository();
      const settings = await this.systemSettingRepository.find({
        where: { setting_type: "email", is_deleted: false },
      });
      const groupedSettings = await this._groupSettingsWithBooleanConversion(settings);
      return {
        status: true,
        message: "Email settings retrieved successfully",
        data: groupedSettings.email || {},
      };
    } catch (error) {
      logger.error("getEmailSettings error:", error);
      return {
        status: false,
        message: `Failed to retrieve email settings: ${error.message}`,
        data: null,
      };
    }
  }

  // ----------------------------------------------------------------
  // PRIVATE METHODS
  // ----------------------------------------------------------------

  /**
   * I-group ang settings mula sa serialized array (deserialized values na)
   */
  _groupSettingsFromSerialized(serializedSettings) {
    const grouped = {};
    if (serializedSettings && Array.isArray(serializedSettings)) {
      serializedSettings.forEach(setting => {
        if (!grouped[setting.setting_type]) grouped[setting.setting_type] = {};
        grouped[setting.setting_type][setting.key] = setting.value; // deserialized na ito
      });
    }
    return grouped;
  }

  /**
   * (Retained for backward compatibility, pero gagamitin ang _deserializeValue)
   */
  async _groupSettingsWithBooleanConversion(settings) {
    const grouped = {};
    if (settings && Array.isArray(settings)) {
      settings.forEach(setting => {
        if (!grouped[setting.setting_type]) grouped[setting.setting_type] = {};
        grouped[setting.setting_type][setting.key] = this._deserializeValue(setting.value);
      });
    }
    return grouped;
  }

  async _serializeSettingsWithBooleanConversion(settings) {
    if (!settings || !Array.isArray(settings)) return [];
    const serialized = [];
    for (const setting of settings) {
      const s = await this._serializeSettingWithBooleanConversion(setting);
      if (s) serialized.push(s);
    }
    return serialized;
  }

  async _serializeSettingWithBooleanConversion(setting) {
    if (!setting) return null;
    return {
      id: setting.id,
      key: setting.key,
      value: this._deserializeValue(setting.value), // ← deserialized na!
      setting_type: setting.setting_type,
      description: setting.description || "",
      is_public: this.dbToBoolean(setting.is_public),
      is_deleted: this.dbToBoolean(setting.is_deleted),
      created_at: setting.created_at,
      updated_at: setting.updated_at,
    };
  }

  async _updateGroupedSettingsWithBooleanNormalization(configData, userId = 1) {
    const updatedSettings = [];
    const errors = [];

    for (const [category, settingsDict] of Object.entries(configData)) {
      for (const [key, value] of Object.entries(settingsDict)) {
        if (!key || value === undefined || value === null) {
          errors.push({ category, key, error: "Invalid key/value" });
          continue;
        }

        try {
          const options = {
            setting_type: category,
            description: `Auto-generated ${category} setting for ${key}`,
            is_public: false,
          };

          const existing = await this.systemSettingRepository.findOne({
            where: { key, setting_type: category, is_deleted: false },
          });

          const oldValue = existing ? existing.value : null;

          // ✅ Diretso ipasa ang value – si setValueByKey na ang bahala mag-normalize
          const result = await this.setValueByKey(key, value, options, userId);

          if (result.status && result.data) {
            updatedSettings.push({
              id: result.data.id,
              setting_type: category,
              key,
              oldValue,
              newValue: result.data.value, // deserialized na ito
              created: !existing,
            });
          }

          logger.info("Setting updated", {
            category,
            key,
            oldValue,
            newValue: value,
            created: !existing,
          });
        } catch (error) {
          logger.error(`Failed to update setting ${category}.${key}`, error);
          errors.push({ category, key, error: error.message });
        }
      }
    }

    return {
      updatedSettings,
      errors,
      summary: {
        totalUpdated: updatedSettings.length,
        categories: [...new Set(updatedSettings.map(s => s.setting_type))],
      },
    };
  }

  async _getSystemInfo() {
    return {
      version: "1.0.0",
      name: "Electron POS System",
      environment: "production",
      debug_mode: process.env.NODE_ENV === "development",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      current_time: new Date().toISOString(),
      setting_types: Object.values(SettingType),
    };
  }

  _isCacheValid() {
    if (!this._settingsCache || !this._lastCacheUpdate) return false;
    return Date.now() - this._lastCacheUpdate < this._CACHE_DURATION;
  }

  _updateCache(data) {
    this._settingsCache = data;
    this._lastCacheUpdate = Date.now();
  }

  _clearCache() {
    this._settingsCache = null;
    this._lastCacheUpdate = null;
  }
}

const systemConfigHandler = new SystemConfigHandler();

if (ipcMain) {
  ipcMain.handle("systemConfig", async (event, payload) => {
    return await systemConfigHandler.handleRequest(event, payload);
  });
} else {
  logger.warn("ipcMain is not available - running in non-Electron environment");
}

module.exports = { SystemConfigHandler, systemConfigHandler };
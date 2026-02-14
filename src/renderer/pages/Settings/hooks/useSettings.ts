// src/renderer/pages/Settings/hooks/useSettings.ts
import { useState, useEffect, useCallback } from "react";
import systemConfigAPI, {
  type GroupedSettingsData,
  type SystemInfoData,
  type GeneralSettings,
  type BookingSettings,
  type RoomSettings,
  type NotificationSettings,
  type SystemSettings,
} from "../../../api/system_config";
import { dialogs } from "../../../utils/dialogs";

// Defaults for every category – ensures no empty tab
const DEFAULT_GENERAL: GeneralSettings = {
  company_name: "Hotel Management",
  currency: "USD",
  language: "en",
  timezone: "Asia/Manila",
};

const DEFAULT_BOOKING: BookingSettings = {
  default_checkin_time: "14:00",
  default_checkout_time: "12:00",
  cancellation_window_hours: 24,
  auto_assign_rooms: false,
  default_booking_status: "pending",
};

const DEFAULT_ROOM: RoomSettings = {
  max_occupancy_per_type: { single: 2, double: 4, suite: 6 },
  maintenance_mode: false,
  default_pricing_rules: { single: 100, double: 150, suite: 250 },
};

const DEFAULT_NOTIFICATION: NotificationSettings = {
  enable_email_alerts: false,
  enable_sms_alerts: false,
  admin_alerts: false,
  reminder_interval_hours: 24,

  smtp_host: "smtp.gmail.com",
  smtp_port: 587,
  smtp_username: "",
  smtp_password: "",
  smtp_use_ssl: false,
  smtp_from_email: "",
  smtp_from_name: "",

  // ✨ Twilio defaults (empty)
  twilio_account_sid: "",
  twilio_auth_token: "",
  twilio_phone_number: "",
  twilio_messaging_service_sid: "",
};

const DEFAULT_SYSTEM: SystemSettings = {
  debug_mode: false,
  environment: "development",
  audit_trail_enabled: true,
};

export const useSettings = () => {
  const [groupedConfig, setGroupedConfig] = useState<
    GroupedSettingsData["grouped_settings"]
  >({
    general: DEFAULT_GENERAL,
    booking: DEFAULT_BOOKING,
    room: DEFAULT_ROOM,
    notification: DEFAULT_NOTIFICATION,
    system: DEFAULT_SYSTEM,
  });
  const [systemInfo, setSystemInfo] = useState<SystemInfoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch settings on mount
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const configRes = await systemConfigAPI.getGroupedConfig();
      if (configRes.status && configRes.data) {
        const apiSettings = configRes.data.grouped_settings;
        setGroupedConfig({
          general: { ...DEFAULT_GENERAL, ...apiSettings.general },
          booking: { ...DEFAULT_BOOKING, ...apiSettings.booking },
          room: { ...DEFAULT_ROOM, ...apiSettings.room },
          notification: {
            ...DEFAULT_NOTIFICATION,
            ...apiSettings.notification,
          },
          system: { ...DEFAULT_SYSTEM, ...apiSettings.system },
        });
      }
      const infoRes = await systemConfigAPI.getSystemInfo();
      if (infoRes.status && infoRes.data) {
        setSystemInfo(infoRes.data);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  // Generic field updater
  const updateCategoryField = useCallback(
    <C extends keyof GroupedSettingsData["grouped_settings"]>(
      category: C,
      field: keyof GroupedSettingsData["grouped_settings"][C],
      value: any,
    ) => {
      setGroupedConfig((prev) => ({
        ...prev,
        [category]: {
          ...prev[category],
          [field]: value,
        },
      }));
    },
    [],
  );

  // Category-specific updaters (for easier use in components)
  const updateGeneral = (field: keyof GeneralSettings, value: any) =>
    updateCategoryField("general", field, value);
  const updateBooking = (field: keyof BookingSettings, value: any) =>
    updateCategoryField("booking", field, value);
  const updateRoom = (field: keyof RoomSettings, value: any) =>
    updateCategoryField("room", field, value);
  const updateNotification = (field: keyof NotificationSettings, value: any) =>
    updateCategoryField("notification", field, value);
  const updateSystem = (field: keyof SystemSettings, value: any) =>
    updateCategoryField("system", field, value);

  // Save all categories that have been modified (or simply all)
  const saveSettings = async () => {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const categories = [
        "general",
        "booking",
        "room",
        "notification",
        "system",
      ] as const;
      for (const category of categories) {
        await systemConfigAPI.updateGroupedConfig({
          [category]: groupedConfig[category],
        });
      }
      setSuccessMessage("Settings saved successfully");
      fetchSettings(); // refresh to get latest timestamps etc.
    } catch (err: any) {
      setError(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = async () => {
    if (
      !(await dialogs.confirm({
        message:
          "Are you sure you want to reset all settings to default values? This cannot be undone.",
        title: "Reset Settings",
      }))
    )
      return;
    setLoading(true);
    try {
      await systemConfigAPI.resetToDefaults();
      setSuccessMessage("Settings reset to defaults");
      fetchSettings();
    } catch (err: any) {
      setError(err.message || "Failed to reset settings");
    } finally {
      setLoading(false);
    }
  };

  const exportSettings = async () => {
    try {
      const jsonStr = await systemConfigAPI.exportSettingsToFile();
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `settings-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setSuccessMessage("Settings exported successfully");
    } catch (err: any) {
      setError(err.message || "Failed to export settings");
    }
  };

  const importSettings = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        await systemConfigAPI.importSettingsFromFile(content);
        setSuccessMessage("Settings imported successfully");
        fetchSettings();
      } catch (err: any) {
        setError(err.message || "Failed to import settings");
      }
    };
    reader.readAsText(file);
  };

  const testSmtpConnection = async () => {
    try {
      if (!window.backendAPI?.systemConfig) {
        throw new Error("Electron API not available");
      }
      const response = await window.backendAPI.systemConfig({
        method: "testSmtpConnection",
        params: { settings: groupedConfig.notification },
      });
      if (response.status) {
        setSuccessMessage("SMTP connection successful");
      } else {
        setError(response.message || "SMTP connection failed");
      }
    } catch (err: any) {
      setError(err.message || "Failed to test SMTP connection");
    }
  };

  const testSmsConnection = async () => {
    try {
      if (!window.backendAPI?.systemConfig) {
        throw new Error("Electron API not available");
      }
      const response = await window.backendAPI.systemConfig({
        method: "testSmsConnection",
        params: { settings: groupedConfig.notification },
      });
      if (response.status) {
        setSuccessMessage("SMS (Twilio) connection successful");
      } else {
        setError(response.message || "SMS connection failed");
      }
    } catch (err: any) {
      setError(err.message || "Failed to test SMS connection");
    }
  };

  return {
    groupedConfig,
    systemInfo,
    loading,
    saving,
    error,
    successMessage,
    setError,
    setSuccessMessage,
    updateGeneral,
    updateBooking,
    updateRoom,
    updateNotification,
    updateSystem,
    saveSettings,
    resetToDefaults,
    exportSettings,
    importSettings,
    refetch: fetchSettings,
    testSmtpConnection,
    testSmsConnection,
  };
};

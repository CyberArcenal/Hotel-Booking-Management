// src/renderer/pages/Settings/index.tsx
import React, { useState } from 'react';
import { useSettings } from './hooks/useSettings';
import SettingsHeader from './components/SettingsHeader';
import { SettingType } from '../../api/system_config';
import SystemInfoCard from './components/SystemInfoCard';
import SettingsTabs from './components/SettingsTabs';
import GeneralTab from './components/GeneralTab';
import BookingTab from './components/BookingTab';
import RoomTab from './components/RoomTab';
import NotificationTab from './components/NotificationTab';
import SystemTab from './components/SystemTab';

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingType>('general');
  const {
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
    refetch,
    testSmtpConnection,
    testSmsConnection,
  } = useSettings();

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      importSettings(file);
      e.target.value = '';
    }
  };

  if (loading && !groupedConfig) {
    return (
      <div className="min-h-screen bg-[var(--background-color)] flex items-center justify-center">
        <div className="text-[var(--text-primary)]">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background-color)]">
      <main className="mx-auto px-2 py-2">
        <SettingsHeader
          onSave={saveSettings}
          onReset={resetToDefaults}
          onExport={exportSettings}
          onImport={handleImport}
          saving={saving}
        />

        {/* Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto underline">Dismiss</button>
          </div>
        )}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-2 text-green-400">
            <span>{successMessage}</span>
            <button onClick={() => setSuccessMessage(null)} className="ml-auto underline">Dismiss</button>
          </div>
        )}

        {systemInfo && <SystemInfoCard info={systemInfo} />}

        <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="bg-[var(--card-bg)] border border-[var(--border-color)]/20 rounded-lg p-6">
          {activeTab === 'general' && (
            <GeneralTab
              settings={groupedConfig.general}
              onUpdate={updateGeneral}
            />
          )}
          {activeTab === 'booking' && (
            <BookingTab
              settings={groupedConfig.booking}
              onUpdate={updateBooking}
            />
          )}
          {activeTab === 'room' && (
            <RoomTab
              settings={groupedConfig.room}
              onUpdate={updateRoom}
            />
          )}
          {activeTab === 'notification' && (
            <NotificationTab
              settings={groupedConfig.notification}
              onUpdate={updateNotification}
              onTestSmtp={testSmtpConnection}
              onTestSms={testSmsConnection} 
            />
          )}
          {activeTab === 'system' && (
            <SystemTab
              settings={groupedConfig.system}
              onUpdate={updateSystem}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
import React, { useState } from 'react';
import { Mail, Lock, Server, Shield, Send, Key, MessageSquare, Phone, Hash, KeyRound } from 'lucide-react';
import { type NotificationSettings } from '../../../api/system_config';

interface Props {
  settings: NotificationSettings;
  onUpdate: (field: keyof NotificationSettings, value: any) => void;
  onTestSmtp?: () => Promise<void>;
  onTestSms?: () => Promise<void>;   // ✨ NEW
}

const NotificationTab: React.FC<Props> = ({
  settings,
  onUpdate,
  onTestSmtp,
  onTestSms,
}) => {
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [testingSms, setTestingSms] = useState(false);

  const handleTestSmtp = async () => {
    if (!onTestSmtp) return;
    setTestingSmtp(true);
    try {
      await onTestSmtp();
    } finally {
      setTestingSmtp(false);
    }
  };

  const handleTestSms = async () => {
    if (!onTestSms) return;
    setTestingSms(true);
    try {
      await onTestSms();
    } finally {
      setTestingSms(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* CARD 1: General Notification Settings */}
      <div className="bg-[var(--card-secondary-bg)]/30 rounded-lg p-5 border border-[var(--border-color)]/10">
        <h4 className="text-md font-medium text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <Send className="w-4 h-4 text-[var(--primary-color)]" />
          General Alerts
        </h4>
        <div className="space-y-3">
          <div className="flex items-center">
            <label className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
              <input
                type="checkbox"
                checked={settings.enable_email_alerts || false}
                onChange={(e) => onUpdate('enable_email_alerts', e.target.checked)}
                className="w-4 h-4 rounded border-[var(--border-color)]/20 bg-[var(--card-secondary-bg)]
                           checked:bg-[var(--primary-color)] checked:border-[var(--primary-color)]
                           focus:ring-1 focus:ring-[var(--primary-color)]/50"
              />
              Enable Email Alerts
            </label>
          </div>
          <div className="flex items-center">
            <label className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
              <input
                type="checkbox"
                checked={settings.enable_sms_alerts || false}
                onChange={(e) => onUpdate('enable_sms_alerts', e.target.checked)}
                className="w-4 h-4 rounded border-[var(--border-color)]/20 bg-[var(--card-secondary-bg)]
                           checked:bg-[var(--primary-color)] checked:border-[var(--primary-color)]
                           focus:ring-1 focus:ring-[var(--primary-color)]/50"
              />
              Enable SMS Alerts
            </label>
          </div>
          <div className="flex items-center">
            <label className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
              <input
                type="checkbox"
                checked={settings.admin_alerts || false}
                onChange={(e) => onUpdate('admin_alerts', e.target.checked)}
                className="w-4 h-4 rounded border-[var(--border-color)]/20 bg-[var(--card-secondary-bg)]
                           checked:bg-[var(--primary-color)] checked:border-[var(--primary-color)]
                           focus:ring-1 focus:ring-[var(--primary-color)]/50"
              />
              Admin Alerts
            </label>
          </div>
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1">Reminder Interval (hours)</label>
            <input
              type="number"
              min="0"
              value={settings.reminder_interval_hours ?? 24}
              onChange={(e) => onUpdate('reminder_interval_hours', parseInt(e.target.value) || 0)}
              className="w-full max-w-xs px-3 py-2 rounded-lg bg-[var(--card-secondary-bg)] border border-[var(--border-color)]/20
                         text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--primary-color)]/50"
            />
          </div>
        </div>
      </div>

      {/* CARD 2: Email Integration (SMTP) */}
      <div className="bg-[var(--card-secondary-bg)]/30 rounded-lg p-5 border border-[var(--border-color)]/10">
        <h4 className="text-md font-medium text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <Mail className="w-4 h-4 text-[var(--primary-color)]" />
          Email Integration (SMTP)
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* SMTP Host */}
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1 flex items-center gap-1">
              <Server className="w-3 h-3" /> SMTP Host
            </label>
            <input
              type="text"
              value={settings.smtp_host || ''}
              onChange={(e) => onUpdate('smtp_host', e.target.value)}
              placeholder="e.g. smtp.gmail.com"
              className="w-full px-3 py-2 rounded-lg bg-[var(--card-secondary-bg)] border border-[var(--border-color)]/20
                         text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--primary-color)]/50"
            />
          </div>
          {/* SMTP Port */}
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1">SMTP Port</label>
            <input
              type="number"
              value={settings.smtp_port ?? 587}
              onChange={(e) => onUpdate('smtp_port', parseInt(e.target.value) || 0)}
              placeholder="587"
              className="w-full px-3 py-2 rounded-lg bg-[var(--card-secondary-bg)] border border-[var(--border-color)]/20
                         text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--primary-color)]/50"
            />
          </div>
          {/* SMTP Username */}
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1 flex items-center gap-1">
              <Key className="w-3 h-3" /> Username / Email
            </label>
            <input
              type="email"
              value={settings.smtp_username || ''}
              onChange={(e) => onUpdate('smtp_username', e.target.value)}
              placeholder="your-email@example.com"
              className="w-full px-3 py-2 rounded-lg bg-[var(--card-secondary-bg)] border border-[var(--border-color)]/20
                         text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--primary-color)]/50"
            />
          </div>
          {/* SMTP Password */}
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1 flex items-center gap-1">
              <Lock className="w-3 h-3" /> Password
            </label>
            <input
              type="password"
              value={settings.smtp_password || ''}
              onChange={(e) => onUpdate('smtp_password', e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 rounded-lg bg-[var(--card-secondary-bg)] border border-[var(--border-color)]/20
                         text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--primary-color)]/50"
            />
          </div>
          {/* Use SSL/TLS */}
          <div className="flex items-center">
            <label className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
              <input
                type="checkbox"
                checked={settings.smtp_use_ssl || false}
                onChange={(e) => onUpdate('smtp_use_ssl', e.target.checked)}
                className="w-4 h-4 rounded border-[var(--border-color)]/20 bg-[var(--card-secondary-bg)]
                           checked:bg-[var(--primary-color)] checked:border-[var(--primary-color)]
                           focus:ring-1 focus:ring-[var(--primary-color)]/50"
              />
              Use SSL/TLS
            </label>
          </div>
          {/* From Email */}
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1">From Email (sender)</label>
            <input
              type="email"
              value={settings.smtp_from_email || ''}
              onChange={(e) => onUpdate('smtp_from_email', e.target.value)}
              placeholder="noreply@yourhotel.com"
              className="w-full px-3 py-2 rounded-lg bg-[var(--card-secondary-bg)] border border-[var(--border-color)]/20
                         text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--primary-color)]/50"
            />
          </div>
          {/* From Name */}
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1">From Name</label>
            <input
              type="text"
              value={settings.smtp_from_name || ''}
              onChange={(e) => onUpdate('smtp_from_name', e.target.value)}
              placeholder="Hotel Booking"
              className="w-full px-3 py-2 rounded-lg bg-[var(--card-secondary-bg)] border border-[var(--border-color)]/20
                         text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--primary-color)]/50"
            />
          </div>
        </div>
        {/* Test SMTP Button */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleTestSmtp}
            disabled={testingSmtp || !settings.smtp_host || !settings.smtp_username}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg
                       bg-[var(--card-secondary-bg)] hover:bg-[var(--card-hover-bg)]
                       text-[var(--text-primary)] border border-[var(--border-color)]/20
                       hover:border-[var(--border-color)]/40 transition-all duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {testingSmtp ? 'Testing...' : 'Test SMTP Connection'}
          </button>
        </div>
      </div>

      {/* CARD 3: SMS Integration (Twilio) */}
      <div className="bg-[var(--card-secondary-bg)]/30 rounded-lg p-5 border border-[var(--border-color)]/10">
        <h4 className="text-md font-medium text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[var(--primary-color)]" />
          SMS Integration (Twilio)
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Account SID */}
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1 flex items-center gap-1">
              <KeyRound className="w-3 h-3" /> Account SID
            </label>
            <input
              type="text"
              value={settings.twilio_account_sid || ''}
              onChange={(e) => onUpdate('twilio_account_sid', e.target.value)}
              placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              className="w-full px-3 py-2 rounded-lg bg-[var(--card-secondary-bg)] border border-[var(--border-color)]/20
                         text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--primary-color)]/50"
            />
          </div>
          {/* Auth Token */}
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1 flex items-center gap-1">
              <Lock className="w-3 h-3" /> Auth Token
            </label>
            <input
              type="password"
              value={settings.twilio_auth_token || ''}
              onChange={(e) => onUpdate('twilio_auth_token', e.target.value)}
              placeholder="••••••••••••••••"
              className="w-full px-3 py-2 rounded-lg bg-[var(--card-secondary-bg)] border border-[var(--border-color)]/20
                         text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--primary-color)]/50"
            />
          </div>
          {/* Twilio Phone Number */}
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1 flex items-center gap-1">
              <Phone className="w-3 h-3" /> From Phone Number
            </label>
            <input
              type="text"
              value={settings.twilio_phone_number || ''}
              onChange={(e) => onUpdate('twilio_phone_number', e.target.value)}
              placeholder="+1234567890"
              className="w-full px-3 py-2 rounded-lg bg-[var(--card-secondary-bg)] border border-[var(--border-color)]/20
                         text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--primary-color)]/50"
            />
          </div>
          {/* Messaging Service SID (optional) */}
          <div>
            <label className="block text-xs text-[var(--text-secondary)] mb-1 flex items-center gap-1">
              <Hash className="w-3 h-3" /> Messaging Service SID
              <span className="text-[var(--text-tertiary)] ml-1">(optional)</span>
            </label>
            <input
              type="text"
              value={settings.twilio_messaging_service_sid || ''}
              onChange={(e) => onUpdate('twilio_messaging_service_sid', e.target.value)}
              placeholder="MGxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              className="w-full px-3 py-2 rounded-lg bg-[var(--card-secondary-bg)] border border-[var(--border-color)]/20
                         text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--primary-color)]/50"
            />
          </div>
        </div>
        {/* Test SMS Button */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleTestSms}
            disabled={testingSms || !settings.twilio_account_sid || !settings.twilio_auth_token || !settings.twilio_phone_number}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg
                       bg-[var(--card-secondary-bg)] hover:bg-[var(--card-hover-bg)]
                       text-[var(--text-primary)] border border-[var(--border-color)]/20
                       hover:border-[var(--border-color)]/40 transition-all duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {testingSms ? 'Testing...' : 'Test SMS Connection'}
          </button>
        </div>
        <p className="text-xs text-[var(--text-tertiary)] mt-2">
          Credentials are stored locally on this device.
        </p>
      </div>
    </div>
  );
};

export default NotificationTab;
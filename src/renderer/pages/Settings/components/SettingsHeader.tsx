// src/renderer/pages/Settings/components/SettingsHeader.tsx
import React from 'react';
import { Save, RotateCcw, Download, Upload, RefreshCw } from 'lucide-react';

interface Props {
  onSave: () => void;
  onReset: () => void;
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  saving: boolean;
}

const SettingsHeader: React.FC<Props> = ({ onSave, onReset, onExport, onImport, saving }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">System Settings</h2>
        <p className="text-[var(--text-secondary)] mt-1">Configure your hotel booking system</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onExport}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg
                     bg-[var(--card-secondary-bg)] hover:bg-[var(--card-hover-bg)]
                     text-[var(--text-primary)] border border-[var(--border-color)]/20
                     hover:border-[var(--border-color)]/40 transition-all duration-200"
        >
          <Download className="w-4 h-4" />
          Export
        </button>
        <label
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg
                     bg-[var(--card-secondary-bg)] hover:bg-[var(--card-hover-bg)]
                     text-[var(--text-primary)] border border-[var(--border-color)]/20
                     hover:border-[var(--border-color)]/40 transition-all duration-200 cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          Import
          <input type="file" accept=".json" onChange={onImport} className="hidden" />
        </label>
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg
                     bg-[var(--card-secondary-bg)] hover:bg-[var(--card-hover-bg)]
                     text-[var(--text-primary)] border border-[var(--border-color)]/20
                     hover:border-[var(--border-color)]/40 transition-all duration-200"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
        <button
          onClick={onSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg
                     bg-[var(--primary-color)] text-black font-medium
                     hover:bg-[var(--primary-hover)] transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default SettingsHeader;
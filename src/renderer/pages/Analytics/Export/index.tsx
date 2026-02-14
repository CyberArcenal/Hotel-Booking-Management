import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, RefreshCw } from 'lucide-react';
import { useExport, type ExportType } from './hooks/useExport';
import ExportTypeCard, { exportTypes } from './components/ExportTypeCard';
import ExportForm from './components/ExportForm';
import ExportHistory from './components/ExportHistory';

const ExportPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<ExportType>('financial');
  const { loading, error, success, exportData, reset } = useExport();

  const handleExport = (options: any) => {
    exportData(options);
  };

  const selectedTypeData = exportTypes.find(t => t.type === selectedType);

  return (
    <div className="min-h-screen bg-[var(--background-color)]">
      <main className="mx-auto px-2 py-2">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Export Reports</h2>
            <p className="text-[var(--text-secondary)] mt-1">
              Generate and download analytics reports in various formats
            </p>
          </div>
          <button
            onClick={() => {
              reset();
              // force re-render or refetch if needed
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg
                       bg-[var(--card-secondary-bg)] hover:bg-[var(--card-hover-bg)]
                       text-[var(--text-primary)] border border-[var(--border-color)]/20
                       hover:border-[var(--border-color)]/40 transition-all duration-200"
          >
            <RefreshCw className="w-4 h-4" />
            Reset
          </button>
        </div>

        {/* Error / Success Messages */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6 text-red-400">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-6 text-green-400">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Export Type Selection */}
          <div className="lg:col-span-1">
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)]/20 rounded-lg p-4">
              <h3 className="text-md font-medium text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary-color)]"></span>
                Select Report Type
              </h3>
              <div className="space-y-3">
                {exportTypes.map((type) => (
                  <ExportTypeCard
                    key={type.type}
                    type={type.type}
                    title={type.title}
                    description={type.description}
                    icon={type.icon}
                    isSelected={selectedType === type.type}
                    onClick={() => setSelectedType(type.type)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Export Form and History */}
          <div className="lg:col-span-2 space-y-6">
            {/* Export Form */}
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)]/20 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-[var(--primary-color)]/20">
                  <Download className="w-5 h-5 text-[var(--primary-color)]" />
                </div>
                <div>
                  <h3 className="text-md font-medium text-[var(--text-primary)]">
                    {selectedTypeData?.title}
                  </h3>
                  <p className="text-xs text-[var(--text-tertiary)]">
                    {selectedTypeData?.description}
                  </p>
                </div>
              </div>
              <ExportForm
                type={selectedType}
                onSubmit={handleExport}
                loading={loading}
              />
            </div>

            {/* Export History */}
            <ExportHistory />
          </div>
        </div>
      </main>
    </div>
  );
};

export default ExportPage;
// src/pages/Audit/index.tsx
import React, { useState } from "react";
import { Filter, Download, FileText } from "lucide-react";
import { useAuditLogs } from "./hooks/useAuditLogs";
import AuditTable from "./components/AuditTable";
import Pagination from "../../components/Shared/Pagination";
import auditAPI from "../../api/audit";
import AuditQuickStats from "./components/AuditQuickStats";
import AuditSearch from "./components/AuditSearch";
import AuditFilterPanel from "./components/AuditFilterPanel";

const AuditPage: React.FC = () => {
  const {
    logs,
    total,
    totalPages,
    currentPage,
    pageSize,
    loading,
    error,
    filters,
    setFilters,
    setPage,
    setPageSize,
    setSearchQuery,
    clearFilters,
    refetch,
  } = useAuditLogs();

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");

  const handleSearchChange = (query: string) => {
    setSearchInput(query);
    setSearchQuery(query);
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setIsFilterOpen(false);
  };

  const handleClearFilters = () => {
    clearFilters();
    setSearchInput("");
    setIsFilterOpen(false);
  };

  const handleExport = async () => {
    try {
      const result = await auditAPI.exportCSV({
        ...filters,
        limit: 5000,
      });
      if (result.status && result.data?.filePath) {
        // Simulate download (Electron will handle actual file save)
        alert(`Export started: ${result.data.filePath}`);
      } else {
        alert("Export failed");
      }
    } catch (err) {
      console.error(err);
      alert("Export failed");
    }
  };

  const handleGenerateReport = async () => {
    const format = window.confirm(
      "Generate JSON report? Click OK for JSON, Cancel for HTML",
    )
      ? "json"
      : "html";
    try {
      const result = await auditAPI.generateReport({
        ...filters,
        format,
      });
      if (result.status && result.data?.filePath) {
        alert(`Report generated: ${result.data.filePath}`);
      } else {
        alert("Report generation failed");
      }
    } catch (err) {
      console.error(err);
      alert("Report generation failed");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background-color)]">
      <main className="container mx-auto px-4 py-6 md:px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">
              Audit Logs
            </h2>
            <p className="text-[var(--text-secondary)] mt-1">
              {total} entr{total !== 1 ? "ies" : "y"} found
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg
                         bg-[var(--card-secondary-bg)] hover:bg-[var(--card-hover-bg)]
                         text-[var(--text-primary)] border border-[var(--border-color)]/20
                         hover:border-[var(--border-color)]/40 transition-all duration-200"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button
              onClick={handleGenerateReport}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg
                         bg-[var(--card-secondary-bg)] hover:bg-[var(--card-hover-bg)]
                         text-[var(--text-primary)] border border-[var(--border-color)]/20
                         hover:border-[var(--border-color)]/40 transition-all duration-200"
            >
              <FileText className="w-4 h-4" />
              Report
            </button>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg
                         bg-[var(--card-secondary-bg)] hover:bg-[var(--card-hover-bg)]
                         text-[var(--text-primary)] border border-[var(--border-color)]/20
                         hover:border-[var(--border-color)]/40 transition-all duration-200"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <AuditQuickStats />

        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mt-4">
          <AuditSearch value={searchInput} onChange={handleSearchChange} />
          {filters.searchTerm && (
            <span className="text-sm text-[var(--text-secondary)]">
              Searching: “{filters.searchTerm}”
            </span>
          )}
        </div>

        {/* Filter Panel */}
        <AuditFilterPanel
          filters={filters}
          onChange={handleFilterChange}
          onClear={handleClearFilters}
          isOpen={isFilterOpen}
          onToggle={() => setIsFilterOpen(!isFilterOpen)}
        />

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mt-4 text-red-400">
            {error}
            <button onClick={refetch} className="ml-3 underline">
              Retry
            </button>
          </div>
        )}

        {/* Table */}
        <div className="mt-6">
          <AuditTable logs={logs} loading={loading} />
        </div>

        {/* Pagination */}
        {!loading && total > 0 && (
          <Pagination
            currentPage={currentPage}
            totalItems={total}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[10, 20, 50, 100]}
            showPageSize={true}
          />
        )}
      </main>
    </div>
  );
};

export default AuditPage;

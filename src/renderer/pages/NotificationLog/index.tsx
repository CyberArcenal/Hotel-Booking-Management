import React, { useState } from 'react';
import { Filter, RefreshCw } from 'lucide-react';
import { useNotificationLogs } from './hooks/useNotificationLogs';
import { NotificationSearch } from './components/NotificationSearch';
import { NotificationFilterPanel } from './components/NotificationFilterPanel';
import { NotificationStats } from './components/NotificationStats';
import { NotificationTable } from './components/NotificationTable';
import Pagination from '../../components/Shared/Pagination';
import { NotificationViewDialog } from './Dialogs/NotificationViewDialog';
import { NotificationRetryDialog } from './Dialogs/NotificationRetryDialog';
import { NotificationDeleteDialog } from './Dialogs/NotificationDeleteDialog';
import { dialogs } from '../../utils/dialogs';
import type { NotificationLogEntry } from '../../api/notification_log';
import notificationLogAPI from '../../api/notification_log';
import { NotificationResendDialog } from './Dialogs/NotificationResendDialog';

const NotificationLogPage: React.FC = () => {
  const {
    logs,
    pagination,
    stats,
    loading,
    error,
    filters,
    updateFilters,
    clearFilters,
    setPage,
    setPageSize,
    refetch,
  } = useNotificationLogs();

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLog, setSelectedLog] = useState<NotificationLogEntry | null>(null);
  const [dialogState, setDialogState] = useState<{
    view: boolean;
    retry: boolean;
    resend: boolean;
    delete: boolean;
  }>({
    view: false,
    retry: false,
    resend: false,
    delete: false,
  });

  // Search handler
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    updateFilters({ keyword: query });
  };

  // Filter handlers
  const handleFilterChange = (newFilters: any) => {
    updateFilters(newFilters);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    clearFilters();
  };

  // Action handlers
  const handleView = (log: NotificationLogEntry) => {
    setSelectedLog(log);
    setDialogState((prev) => ({ ...prev, view: true }));
  };

  const handleRetry = async (id: number) => {
    try {
      const response = await notificationLogAPI.retryFailed(id);
      if (response.status) {
        await dialogs.success('Retry initiated', 'The notification has been queued for retry.');
        refetch();
      } else {
        throw new Error(response.message);
      }
    } catch (err: any) {
      await dialogs.error('Retry failed', err.message);
    }
  };

  const handleResend = async (id: number) => {
    try {
      const response = await notificationLogAPI.resend(id);
      if (response.status) {
        await dialogs.success('Resend initiated', 'The notification has been resent.');
        refetch();
      } else {
        throw new Error(response.message);
      }
    } catch (err: any) {
      await dialogs.error('Resend failed', err.message);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await notificationLogAPI.delete(id);
      if (response.status) {
        await dialogs.success('Deleted', `Notification #${id} has been deleted.`);
        refetch();
      } else {
        throw new Error(response.message);
      }
    } catch (err: any) {
      await dialogs.error('Delete failed', err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background-color)]">
      <main className="container mx-auto px-4 py-6 md:px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Notification Logs</h2>
            <p className="text-[var(--text-secondary)] mt-1">
              {pagination.total} total notifications
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg
                         bg-[var(--card-secondary-bg)] hover:bg-[var(--card-hover-bg)]
                         text-[var(--text-primary)] border border-[var(--border-color)]/20
                         hover:border-[var(--border-color)]/40 transition-all duration-200"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
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

        {/* Stats Cards */}
        <NotificationStats stats={stats} loading={loading} />

        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <NotificationSearch value={searchQuery} onChange={handleSearchChange} />
          {searchQuery && (
            <span className="text-sm text-[var(--text-secondary)]">
              Searching: “{searchQuery}”
            </span>
          )}
        </div>

        {/* Filter Panel */}
        <NotificationFilterPanel
          filters={{
            status: filters.status,
            startDate: filters.startDate,
            endDate: filters.endDate,
            sortBy: filters.sortBy,
            sortOrder: filters.sortOrder,
          }}
          onChange={handleFilterChange}
          onClear={handleClearFilters}
          isOpen={isFilterOpen}
          onToggle={() => setIsFilterOpen(!isFilterOpen)}
        />

        {/* Error display */}
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
          <NotificationTable
            logs={logs}
            onView={handleView}
            onRetry={(id) => {
              setSelectedLog(logs.find((l) => l.id === id) || null);
              setDialogState((prev) => ({ ...prev, retry: true }));
            }}
            onResend={(id) => {
              setSelectedLog(logs.find((l) => l.id === id) || null);
              setDialogState((prev) => ({ ...prev, resend: true }));
            }}
            onDelete={(id) => {
              setSelectedLog(logs.find((l) => l.id === id) || null);
              setDialogState((prev) => ({ ...prev, delete: true }));
            }}
            isLoading={loading}
          />
        </div>

        {/* Pagination */}
        {!loading && pagination.total > 0 && (
          <Pagination
            currentPage={pagination.page}
            totalItems={pagination.total}
            pageSize={pagination.limit}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[10, 25, 50, 100]}
            showPageSize={true}
          />
        )}
      </main>

      {/* Dialogs */}
      {selectedLog && (
        <>
          <NotificationViewDialog
            log={selectedLog}
            isOpen={dialogState.view}
            onClose={() => {
              setDialogState((prev) => ({ ...prev, view: false }));
              setSelectedLog(null);
            }}
          />
          <NotificationRetryDialog
            id={selectedLog.id}
            isOpen={dialogState.retry}
            onClose={() => {
              setDialogState((prev) => ({ ...prev, retry: false }));
              setSelectedLog(null);
            }}
            onConfirm={() => handleRetry(selectedLog.id)}
          />
          <NotificationResendDialog
            id={selectedLog.id}
            isOpen={dialogState.resend}
            onClose={() => {
              setDialogState((prev) => ({ ...prev, resend: false }));
              setSelectedLog(null);
            }}
            onConfirm={() => handleResend(selectedLog.id)}
          />
          <NotificationDeleteDialog
            id={selectedLog.id}
            isOpen={dialogState.delete}
            onClose={() => {
              setDialogState((prev) => ({ ...prev, delete: false }));
              setSelectedLog(null);
            }}
            onConfirm={() => handleDelete(selectedLog.id)}
          />
        </>
      )}
    </div>
  );
};

export default NotificationLogPage;
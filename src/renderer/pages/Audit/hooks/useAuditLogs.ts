// src/pages/Audit/hooks/useAuditLogs.ts
import { useState, useEffect, useCallback } from 'react';
import auditAPI from '../../../api/audit';
import type { AuditLogEntry, PaginatedAuditLogs } from '../../../api/audit';

interface AuditFilters {
  searchTerm?: string;
  entity?: string;
  user?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
}

interface UseAuditLogsReturn {
  logs: AuditLogEntry[];
  total: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  loading: boolean;
  error: string | null;
  filters: AuditFilters;
  setFilters: (filters: AuditFilters) => void;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setSearchQuery: (query: string) => void;
  clearFilters: () => void;
  refetch: () => void;
}

const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_FILTERS: AuditFilters = {
  searchTerm: '',
  entity: '',
  user: '',
  action: '',
  startDate: '',
  endDate: '',
};

export const useAuditLogs = (): UseAuditLogsReturn => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [filters, setFilters] = useState<AuditFilters>(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await auditAPI.search({
        ...filters,
        page: currentPage,
        limit: pageSize,
      });
      if (response.status) {
        setLogs(response.data.items);
        setTotal(response.data.total);
        setTotalPages(response.data.totalPages);
      } else {
        throw new Error(response.message);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage, pageSize]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const setSearchQuery = (query: string) => {
    setFilters((prev) => ({ ...prev, searchTerm: query }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setCurrentPage(1);
  };

  return {
    logs,
    total,
    totalPages,
    currentPage,
    pageSize,
    loading,
    error,
    filters,
    setFilters,
    setPage: setCurrentPage,
    setPageSize,
    setSearchQuery,
    clearFilters,
    refetch: fetchLogs,
  };
};
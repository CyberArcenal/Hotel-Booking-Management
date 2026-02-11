import { useState, useEffect, useCallback } from 'react';
import type { GuestWithStats } from '../../../api/guest';
import guestAPI from '../../../api/guest';

interface UseGuestsParams {
  search?: string;
  name?: string;
  email?: string;
  phone?: string;
  nationality?: string;
  hasBookings?: boolean;
  minBookings?: number;
  lastVisitAfter?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}

interface UseGuestsReturn {
  guests: GuestWithStats[];
  total: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  loading: boolean;
  error: string | null;
  filters: UseGuestsParams;
  setFilters: (filters: Partial<UseGuestsParams>) => void;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setSearchQuery: (query: string) => void;
  clearFilters: () => void;
  refetch: () => Promise<void>;
  activeGuestIds: Set<number>; // for quick "current booking" check
}

export const useGuests = (initialParams?: UseGuestsParams): UseGuestsReturn => {
  const [filters, setFiltersState] = useState<UseGuestsParams>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'DESC',
    ...initialParams,
  });

  const [guests, setGuests] = useState<GuestWithStats[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeGuestIds, setActiveGuestIds] = useState<Set<number>>(new Set());

  // Fetch active guest IDs (for current booking indicator)
  const fetchActiveGuestIds = useCallback(async () => {
    try {
      const response = await guestAPI.getActiveGuests(1, 1000); // limit high enough
      if (response.status && response.data?.guests) {
        const ids = response.data.guests.map((g) => g.id);
        setActiveGuestIds(new Set(ids));
      }
    } catch (err) {
      console.error('Failed to fetch active guests:', err);
    }
  }, []);

  // Fetch guests using the search endpoint (supports pagination & filtering)
  const fetchGuests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await guestAPI.search(filters);
      if (response.status && response.data) {
        setGuests(response.data.guests || []);
        setTotal(response.data.total || 0);
        setTotalPages(response.data.totalPages || 0);
      } else {
        throw new Error(response.message || 'Failed to fetch guests');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load guests');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Initial load
  useEffect(() => {
    fetchActiveGuestIds();
    fetchGuests();
  }, [fetchGuests, fetchActiveGuestIds]);

  const setFilters = (newFilters: Partial<UseGuestsParams>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  const setPage = (page: number) => {
    setFiltersState((prev) => ({ ...prev, page }));
  };

  const setPageSize = (limit: number) => {
    setFiltersState((prev) => ({ ...prev, limit, page: 1 }));
  };

  const setSearchQuery = (search: string) => {
    setFilters({ search });
  };

  const clearFilters = () => {
    setFiltersState({
      page: 1,
      limit: filters.limit || 10,
      sortBy: 'createdAt',
      sortOrder: 'DESC',
    });
  };

  return {
    guests,
    total,
    totalPages,
    currentPage: filters.page || 1,
    pageSize: filters.limit || 10,
    loading,
    error,
    filters,
    setFilters,
    setPage,
    setPageSize,
    setSearchQuery,
    clearFilters,
    refetch: fetchGuests,
    activeGuestIds,
  };
};
import { useState, useEffect, useCallback } from 'react';
import type { Booking, PaginatedBookings } from '../../../api/booking';
import bookingAPI from '../../../api/booking';

interface UseBookingsParams {
  page?: number;
  limit?: number;
  status?: string;
  statuses?: string[];
  search?: string;
  checkInDate?: string;
  checkOutDate?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

interface UseBookingsReturn {
  bookings: Booking[];
  total: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  loading: boolean;
  error: string | null;
  filters: UseBookingsParams;
  setFilters: (filters: Partial<UseBookingsParams>) => void;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setSearchQuery: (query: string) => void;
  clearFilters: () => void;
  refetch: () => Promise<void>;
}

export const useBookings = (initialParams?: UseBookingsParams): UseBookingsReturn => {
  const [filters, setFiltersState] = useState<UseBookingsParams>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'DESC',
    ...initialParams,
  });

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await bookingAPI.getAll(filters);
      if (response.status && response.data) {
        // bookingAPI.getAll returns either Booking[] or PaginatedBookings
        // We need to handle both cases based on presence of page/limit
        if ('items' in response.data) {
          // Paginated response
          const paginated = response.data as PaginatedBookings;
          setBookings(paginated.items);
          setTotal(paginated.total);
          setTotalPages(paginated.totalPages);
        } else {
          // Non-paginated (all bookings)
          setBookings(response.data as Booking[]);
          setTotal((response.data as Booking[]).length);
          setTotalPages(1);
        }
      } else {
        throw new Error(response.message || 'Failed to fetch bookings');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const setFilters = (newFilters: Partial<UseBookingsParams>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters, page: 1 })); // reset to first page
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
    bookings,
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
    refetch: fetchBookings,
  };
};
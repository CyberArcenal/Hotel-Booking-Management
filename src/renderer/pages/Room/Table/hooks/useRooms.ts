import { useState, useEffect, useCallback, useMemo } from 'react';
import type { GetAllRoomsParams, Room } from '../../../../api/room';
import roomAPI from '../../../../api/room';
import { debounce } from '../../../../utils/debounce';

export const useRooms = (initialFilters?: GetAllRoomsParams) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<GetAllRoomsParams>(initialFilters || {});
  const [searchQuery, setSearchQuery] = useState('');

  // Merge search query into filters
  const effectiveFilters = useMemo(() => {
    const f = { ...filters };
    if (searchQuery.trim()) {
      f.search = searchQuery; // assuming backend supports 'search' param
    }
    return f;
  }, [filters, searchQuery]);

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await roomAPI.getAll(effectiveFilters);
      if (response.status && response.data) {
        setRooms(response.data);
      } else {
        setError(response.message || 'Failed to fetch rooms');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [effectiveFilters]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  // Debounced search to avoid too many requests
  const debouncedSetSearch = useMemo(
    () => debounce((q: string) => setSearchQuery(q), 300),
    []
  );

  const updateSearch = (query: string) => {
    debouncedSetSearch(query);
  };

  const updateFilters = (newFilters: GetAllRoomsParams) => {
    setFilters(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
  };

  const refetch = () => fetchRooms();

  return {
    rooms,
    loading,
    error,
    filters,
    setFilters: updateFilters,
    searchQuery,
    setSearchQuery: updateSearch,
    clearFilters,
    refetch,
  };
};

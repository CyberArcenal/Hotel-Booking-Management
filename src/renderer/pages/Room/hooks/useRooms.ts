// src/pages/Room/hooks/useRooms.ts
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import type { GetAllRoomsParams, Room } from "../../../api/room";
import roomAPI from "../../../api/room";
import { debounce } from "../../../utils/debounce";

export const useRooms = (initialFilters?: GetAllRoomsParams) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<GetAllRoomsParams>(initialFilters || {});
  const [searchQuery, setSearchQuery] = useState("");

  const abortControllerRef = useRef<AbortController | null>(null);

  const effectiveFilters = useMemo(() => {
    const f = { ...filters };
    if (searchQuery.trim()) {
      f.search = searchQuery;
    }
    return f;
  }, [filters, searchQuery]);

  const fetchRooms = useCallback(async () => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);
    try {
      const response = await roomAPI.getAll(effectiveFilters);
      if (!controller.signal.aborted) {
        if (response.status && response.data) {
          setRooms(response.data);
        } else {
          setError(response.message || "Failed to fetch rooms");
        }
      }
    } catch (err: any) {
      if (!controller.signal.aborted) {
        setError(err.message);
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [effectiveFilters]);

  useEffect(() => {
    fetchRooms();
    return () => {
      abortControllerRef.current?.abort();
    };
  }, [fetchRooms]);

  const debouncedSetSearch = useMemo(
    () => debounce((q: string) => setSearchQuery(q), 300),
    []
  );

  const updateSearch = useCallback(
    (query: string) => {
      debouncedSetSearch(query);
    },
    [debouncedSetSearch]
  );

  const updateFilters = useCallback((newFilters: GetAllRoomsParams) => {
    setFilters(newFilters);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setSearchQuery("");
  }, []);

  const refetch = useCallback(() => fetchRooms(), [fetchRooms]);

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
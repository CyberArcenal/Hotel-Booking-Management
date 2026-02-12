// src/renderer/hooks/room/useRoomView.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import type { Room } from '../../../../../api/room';
import roomAPI from '../../../../../api/room';
import bookingAPI, { type Booking } from '../../../../../api/booking';

interface UseRoomViewProps {
  id: number;
  includeBookings?: boolean;
  bookingsLimit?: number;
  onError?: (error: string) => void;
}

interface UseRoomViewReturn {
  room: Room | null;
  loading: boolean;
  error: string | null;
  recentBookings: Booking[];
  bookingsLoading: boolean;
  bookingsError: string | null;
  refetch: () => Promise<void>;
}

export const useRoomView = ({
  id,
  includeBookings = true,
  bookingsLimit = 5,
  onError,
}: UseRoomViewProps): UseRoomViewReturn => {
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsError, setBookingsError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchRoom = useCallback(async () => {
    if (!id) return;

    // Cancel previous request
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);
    try {
      const response = await roomAPI.getById(id);
      if (controller.signal.aborted) return;

      if (response.status && response.data) {
        setRoom(response.data);
      } else {
        throw new Error(response.message || 'Room not found');
      }
    } catch (err: any) {
      if (controller.signal.aborted) return;
      const msg = err.message || 'Failed to load room';
      setError(msg);
      onError?.(msg);
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [id, onError]);

  const fetchBookings = useCallback(async () => {
    if (!includeBookings || !id || !room) return;

    // Cancel previous bookings request
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setBookingsLoading(true);
    setBookingsError(null);
    try {
      const response = await bookingAPI.getByRoom(id);
      if (controller.signal.aborted) return;

      if (response.status && Array.isArray(response.data)) {
        // Sort by createdAt (newest first) and limit
        const sorted = (response.data as Booking[])
          .sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return dateB - dateA;
          })
          .slice(0, bookingsLimit);
        setRecentBookings(sorted);
      } else {
        throw new Error(response.message || 'Failed to fetch bookings');
      }
    } catch (err: any) {
      if (controller.signal.aborted) return;
      console.error('Failed to fetch room bookings:', err);
      setBookingsError(err.message || 'Could not load bookings');
    } finally {
      if (!controller.signal.aborted) {
        setBookingsLoading(false);
      }
    }
  }, [id, room, includeBookings, bookingsLimit]);

  // Fetch room when ID changes
  useEffect(() => {
    fetchRoom();
    return () => {
      abortControllerRef.current?.abort();
    };
  }, [fetchRoom]);

  // Fetch bookings when room is loaded
  useEffect(() => {
    if (room) {
      fetchBookings();
    }
  }, [room, fetchBookings]);

  const refetch = useCallback(async () => {
    await fetchRoom();
    await fetchBookings();
  }, [fetchRoom, fetchBookings]);

  return {
    room,
    loading,
    error,
    recentBookings,
    bookingsLoading,
    bookingsError,
    refetch,
  };
};
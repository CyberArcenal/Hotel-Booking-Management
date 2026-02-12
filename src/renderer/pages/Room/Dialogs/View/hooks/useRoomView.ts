// src/renderer/hooks/room/useRoomView.ts

import { useState, useEffect } from "react";
import type { Room } from "../../../../../api/room";
import roomAPI from "../../../../../api/room";
import bookingAPI, { type Booking } from "../../../../../api/booking";

interface UseRoomViewProps {
  id: number;
  includeBookings?: boolean; // whether to fetch recent bookings
  bookingsLimit?: number; // number of recent bookings (default 5)
  onError?: (error: string) => void;
}

interface UseRoomViewReturn {
  room: Room | null;
  loading: boolean;
  error: string | null;
  recentBookings: Booking[];
  bookingsLoading: boolean;
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

  const fetchRoom = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await roomAPI.getById(id);
      if (response.status && response.data) {
        setRoom(response.data);
      } else {
        throw new Error(response.message || "Room not found");
      }
    } catch (err: any) {
      const msg = err.message || "Failed to load room";
      setError(msg);
      onError?.(msg);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    if (!includeBookings || !id) return;
    try {
      setBookingsLoading(true);
      // Use the booking API to get bookings for this room
      const response = await bookingAPI.getByRoom(id);
      if (response.status) {
        const allBookings = response.data as Booking[];
        // Sort by date descending and limit
        const sorted = allBookings
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          )
          .slice(0, bookingsLimit);
        setRecentBookings(sorted);
      }
    } catch (err) {
      console.error("Failed to fetch room bookings:", err);
    } finally {
      setBookingsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoom();
  }, [id]);

  useEffect(() => {
    if (room) {
      fetchBookings();
    }
  }, [room, includeBookings, bookingsLimit]);

  const refetch = async () => {
    await fetchRoom();
    await fetchBookings();
  };

  return {
    room,
    loading,
    error,
    recentBookings,
    bookingsLoading,
    refetch,
  };
};

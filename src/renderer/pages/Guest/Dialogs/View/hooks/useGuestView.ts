// src/renderer/hooks/guest/useGuestView.ts

import { useState, useEffect } from 'react';
import type { BookingSummary, GuestWithStats } from '../../../../../api/guest';
import guestAPI from '../../../../../api/guest';

interface UseGuestViewProps {
  id: number;
  includeBookings?: boolean;    // whether to fetch booking history
  bookingsLimit?: number;       // number of recent bookings (default 5)
  onError?: (error: string) => void;
}

interface UseGuestViewReturn {
  guest: GuestWithStats | null;
  loading: boolean;
  error: string | null;
  bookingHistory: BookingSummary[];
  bookingsLoading: boolean;
  summary: {
    totalBookings: number;
    totalSpent: number;
    avgNights: number;
    lastVisit: string | null;
    firstVisit: string | null;
    isReturning: boolean;
  };
  refetch: () => Promise<void>;
}

export const useGuestView = ({
  id,
  includeBookings = true,
  bookingsLimit = 5,
  onError,
}: UseGuestViewProps): UseGuestViewReturn => {
  const [guest, setGuest] = useState<GuestWithStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingHistory, setBookingHistory] = useState<BookingSummary[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [summary, setSummary] = useState({
    totalBookings: 0,
    totalSpent: 0,
    avgNights: 0,
    lastVisit: null as string | null,
    firstVisit: null as string | null,
    isReturning: false,
  });

  const fetchGuest = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await guestAPI.getById(id, includeBookings);
      if (response.status && response.data) {
        setGuest(response.data as GuestWithStats);
      } else {
        throw new Error(response.message || 'Guest not found');
      }
    } catch (err: any) {
      const msg = err.message || 'Failed to load guest';
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
      const response = await guestAPI.getBookingHistory(id, {
        sortBy: 'checkInDate',
        sortOrder: 'DESC',
        limit: bookingsLimit,
      });
      if (response.status) {
        const { bookings, summary: historySummary } = response.data;
        setBookingHistory(bookings);

        // Compute additional summary if not provided by API
        const totalSpent = bookings.reduce((sum, b) => sum + b.totalPrice, 0);
        const totalNights = bookings.reduce((sum, b) => {
          const start = new Date(b.checkInDate);
          const end = new Date(b.checkOutDate);
          const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
          return sum + nights;
        }, 0);
        const avgNights = bookings.length ? totalNights / bookings.length : 0;
        const lastVisit = bookings[0]?.checkOutDate || null;
        const firstVisit = bookings[bookings.length - 1]?.checkInDate || null;
        const isReturning = bookings.length >= 2;

        setSummary({
          totalBookings: historySummary?.totalBookings ?? bookings.length,
          totalSpent,
          avgNights,
          lastVisit,
          firstVisit,
          isReturning,
        });
      }
    } catch (err) {
      console.error('Failed to fetch guest bookings:', err);
    } finally {
      setBookingsLoading(false);
    }
  };

  useEffect(() => {
    fetchGuest();
  }, [id]);

  useEffect(() => {
    if (guest && includeBookings) {
      fetchBookings();
    }
  }, [guest, includeBookings, bookingsLimit]);

  const refetch = async () => {
    await fetchGuest();
    await fetchBookings();
  };

  return {
    guest,
    loading,
    error,
    bookingHistory,
    bookingsLoading,
    summary,
    refetch,
  };
};
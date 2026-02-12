// src/renderer/hooks/booking/useBookingView.ts

import { useState, useEffect } from 'react';
import type { Booking } from '../../../../../api/booking';
import bookingAPI from '../../../../../api/booking';

interface UseBookingViewProps {
  id: number;
  onError?: (error: string) => void;
}

interface UseBookingViewReturn {
  booking: Booking | null;
  loading: boolean;
  error: string | null;
  nights: number;
  totalPrice: number;
  formattedCheckIn: string;
  formattedCheckOut: string;
  refetch: () => Promise<void>;
}

export const useBookingView = ({
  id,
  onError,
}: UseBookingViewProps): UseBookingViewReturn => {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await bookingAPI.getById(id);
      if (response.status && response.data) {
        setBooking(response.data);
      } else {
        throw new Error(response.message || 'Booking not found');
      }
    } catch (err: any) {
      const msg = err.message || 'Failed to load booking';
      setError(msg);
      onError?.(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchBooking();
  }, [id]);

  // Derived data
  const nights = (() => {
    if (!booking) return 0;
    const start = new Date(booking.checkInDate);
    const end = new Date(booking.checkOutDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  })();

  const totalPrice = booking?.totalPrice ?? 0;

  const formattedCheckIn = booking
    ? new Date(booking.checkInDate).toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  const formattedCheckOut = booking
    ? new Date(booking.checkOutDate).toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return {
    booking,
    loading,
    error,
    nights,
    totalPrice,
    formattedCheckIn,
    formattedCheckOut,
    refetch: fetchBooking,
  };
};
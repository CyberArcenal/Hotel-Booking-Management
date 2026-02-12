// src/renderer/components/Guest/View/GuestViewDialog.tsx

import React from 'react';
import { X, AlertCircle, User } from 'lucide-react';
import { useGuestView } from './hooks/useGuestView';
import { GuestViewSkeleton } from './components/GuestViewSkeleton';
import { GuestTypeBadge } from './components/GuestTypeBadge';
import { GuestInfoCard } from './components/GuestInfoCard';
import { GuestStatsCard } from './components/GuestStatsCard';
import { BookingHistoryCard } from './components/BookingHistoryCard';

interface GuestViewDialogProps {
  id: number;
  isOpen: boolean;
  onClose: () => void;
  showBookings?: boolean; // whether to display booking history
}

export const GuestViewDialog: React.FC<GuestViewDialogProps> = ({
  id,
  isOpen,
  onClose,
  showBookings = true,
}) => {
  const {
    guest,
    loading,
    error,
    bookingHistory,
    bookingsLoading,
    summary,
  } = useGuestView({
    id,
    includeBookings: showBookings,
    bookingsLimit: 10,
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div
        className="w-full max-w-2xl rounded-lg shadow-2xl border max-h-[90vh] overflow-hidden"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--border-color)',
        }}
      >
        {/* Header */}
        <div
          className="p-4 border-b flex items-center justify-between"
          style={{
            borderColor: 'var(--border-color)',
            backgroundColor: 'var(--card-secondary-bg)',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                backgroundColor: 'rgba(212,175,55,0.1)',
                color: 'var(--primary-color)',
              }}
            >
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3
                className="text-base font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                Guest Profile
              </h3>
              {guest && (
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  ID: #{guest.id} • Member since {new Date(guest.createdAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded flex items-center justify-center transition-colors hover:bg-gray-700"
            style={{ color: 'var(--text-secondary)' }}
          >
            <X className="w-3 h-3" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-130px)] p-6">
          {loading && <GuestViewSkeleton />}

          {error && (
            <div
              className="p-4 rounded-lg flex items-center gap-3"
              style={{
                backgroundColor: 'rgba(255,76,76,0.1)',
                color: 'var(--status-cancelled)',
              }}
            >
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {guest && !loading && !error && (
            <div className="space-y-6">
              {/* Badge row */}
              <div className="flex justify-between items-center">
                <GuestTypeBadge totalBookings={summary.totalBookings} />
              </div>

              {/* Guest Info + Stats side by side on larger screens */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <GuestInfoCard guest={guest} />
                </div>
                <div>
                  <GuestStatsCard
                    totalBookings={summary.totalBookings}
                    totalSpent={summary.totalSpent}
                    avgNights={summary.avgNights}
                    lastVisit={summary.lastVisit}
                    firstVisit={summary.firstVisit}
                    loading={bookingsLoading}
                  />
                </div>
              </div>

              {/* Booking History */}
              {showBookings && (
                <BookingHistoryCard
                  bookings={bookingHistory}
                  loading={bookingsLoading}
                  guestId={guest.id}
                />
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="p-4 border-t flex justify-end"
          style={{
            borderColor: 'var(--border-color)',
            backgroundColor: 'var(--card-secondary-bg)',
          }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 rounded text-sm font-medium transition-colors"
            style={{
              backgroundColor: 'transparent',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
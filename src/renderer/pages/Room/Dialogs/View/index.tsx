// src/renderer/components/Room/View/RoomViewDialog.tsx

import React from 'react';
import { X, AlertCircle } from 'lucide-react';
import { useRoomView } from './hooks/useRoomView';
import { RoomViewSkeleton } from './components/RoomViewSkeleton';
import { RoomInfoCard } from './components/RoomInfoCard';
import { RoomPriceCard } from './components/RoomPriceCard';
import { AmenitiesCard } from './components/AmenitiesCard';
import { RecentBookingsCard } from './components/RecentBookingsCard';

interface RoomViewDialogProps {
  id: number;
  isOpen: boolean;
  onClose: () => void;
  showBookings?: boolean; // whether to display recent bookings
}

export const RoomViewDialog: React.FC<RoomViewDialogProps> = ({
  id,
  isOpen,
  onClose,
  showBookings = true,
}) => {
  const { room, loading, error, recentBookings, bookingsLoading } = useRoomView({
    id,
    includeBookings: showBookings,
  });

  if (!isOpen) return null;
  console.log('RoomViewDialog render', { id, room, loading, error });

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
            <h3
              className="text-base font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              Room Details
            </h3>
            {room && (
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: 'rgba(212,175,55,0.1)',
                  color: 'var(--text-secondary)',
                }}
              >
                #{room.roomNumber}
              </span>
            )}
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
          {loading && <RoomViewSkeleton />}

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

          {room && !loading && !error && (
            <div className="space-y-6">
              {/* Room Info + Price (side by side on larger screens) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <RoomInfoCard room={room} />
                </div>
                <div>
                  <RoomPriceCard pricePerNight={room.pricePerNight} />
                </div>
              </div>

              {/* Amenities */}
              <AmenitiesCard amenities={room.amenities} />

              {/* Recent Bookings */}
              {showBookings && (
                <RecentBookingsCard
                  bookings={recentBookings}
                  loading={bookingsLoading}
                  roomId={room.id}
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
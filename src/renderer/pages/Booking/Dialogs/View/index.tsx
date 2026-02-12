// src/renderer/components/Booking/View/BookingViewDialog.tsx

import React from "react";
import { X, Loader, AlertCircle } from "lucide-react";
import { useBookingView } from "./hooks/useBookingView";
import { BookingViewSkeleton } from "./components/BookingViewSkeleton";
import { BookingStatusBadge } from "./components/BookingStatusBadge";
import { RoomInfoCard } from "./components/RoomInfoCard";
import { StayDetailsCard } from "./components/StayDetailsCard";
import { GuestInfoCard } from "./components/GuestInfoCard";
import { PriceSummaryCard } from "./components/PriceSummaryCard";
import { SpecialRequestsCard } from "./components/SpecialRequestsCard";

interface BookingViewDialogProps {
  id: number;
  isOpen: boolean;
  onClose: () => void;
}

export const BookingViewDialog: React.FC<BookingViewDialogProps> = ({
  id,
  isOpen,
  onClose,
}) => {
  const {
    booking,
    loading,
    error,
    nights,
    totalPrice,
    formattedCheckIn,
    formattedCheckOut,
  } = useBookingView({ id, onError: (msg) => console.error(msg) });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div
        className="w-full max-w-3xl rounded-lg shadow-2xl border max-h-[90vh] overflow-hidden"
        style={{
          backgroundColor: "var(--card-bg)",
          borderColor: "var(--border-color)",
        }}
      >
        {/* Header */}
        <div
          className="p-4 border-b flex items-center justify-between"
          style={{
            borderColor: "var(--border-color)",
            backgroundColor: "var(--card-secondary-bg)",
          }}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <h3
                className="text-base font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Booking Details
              </h3>
              {booking && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: "rgba(212,175,55,0.1)",
                    color: "var(--text-secondary)",
                  }}
                >
                  #{booking.id}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded flex items-center justify-center transition-colors hover:bg-gray-700"
            style={{ color: "var(--text-secondary)" }}
          >
            <X className="w-3 h-3" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-130px)] p-6">
          {loading && <BookingViewSkeleton />}

          {error && (
            <div
              className="p-4 rounded-lg flex items-center gap-3"
              style={{
                backgroundColor: "rgba(255,76,76,0.1)",
                color: "var(--status-cancelled)",
              }}
            >
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {booking && !loading && !error && (
            <div className="space-y-6">
              {/* Status + Summary Row */}
              <div className="flex items-center justify-between">
                <BookingStatusBadge status={booking.status} />
                <span
                  className="text-xs"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  Created: {new Date(booking.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Two‑column layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <RoomInfoCard room={booking.room} />
                  <StayDetailsCard
                    checkIn={booking.checkInDate}
                    checkOut={booking.checkOutDate}
                    nights={nights}
                    guests={booking.numberOfGuests}
                    formattedCheckIn={formattedCheckIn}
                    formattedCheckOut={formattedCheckOut}
                  />
                </div>
                <div className="space-y-6">
                  <GuestInfoCard guest={booking.guest} />
                  <PriceSummaryCard
                    pricePerNight={booking.room?.pricePerNight}
                    nights={nights}
                    totalPrice={totalPrice}
                  />
                </div>
              </div>

              {/* Special requests – full width */}
              <SpecialRequestsCard
                requests={booking.specialRequests as string | null}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="p-4 border-t flex justify-end"
          style={{
            borderColor: "var(--border-color)",
            backgroundColor: "var(--card-secondary-bg)",
          }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 rounded text-sm font-medium transition-colors"
            style={{
              backgroundColor: "transparent",
              border: "1px solid var(--border-color)",
              color: "var(--text-secondary)",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// src/renderer/components/Room/View/sections/RecentBookingsCard.tsx
import React from "react";
import { Calendar, Users, Loader } from "lucide-react";
import type { Booking } from "../../../../../api/booking";
import { formatCurrency, formatDate } from "../../../../../utils/formatters";

interface Props {
  bookings: Booking[];
  loading: boolean;
  roomId: number;
}

export const RecentBookingsCard: React.FC<Props> = ({
  bookings,
  loading,
  roomId,
}) => {
  const statusColors: Record<string, { bg: string; text: string }> = {
    confirmed: {
      bg: "rgba(212,175,55,0.2)", // gold
      text: "var(--status-confirmed)",
    },
    checked_in: {
      bg: "rgba(74,222,128,0.2)", // green
      text: "var(--status-available)",
    },
    checked_out: {
      bg: "rgba(59,130,246,0.2)", // blue
      text: "var(--status-info)",
    },
    cancelled: {
      bg: "rgba(255,76,76,0.2)", // red
      text: "var(--status-cancelled)",
    },
    pending: {
      bg: "rgba(234,179,8,0.2)", // yellow
      text: "var(--status-pending)",
    },
  };

  if (loading) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Calendar
            className="w-4 h-4"
            style={{ color: "var(--text-secondary)" }}
          />
          <h4
            className="text-sm font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Recent Bookings
          </h4>
        </div>
        <div
          className="flex items-center gap-2 text-sm"
          style={{ color: "var(--text-tertiary)" }}
        >
          <Loader className="w-3.5 h-3.5 animate-spin" />
          <span>Loading bookings...</span>
        </div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Calendar
            className="w-4 h-4"
            style={{ color: "var(--text-secondary)" }}
          />
          <h4
            className="text-sm font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Recent Bookings
          </h4>
        </div>
        <p className="text-sm italic" style={{ color: "var(--text-tertiary)" }}>
          No recent bookings for this room.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Calendar
          className="w-4 h-4"
          style={{ color: "var(--text-secondary)" }}
        />
        <h4
          className="text-sm font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          Recent Bookings
        </h4>
      </div>
      <div className="space-y-2">
        {bookings.map((booking) => {
          const guestName = booking.guest?.fullName ?? "Unknown Guest";

          const checkIn = formatDate(booking.checkInDate);
          const checkOut = formatDate(booking.checkOutDate);
          const statusLabel = booking.status.split("_").join(" ");

          const colors = statusColors[booking.status] || {
            bg: "rgba(156,163,175,0.2)",
            text: "var(--text-secondary)",
          };

          return (
            <div
              key={booking.id}
              className="p-2 rounded text-sm"
              style={{
                backgroundColor: "var(--card-secondary-bg)",
                border: "1px solid var(--border-color)",
              }}
            >
              <div className="flex justify-between items-center">
                <span style={{ color: "var(--text-primary)" }}>
                  {guestName}
                </span>
                <span
                  className="text-xs px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: colors.bg, color: colors.text }}
                >
                  {statusLabel}
                </span>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span style={{ color: "var(--text-secondary)" }}>
                  {checkIn} – {checkOut}
                </span>
                <span style={{ color: "var(--primary-color)" }}>
                  {formatCurrency(booking.totalPrice)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

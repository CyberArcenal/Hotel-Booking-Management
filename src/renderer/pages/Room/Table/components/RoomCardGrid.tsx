import React from "react";
import {
  Home,
  Users,
  DollarSign,
  Calendar,
  Eye,
  Edit,
  PlusCircle,
  Wrench,
  CheckCircle,
  Clock,
} from "lucide-react";
import type { Booking, Room } from "../../../../api/room";
import { formatCurrency } from "../../../../utils/formatters";

// ----------------------------------------------------------------------
// 📦 Helper: Determine current room status & active booking
// ----------------------------------------------------------------------
function getRoomStatus(room: Room): {
  status: "available" | "occupied" | "maintenance";
  activeBooking?: Booking;
  guestName?: string;
  checkIn?: string;
  checkOut?: string;
} {
  if (!room.isAvailable) {
    return { status: "maintenance" };
  }

  const today = new Date().toISOString().split("T")[0];
  const activeBooking = room.bookings?.find((b) => {
    if (b.status === "cancelled") return false;
    if (b.status === "checked_in") return true;
    if (b.status === "confirmed") {
      return today >= b.checkInDate && today < b.checkOutDate;
    }
    return false;
  });

  if (activeBooking) {
    return {
      status: "occupied",
      activeBooking,
      guestName: "Guest", // Replace with real guest name when available
      checkIn: activeBooking.checkInDate,
      checkOut: activeBooking.checkOutDate,
    };
  }

  return { status: "available" };
}

// ----------------------------------------------------------------------
// 🃏 RoomCard – Fully fluid, uses clamp() for spacing & typography
// ----------------------------------------------------------------------
interface RoomCardProps {
  room: Room;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onBook: (id: number) => void;
}

const RoomCard: React.FC<RoomCardProps> = ({
  room,
  onView,
  onEdit,
  onBook,
}) => {
  const { status, guestName, checkIn, checkOut } = getRoomStatus(room);

  const statusConfig = {
    available: {
      icon: CheckCircle,
      text: "Available",
      bg: "bg-[var(--status-available-room)]/10",
      textColor: "text-[var(--status-available-room)]",
      border: "border-[var(--status-available-room)]/30",
    },
    occupied: {
      icon: Clock,
      text: "Occupied",
      bg: "bg-[var(--status-occupied)]/10",
      textColor: "text-[var(--status-occupied)]",
      border: "border-[var(--status-occupied)]/30",
    },
    maintenance: {
      icon: Wrench,
      text: "Maintenance",
      bg: "bg-[var(--status-maintenance)]/10",
      textColor: "text-[var(--status-maintenance)]",
      border: "border-[var(--status-maintenance)]/30",
    },
  }[status];

  const StatusIcon = statusConfig.icon;

  return (
    <div
      className="
        group relative
        bg-[var(--card-bg)] 
        border border-[var(--border-color)]/20 
        rounded-xl
        transition-all duration-300 ease-out
        hover:border-[var(--primary-color)]/40 
        hover:shadow-lg hover:shadow-[var(--primary-color)]/10
        hover:bg-[var(--card-hover-bg)]/20
        flex flex-col
      "
      style={{
        // 🎯 Fluid padding: minimum 1rem, scales with viewport, maximum 1.5rem
        padding: "clamp(1rem, 3vw, 1.5rem)",
        // 🎯 Gap between children scales smoothly
        gap: "clamp(0.75rem, 2vw, 1.25rem)",
      }}
    >
      {/* Header: Room Number + Status Badge */}
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <h3
            className="font-semibold truncate"
            style={{
              color: "var(--text-primary)",
              // 🎯 Fluid font size: 1.125rem → 1.25rem
              fontSize: "clamp(1.125rem, 2.5vw, 1.25rem)",
              lineHeight: 1.2,
            }}
          >
            Room {room.roomNumber}
          </h3>
          <p
            className="text-sm truncate"
            style={{ color: "var(--text-secondary)" }}
          >
            {room.type}
          </p>
        </div>
        <div
          className={`
            inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap
            ${statusConfig.bg} ${statusConfig.textColor} ${statusConfig.border} border
            backdrop-blur-sm
          `}
        >
          <StatusIcon className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="hidden xs:inline">{statusConfig.text}</span>
          <span className="xs:hidden">{statusConfig.text.charAt(0)}</span>
        </div>
      </div>

      {/* Room Details Icons – fluid spacing */}
      <div
        className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm"
        style={{ color: "var(--text-secondary)" }}
      >
        <div className="flex items-center gap-1.5">
          <Users className="w-4 h-4 flex-shrink-0 text-[var(--primary-color)]" />
          <span className="truncate">Cap: {room.capacity}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <DollarSign className="w-4 h-4 flex-shrink-0 text-[var(--primary-color)]" />
          <span className="truncate">{formatCurrency(room.pricePerNight)}</span>
        </div>
        {room.amenities && (
          <div className="flex items-center gap-1.5 min-w-0 max-w-full">
            <Home className="w-4 h-4 flex-shrink-0 text-[var(--primary-color)]" />
            <span className="truncate">{room.amenities}</span>
          </div>
        )}
      </div>

      {/* Booking Info – only if occupied */}
      {status === "occupied" && guestName && checkIn && checkOut && (
        <div
          className="bg-[var(--card-secondary-bg)] rounded-lg p-3 text-sm border-l-4 border-[var(--primary-color)] shadow-sm"
          style={{
            padding: "clamp(0.5rem, 1.5vw, 0.75rem)",
          }}
        >
          <div className="flex items-center gap-2 font-medium truncate">
            <Calendar className="w-4 h-4 flex-shrink-0 text-[var(--primary-color)]" />
            <span style={{ color: "var(--text-primary)" }} className="truncate">
              {guestName}
            </span>
          </div>
          <div className="flex flex-wrap justify-between gap-1 text-xs mt-1">
            <span style={{ color: "var(--text-tertiary)" }}>In: {checkIn}</span>
            <span style={{ color: "var(--text-tertiary)" }}>Out: {checkOut}</span>
          </div>
        </div>
      )}

      {/* Action Buttons – fluid spacing, no windows-btn classes */}
      <div
        className="flex items-center gap-2 mt-1"
        style={{ gap: "clamp(0.25rem, 1vw, 0.5rem)" }}
      >
        <button
          onClick={() => onView(room.id)}
          className="
            flex-1 inline-flex items-center justify-center gap-1.5
            text-sm py-2 px-2 rounded-lg
            bg-[var(--card-secondary-bg)] 
            hover:bg-[var(--card-hover-bg)] 
            text-[var(--text-primary)] 
            border border-[var(--border-color)]/20
            hover:border-[var(--border-color)]/40
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/50
          "
          aria-label={`View room ${room.roomNumber}`}
        >
          <Eye className="w-4 h-4 flex-shrink-0" />
          <span className="xs:inline hidden">View</span>
        </button>
        <button
          onClick={() => onEdit(room.id)}
          className="
            flex-1 inline-flex items-center justify-center gap-1.5
            text-sm py-2 px-2 rounded-lg
            bg-[var(--card-secondary-bg)] 
            hover:bg-[var(--card-hover-bg)] 
            text-[var(--text-primary)] 
            border border-[var(--border-color)]/20
            hover:border-[var(--border-color)]/40
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/50
          "
          aria-label={`Edit room ${room.roomNumber}`}
        >
          <Edit className="w-4 h-4 flex-shrink-0" />
          <span className="xs:inline hidden">Edit</span>
        </button>
        <button
          onClick={() => onBook(room.id)}
          disabled={status !== "available"}
          className={`
            flex-1 inline-flex items-center justify-center gap-1.5
            text-sm py-2 px-2 rounded-lg
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/50
            ${
              status === "available"
                ? "bg-[var(--primary-color)] hover:bg-[var(--primary-hover)] text-black font-medium shadow-md hover:shadow-lg"
                : "bg-[var(--card-secondary-bg)] text-[var(--text-tertiary)] cursor-not-allowed opacity-60 border border-[var(--border-color)]/10"
            }
          `}
          aria-label={`Book room ${room.roomNumber}`}
        >
          <PlusCircle className="w-4 h-4 flex-shrink-0" />
          <span className="xs:inline hidden">Book</span>
        </button>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// 🏨 RoomCardGrid – Fluid grid with auto-fit + minmax
// ----------------------------------------------------------------------
interface RoomCardGridProps {
  rooms: Room[];
  onViewRoom: (id: number) => void;
  onEditRoom: (id: number) => void;
  onBookRoom: (id: number) => void;
  isLoading?: boolean;
}

const RoomCardGrid: React.FC<RoomCardGridProps> = ({
  rooms,
  onViewRoom,
  onEditRoom,
  onBookRoom,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--primary-color)]"></div>
      </div>
    );
  }

  if (!rooms.length) {
    return (
      <div className="text-center py-16 bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)]/20">
        <Home className="w-16 h-16 mx-auto text-[var(--text-tertiary)] mb-4" />
        <h3
          className="text-xl font-medium mb-2"
          style={{ color: "var(--text-primary)" }}
        >
          No rooms found
        </h3>
        <p style={{ color: "var(--text-secondary)" }}>
          Try adjusting your filters or add a new room.
        </p>
      </div>
    );
  }

  return (
    <div
      className="w-full"
      style={{
        display: "grid",
        // 🎯 FLUID GRID: auto‑fit, minimum 260px, maximum 1fr
        gridTemplateColumns: "repeat(auto-fit, minmax(min(260px, 100%), 1fr))",
        gap: "clamp(1rem, 2vw, 1.5rem)",
      }}
    >
      {rooms.map((room) => (
        <RoomCard
          key={room.id}
          room={room}
          onView={onViewRoom}
          onEdit={onEditRoom}
          onBook={onBookRoom}
        />
      ))}
    </div>
  );
};

export default RoomCardGrid;
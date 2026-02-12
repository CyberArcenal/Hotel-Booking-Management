// src/pages/Room/components/RoomCardGrid.tsx
import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
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
  MoreVertical,
  Trash2,
} from "lucide-react";
import type { Booking, Room } from "../../../api/room";
import { formatCurrency } from "../../../utils/formatters";
import bookingAPI from "../../../api/booking";

// ----------------------------------------------------------------------
// Helper: find the active booking for a room (if any)
// ----------------------------------------------------------------------
// function findActiveBooking(room: Room): Booking | undefined {
//   const today = new Date().toISOString().split("T")[0];
//   return room.bookings?.find((b) => {
//     if (b.status === "cancelled") return false;
//     if (b.status === "checked_in") return true;
//     if (b.status === "confirmed") {
//       return today >= b.checkInDate && today < b.checkOutDate;
//     }
//     return false;
//   });
// }

const findActiveBooking = async (room: Room) => {
  try {
    const bookings = await bookingAPI.getByRoom(room.id);

    const today = new Date().toISOString().split("T")[0];

    return (bookings.data as unknown as Booking[]).find((b) => {
      if (b.status === "checked_in") return true;
      if (b.status === "confirmed") return true;
      if (b.status === "pending") return true;
      return false;
    });
  } catch (error) {
    console.error("Error finding active booking:", error);
    return undefined;
  }
};

// ----------------------------------------------------------------------
// RoomCard – uses status directly, portal-based dropdown
// ----------------------------------------------------------------------
interface RoomCardProps {
  room: Room;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onBook: (id: number) => void;
  onMarkMaintenance?: (id: number) => void;
  onMarkAvailable?: (id: number) => void;
  onDeleteRoom?: (id: number) => void;
}

const RoomCard: React.FC<RoomCardProps> = ({
  room,
  onView,
  onEdit,
  onBook,
  onMarkMaintenance,
  onMarkAvailable,
  onDeleteRoom,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [activeBooking, setActiveBooking] = useState<Booking | undefined>(
    undefined,
  );
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    right: 0,
  });

  const status = room.status; // ✅ trust the backend status
  useEffect(() => {
    findActiveBooking(room).then(setActiveBooking);
  }, [room]);
  // Update dropdown position when opened
  useEffect(() => {
    if (dropdownOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 5,
        right: window.innerWidth - rect.right,
      });
    }
  }, [dropdownOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownOpen &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node) &&
        !(e.target as Element)?.closest?.(".room-card-dropdown")
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDropdownOpen((prev) => !prev);
  };

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
  const canDelete = !activeBooking && onDeleteRoom;

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
        h-full
        p-[clamp(1rem,3vw,1.5rem)]
        gap-[clamp(0.75rem,2vw,1.25rem)]
      "
    >
      {/* Header: Room Number + Status Badge + More Actions */}
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold truncate text-[clamp(1.125rem,2.5vw,1.25rem)] text-[var(--text-primary)]">
            Room {room.roomNumber}
          </h3>
          <p className="text-sm truncate text-[var(--text-secondary)] capitalize">
            {room.type}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* More Actions Button */}
          <button
            ref={buttonRef}
            onClick={toggleDropdown}
            className="p-1.5 rounded-lg hover:bg-[var(--card-hover-bg)] text-[var(--text-secondary)]
                       hover:text-[var(--primary-color)] transition-colors relative z-10"
            aria-label="More actions"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {/* Status Badge */}
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
      </div>

      {/* Dropdown Portal */}
      {dropdownOpen &&
        ReactDOM.createPortal(
          <div
            className="room-card-dropdown fixed bg-[var(--card-bg)] rounded-lg shadow-xl 
                       border border-[var(--border-color)]/30 min-w-[180px] py-1 
                       windows-fade-in z-[9999]"
            style={{
              top: dropdownPosition.top,
              right: dropdownPosition.right,
            }}
          >
            {/* Maintenance toggle */}
            {status === "available" && onMarkMaintenance && (
              <button
                onClick={() => {
                  onMarkMaintenance(room.id);
                  setDropdownOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm 
                         text-[var(--text-primary)] hover:bg-[var(--card-hover-bg)] 
                         transition-colors"
              >
                <Wrench className="w-4 h-4 text-[var(--status-maintenance)]" />
                <span>Mark as Maintenance</span>
              </button>
            )}
            {status === "maintenance" && onMarkAvailable && (
              <button
                onClick={() => {
                  onMarkAvailable(room.id);
                  setDropdownOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm 
                         text-[var(--text-primary)] hover:bg-[var(--card-hover-bg)] 
                         transition-colors"
              >
                <CheckCircle className="w-4 h-4 text-[var(--status-available-room)]" />
                <span>Mark as Available</span>
              </button>
            )}

            {/* Delete – only if allowed */}
            {canDelete && (
              <>
                {(status === "available" || status === "maintenance") && (
                  <div className="border-t border-[var(--border-color)]/20 my-1" />
                )}
                <button
                  onClick={() => {
                    onDeleteRoom?.(room.id);
                    setDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm 
                           text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Room</span>
                </button>
              </>
            )}
          </div>,
          document.body,
        )}

      {/* Room Details Icons */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm flex-1 text-[var(--text-secondary)]">
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
      {status === "occupied" && activeBooking && (
        <div className="bg-[var(--card-secondary-bg)] rounded-lg p-3 text-sm border-l-4 border-[var(--primary-color)] shadow-sm">
          <div className="flex items-center gap-2 font-medium truncate">
            <Calendar className="w-4 h-4 flex-shrink-0 text-[var(--primary-color)]" />
            <span className="truncate text-[var(--text-primary)]">
              {activeBooking?.guest?.fullName || "Guest"}{" "}
              {/* assumes guest relation */}
            </span>
          </div>
          <div className="flex flex-wrap justify-between gap-1 text-xs mt-1">
            <span className="text-[var(--text-tertiary)]">
              In: {activeBooking.checkInDate}
            </span>
            <span className="text-[var(--text-tertiary)]">
              Out: {activeBooking.checkOutDate}
            </span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-2 mt-1">
        <button
          onClick={() => onView(room.id)}
          className="flex-1 inline-flex items-center justify-center gap-1.5
                     text-sm py-2 px-2 rounded-lg
                     bg-[var(--card-secondary-bg)] hover:bg-[var(--card-hover-bg)]
                     text-[var(--text-primary)] border border-[var(--border-color)]/20
                     hover:border-[var(--border-color)]/40 transition-all
                     focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/50"
        >
          <Eye className="w-4 h-4 flex-shrink-0" />
          <span className="xs:inline hidden">View</span>
        </button>
        <button
          onClick={() => onEdit(room.id)}
          className="flex-1 inline-flex items-center justify-center gap-1.5
                     text-sm py-2 px-2 rounded-lg
                     bg-[var(--card-secondary-bg)] hover:bg-[var(--card-hover-bg)]
                     text-[var(--text-primary)] border border-[var(--border-color)]/20
                     hover:border-[var(--border-color)]/40 transition-all
                     focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/50"
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
        >
          <PlusCircle className="w-4 h-4 flex-shrink-0" />
          <span className="xs:inline hidden">Book</span>
        </button>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// RoomCardGrid – auto-fill grid with equal-height cards
// ----------------------------------------------------------------------
interface RoomCardGridProps {
  rooms: Room[];
  onViewRoom: (id: number) => void;
  onEditRoom: (id: number) => void;
  onBookRoom: (id: number) => void;
  onMarkMaintenance?: (id: number) => void;
  onMarkAvailable?: (id: number) => void;
  onDeleteRoom?: (id: number) => void;
  isLoading?: boolean;
}

const RoomCardGrid: React.FC<RoomCardGridProps> = ({
  rooms,
  onViewRoom,
  onEditRoom,
  onBookRoom,
  onMarkMaintenance,
  onMarkAvailable,
  onDeleteRoom,
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
        <h3 className="text-xl font-medium mb-2 text-[var(--text-primary)]">
          No rooms found
        </h3>
        <p className="text-[var(--text-secondary)]">
          Try adjusting your filters or add a new room.
        </p>
      </div>
    );
  }

  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: "clamp(1rem, 2vw, 1.5rem)",
        alignItems: "stretch",
      }}
    >
      {rooms.map((room) => (
        <RoomCard
          key={room.id}
          room={room}
          onView={onViewRoom}
          onEdit={onEditRoom}
          onBook={onBookRoom}
          onMarkMaintenance={onMarkMaintenance}
          onMarkAvailable={onMarkAvailable}
          onDeleteRoom={onDeleteRoom}
        />
      ))}
    </div>
  );
};

export default RoomCardGrid;

// src/pages/Room/RoomPage.tsx
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Filter, Plus } from "lucide-react";
import { useRooms } from "./hooks/useRooms";
import { RoomSearch } from "./components/RoomSearch";
import { RoomFilterPanel } from "./components/RoomFilterPanel";
import RoomCardGrid from "./components/RoomCardGrid";
import Pagination from "../../components/Shared/Pagination";
import RoomFormDialog from "../../components/RoomForm";
import type { Room } from "../../api/room";
import BookingFormDialog from "../../components/BookingForm";
import type { Booking } from "../../api/booking";
import { dialogs } from "../../utils/dialogs";
import { RoomViewDialog } from "./Dialogs/View";
import roomAPI from "../../api/room";
import { BookingViewDialog } from "../Booking/Dialogs/View";
import type { Guest } from "../../api/guest";

const RoomPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    rooms,
    loading,
    error,
    filters,
    setFilters,
    searchQuery,
    setSearchQuery,
    clearFilters,
    refetch,
  } = useRooms();

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isBookingFormDialogOpen, setIsBookingFormDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const [isBookingViewDialogOpen, setIsBookingViewDialogOpen] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    clearFilters();
    setCurrentPage(1);
  };

  const paginatedRooms = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return rooms.slice(start, start + pageSize);
  }, [rooms, currentPage, pageSize]);

  const totalRooms = rooms.length;

  const handleView = (id: number) => {
    setSelectedRoom(rooms.find((r) => r.id === id) || null);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (id: number) => {
    setSelectedRoom(rooms.find((r) => r.id === id) || null);
    setIsFormDialogOpen(true);
  };

  const handleBook = (id: number) => {
    setSelectedRoom(rooms.find((r) => r.id === id) || null);
    setIsBookingFormDialogOpen(true);
  };

  // ✅ Updated: use updateStatus instead of setAvailability
  const handleMarkMaintenance = async (id: number) => {
    try {
      await roomAPI.updateStatus({ id, status: "maintenance" });
      refetch();
    } catch (error) {
      console.error("Failed to mark as maintenance:", error);
    }
  };

  const handleMarkAvailable = async (id: number) => {
    try {
      await roomAPI.updateStatus({ id, status: "available" });
      refetch();
    } catch (error) {
      console.error("Failed to mark as available:", error);
    }
  };

  const handleDeleteRoom = async (id: number) => {
    if (
      await dialogs.confirm({
        title: "Delete room?",
        message: "This action cannot be undone.",
      })
    ) {
      try {
        await roomAPI.delete({ id });
        refetch();
      } catch (error) {
        console.error("Failed to delete room:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background-color)]">
      <main className="mx-auto px-2 py-2">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">
              Rooms
            </h2>
            <p className="text-[var(--text-secondary)] mt-1">
              {totalRooms} room{totalRooms !== 1 ? "s" : ""} available
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setSelectedRoom(null);
                setIsFormDialogOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg
                         bg-[var(--card-secondary-bg)] hover:bg-[var(--card-hover-bg)]
                         text-[var(--text-primary)] border border-[var(--border-color)]/20
                         hover:border-[var(--border-color)]/40 transition-all"
            >
              <Plus className="w-4 h-4" />
              Create Room
            </button>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg
                         bg-[var(--card-secondary-bg)] hover:bg-[var(--card-hover-bg)]
                         text-[var(--text-primary)] border border-[var(--border-color)]/20
                         hover:border-[var(--border-color)]/40 transition-all"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <RoomSearch value={searchQuery} onChange={handleSearchChange} />
          {searchQuery && (
            <span className="text-sm text-[var(--text-secondary)]">
              Searching: “{searchQuery}”
            </span>
          )}
        </div>

        {/* Filter panel */}
        <RoomFilterPanel
          filters={filters}
          onChange={handleFilterChange}
          onClear={handleClearFilters}
          isOpen={isFilterOpen}
          onToggle={() => setIsFilterOpen(!isFilterOpen)}
        />

        {/* Error display */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mt-4 text-red-400">
            {error}
            <button onClick={refetch} className="ml-3 underline">
              Retry
            </button>
          </div>
        )}

        {/* Room grid */}
        <div className="mt-6">
          <RoomCardGrid
            rooms={paginatedRooms}
            onViewRoom={handleView}
            onEditRoom={handleEdit}
            onBookRoom={handleBook}
            onMarkMaintenance={handleMarkMaintenance}
            onMarkAvailable={handleMarkAvailable}
            onDeleteRoom={handleDeleteRoom}
            isLoading={loading}
          />
        </div>

        {/* Pagination */}
        {!loading && totalRooms > 0 && (
          <Pagination
            currentPage={currentPage}
            totalItems={totalRooms}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[12, 24, 48, 96]}
            showPageSize
          />
        )}
      </main>

      {/* Dialogs */}
      {isFormDialogOpen && (
        <RoomFormDialog
          id={selectedRoom?.id}
          mode={selectedRoom ? "edit" : "add"}
          onClose={() => {
            setIsFormDialogOpen(false);
            setSelectedRoom(null);
          }}
          onSuccess={() => {
            refetch();
            setIsFormDialogOpen(false);
            setSelectedRoom(null);
          }}
        />
      )}

      {isBookingFormDialogOpen && selectedRoom && (
        <BookingFormDialog
          mode="add"
          roomId={selectedRoom.id}
          onClose={() => {
            setIsBookingFormDialogOpen(false);
            setSelectedRoom(null);
          }}
          onSuccess={async (booking: Booking) => {
            setIsBookingFormDialogOpen(false);
            refetch();
            if (
              await dialogs.confirm({
                title: "Booking created successfully!",
                message: `Room ${booking.room.roomNumber} has been booked.\n\nDo you want to view the booking details?`,
              })
            ) {
              setSelectedBooking(booking);
              setIsBookingViewDialogOpen(true);
            }
          }}
        />
      )}

      {isViewDialogOpen && selectedRoom && (
        <RoomViewDialog
          id={selectedRoom.id}
          isOpen={isViewDialogOpen}
          onClose={() => {
            setIsViewDialogOpen(false);
            setSelectedRoom(null);
          }}
          showBookings
        />
      )}

      {isBookingViewDialogOpen && selectedBooking && (
        <BookingViewDialog
          id={selectedBooking.id!}
          isOpen={isBookingViewDialogOpen}
          onClose={() => {
            setIsBookingViewDialogOpen(false);
            setSelectedBooking(null);
          }}
        />
      )}
    </div>
  );
};

export default RoomPage;

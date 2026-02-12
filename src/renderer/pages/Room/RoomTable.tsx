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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12); // 12 cards per row (3-4 columns)

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isBookingFormDialogOpen, setIsBookingFormDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  // Reset to page 1 when filters or search changes
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

  // Paginate rooms
  const paginatedRooms = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return rooms.slice(startIndex, startIndex + pageSize);
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
  const handleBook = async (id: number) => {
    setSelectedRoom(rooms.find((r) => r.id === id) || null);
    setIsBookingFormDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-[var(--background-color)]">
      <main className="container mx-auto px-4 py-6 md:px-6">
        {/* Header with title and actions */}
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
              onClick={() => setIsFormDialogOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg
                         bg-[var(--card-secondary-bg)] hover:bg-[var(--card-hover-bg)]
                         text-[var(--text-primary)] border border-[var(--border-color)]/20
                         hover:border-[var(--border-color)]/40 transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              Create Room
            </button>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg
                         bg-[var(--card-secondary-bg)] hover:bg-[var(--card-hover-bg)]
                         text-[var(--text-primary)] border border-[var(--border-color)]/20
                         hover:border-[var(--border-color)]/40 transition-all duration-200"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>
        </div>

        {/* Search bar */}
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
            showPageSize={true}
          />
        )}
      </main>
      {isFormDialogOpen && (
        <RoomFormDialog
          id={selectedRoom ? selectedRoom.id : undefined}
          mode={"add"}
          onClose={function (): void {
            setIsFormDialogOpen(false);
            setSelectedRoom(null);
          }}
          onSuccess={function (room: Room): void {
            setIsFormDialogOpen(false);
            setSelectedRoom(null);
            refetch();
          }}
        />
      )}
      {isBookingFormDialogOpen && selectedRoom && (
        <BookingFormDialog
          mode={"add"}
          roomId={selectedRoom.id}
          onClose={function (): void {
            setIsBookingFormDialogOpen(false);
          }}
          onSuccess={async (booking: Booking) => {
            setIsBookingFormDialogOpen(false);
            await dialogs.success(
              `Booking created successfully!`,
              `Room ${selectedRoom.roomNumber} has been booked.`,
            );
            refetch();
          }}
        />
      )}

      {isViewDialogOpen && selectedRoom && (
        <RoomViewDialog
          id={selectedRoom.id!}
          isOpen={isViewDialogOpen}
          onClose={() => {
            setIsViewDialogOpen(false);
            setSelectedRoom(null);
          }}
          showBookings={true} // optional, defaults to true
        />
      )}
    </div>
  );
};

export default RoomPage;

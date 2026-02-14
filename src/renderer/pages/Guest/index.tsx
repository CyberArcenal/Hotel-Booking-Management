import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Filter, Download, Plus } from "lucide-react";
import { useGuests } from "./hooks/useGuests";
import GuestSearch from "./components/GuestSearch";
import GuestFilterPanel from "./components/GuestFilterPanel";
import GuestTable from "./components/GuestTable";
import GuestQuickStats from "./components/GuestQuickStats";
import Pagination from "../../components/Shared/Pagination";
import guestAPI, { type Guest } from "../../api/guest";
import { GuestViewDialog } from "./Dialogs/View";
import { GuestFormDialog } from "./Dialogs/Form";
import BookingFormDialog from "../../components/BookingForm";
import type { Booking } from "../../api/booking";
import { dialogs } from "../../utils/dialogs";
import { BookingViewDialog } from "../Booking/Dialogs/View";

const GuestPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    guests,
    total,
    totalPages,
    currentPage,
    pageSize,
    loading,
    error,
    filters,
    setFilters,
    setPage,
    setPageSize,
    setSearchQuery,
    clearFilters,
    refetch,
    activeGuestIds,
  } = useGuests();

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");

  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isBookingViewDialogOpen, setIsBookingViewDialogOpen] = useState(false);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isBookingFormDialogOpen, setIsBookingFormDialogOpen] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const handleSearchChange = (query: string) => {
    setSearchInput(query);
    setSearchQuery(query);
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    clearFilters();
    setSearchInput("");
  };

  const handleExport = async () => {
    try {
      const result = await guestAPI.exportToCSV(filters, "admin");
      if (result.status && result.data?.data) {
        // Simulate file download
        const blob = new Blob([result.data.data], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = result.data.filename || "guests.csv";
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        alert("Export failed");
      }
    } catch (err) {
      console.error(err);
      alert("Export failed");
    }
  };

  const handleView = (id: number) => {
    setSelectedGuest(guests.find((g) => g.id === id) || null);
    setIsViewDialogOpen(true);
  };
  const handleEdit = (id: number) => {
    setSelectedGuest(guests.find((g) => g.id === id) || null);
    setIsFormDialogOpen(true);
  };
  const handleDelete = async (id: number) => {
    if (
      await dialogs.confirm({
        title: "Delete Guest",
        message: "Are you sure you want to delete this guest?",
      })
    ) {
      try {
        await guestAPI.delete(id, "admin");
        refetch();
      } catch (err) {
        dialogs.alert({
          title: "Failed to delete guest",
          message: "An error occurred while deleting the guest.",
        });
      }
    }
  };
  const handleAddBooking = (guestId: number) => {
    setIsBookingFormDialogOpen(true);
    setSelectedGuest(guests.find((g) => g.id === guestId) || null);
  };

  return (
    <div className="min-h-screen bg-[var(--background-color)]">
      <main className="mx-auto px-2 py-2">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">
              Guests
            </h2>
            <p className="text-[var(--text-secondary)] mt-1">
              {total} guest{total !== 1 ? "s" : ""} found
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setSelectedGuest(null);
                setIsFormDialogOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg
                         bg-[var(--card-secondary-bg)] hover:bg-[var(--card-hover-bg)]
                         text-[var(--text-primary)] border border-[var(--border-color)]/20
                         hover:border-[var(--border-color)]/40 transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              New Guest
            </button>
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg
                         bg-[var(--card-secondary-bg)] hover:bg-[var(--card-hover-bg)]
                         text-[var(--text-primary)] border border-[var(--border-color)]/20
                         hover:border-[var(--border-color)]/40 transition-all duration-200"
            >
              <Download className="w-4 h-4" />
              Export
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

        {/* Quick Stats */}
        <GuestQuickStats />

        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <GuestSearch value={searchInput} onChange={handleSearchChange} />
          {filters.search && (
            <span className="text-sm text-[var(--text-secondary)]">
              Searching: “{filters.search}”
            </span>
          )}
        </div>

        {/* Filter Panel */}
        <GuestFilterPanel
          filters={filters}
          onChange={handleFilterChange}
          onClear={handleClearFilters}
          isOpen={isFilterOpen}
          onToggle={() => setIsFilterOpen(!isFilterOpen)}
        />

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mt-4 text-red-400">
            {error}
            <button onClick={refetch} className="ml-3 underline">
              Retry
            </button>
          </div>
        )}

        {/* Table */}
        <div className="mt-6">
          <GuestTable
            guests={guests}
            activeGuestIds={activeGuestIds}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAddBooking={handleAddBooking}
          />
        </div>

        {/* Pagination */}
        {!loading && total > 0 && (
          <Pagination
            currentPage={currentPage}
            totalItems={total}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[10, 25, 50, 100]}
            showPageSize={true}
          />
        )}
      </main>

      {isViewDialogOpen && selectedGuest && (
        <GuestViewDialog
          id={selectedGuest.id!}
          isOpen={isViewDialogOpen}
          onClose={() => {
            setSelectedGuest(null);
            setIsViewDialogOpen(false);
          }}
          showBookings={true}
        />
      )}

      {isFormDialogOpen && (
        <GuestFormDialog
          id={selectedGuest ? selectedGuest.id : undefined}
          mode={selectedGuest ? "edit" : "add"}
          isOpen={isFormDialogOpen}
          onClose={() => {
            setSelectedGuest(null);
            setIsFormDialogOpen(false);
          }}
          onSuccess={() => {
            setSelectedGuest(null);
            setIsFormDialogOpen(false);
            refetch();
          }}
        />
      )}

      {isBookingFormDialogOpen && selectedGuest && (
        <BookingFormDialog
          mode="add"
          guestId={selectedGuest.id!}
          onClose={() => {
            setIsBookingFormDialogOpen(false);
            setSelectedGuest(null);
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

export default GuestPage;

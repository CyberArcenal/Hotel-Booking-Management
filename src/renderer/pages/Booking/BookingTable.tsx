import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Filter, Download, Plus } from "lucide-react";
import { useBookings } from "./hooks/useBookings";
import BookingSearch from "./components/BookingSearch";
import BookingFilterPanel from "./components/BookingFilterPanel";
import BookingTable from "./components/BookingTable";
import BookingQuickStats from "./components/BookingQuickStats";
import Pagination from "../../components/Shared/Pagination";
import bookingAPI, { type Booking } from "../../api/booking";
import BookingFormDialog from "../../components/BookingForm";
import { dialogs, showPrompt } from "../../utils/dialogs";
import { BookingViewDialog } from "./Dialogs/View";
import { showApiError, showError } from "../../utils/notification";

const BookingPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    bookings,
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
  } = useBookings();

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

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
      // Gamitin ang exportCSV method mula sa bookingAPI
      const result = await bookingAPI.exportCSV("", filters, "admin");
      if (result.status && result.data?.filePath) {
        showError(`Exported to ${result.data.filePath}`);
      } else {
        showError("Export failed");
      }
    } catch (err) {
      console.error(err);
      showError("Export failed");
    }
  };

  const handleView = (id: number) => {
    setSelectedBooking(bookings.find((b) => b.id === id) || null);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (id: number) => {
    setSelectedBooking(bookings.find((b) => b.id === id) || null);

    setIsFormDialogOpen(true);
  };

  const handleCancel = async (id: number) => {
    if (confirm("Are you sure you want to cancel this booking?")) {
      try {
        await bookingAPI.cancel(id, "Cancelled by user", "admin");
        refetch();
      } catch (err) {
        showError("Failed to cancel booking");
      }
    }
  };

  const handleInvoice = (id: number) => {};

  const handleCheckIn = async (id: number) => {
    try {
      await bookingAPI.checkIn(id, "admin");
      refetch();
    } catch (err) {
      showError("Failed to check in booking");
    }
  };

  const handleCheckOut = async (id: number) => {
    try {
      await bookingAPI.checkOut(id, "admin");
      refetch();
      await dialogs.success("Booking checked out successfully");
      
    } catch (err) {
      showError("Failed to check out booking");
    }
  };

  const handleMarkAsPaid = async (id: number) => {
    try {
      await bookingAPI.markAsPaid(id);
      refetch();
      await dialogs.success("Booking marked as paid");
      
    } catch (err) {
      // console.log(err)
      showApiError(err);
    }
  };

  const handleMarkAsFailed = async (id: number) => {
    try {
      const reason = await showPrompt(
        {
          title: "Mark Booking as Failed",
          message: "Enter reason for marking booking as failed:",
        }
      );
      if (!reason) return; // user cancelled or entered empty string
      await bookingAPI.markAsFailed(id, reason);
      refetch();
      await dialogs.success("Booking marked as failed");
    
    } catch (err) {
      showApiError(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this booking?")) {
      try {
        await bookingAPI.delete(id, "admin");
        refetch();
        await dialogs.success("Booking deleted successfully");
       
      } catch (err) {
        showError("Failed to delete booking");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background-color)]">
      <main className="container mx-auto px-4 py-6 md:px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">
              Bookings
            </h2>
            <p className="text-[var(--text-secondary)] mt-1">
              {total} booking{total !== 1 ? "s" : ""} found
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
              Create Booking
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
        <BookingQuickStats />

        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <BookingSearch value={searchInput} onChange={handleSearchChange} />
          {filters.search && (
            <span className="text-sm text-[var(--text-secondary)]">
              Searching: “{filters.search}”
            </span>
          )}
        </div>

        {/* Filter Panel */}
        <BookingFilterPanel
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
          <BookingTable
            bookings={bookings}
            onView={handleView}
            onEdit={handleEdit}
            onCancel={handleCancel}
            onInvoice={handleInvoice}
            onCheckIn={handleCheckIn}
            onCheckOut={handleCheckOut}
            onMarkAsPaid={handleMarkAsPaid}
            onMarkAsFailed={handleMarkAsFailed}
            onDelete={handleDelete}
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

      {isFormDialogOpen && (
        <BookingFormDialog
          id={selectedBooking ? selectedBooking.id : undefined}
          onClose={async () => {
            setIsFormDialogOpen(false);
            setSelectedBooking(null);
          }}
          mode={selectedBooking ? "edit" : "add"}
          onSuccess={async (booking: Booking) => {
            setIsFormDialogOpen(false);
            setSelectedBooking(null);
            refetch();
          }}
        />
      )}

      {isViewDialogOpen && selectedBooking && (
        <BookingViewDialog
          id={selectedBooking.id!}
          isOpen={isViewDialogOpen}
          onClose={() => {
            setIsViewDialogOpen(false);
            setSelectedBooking(null);
          }}
        />
      )}
    </div>
  );
};

export default BookingPage;

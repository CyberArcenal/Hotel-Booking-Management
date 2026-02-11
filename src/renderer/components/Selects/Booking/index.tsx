// src/renderer/components/BookingSelect.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search,
  ChevronDown,
  Loader,
  Calendar,
  DoorOpen,
  User,
  Tag,
  X,
} from 'lucide-react';
import bookingAPI from '../../../api/booking';
import type { Booking } from '../../../api/booking';

interface BookingSelectProps {
  /** Currently selected booking ID (or null) */
  value: number | null;
  /** Callback when selection changes */
  onChange: (bookingId: number | null, booking?: Booking) => void;
  /** Disable the entire control */
  disabled?: boolean;
  /** Placeholder text when no booking is selected */
  placeholder?: string;
  /** Filter by booking status(es) */
  statusFilter?: Booking['status'] | Booking['status'][];
  /** Auto‑focus search when dropdown opens */
  autoFocus?: boolean;
}

const BookingSelect: React.FC<BookingSelectProps> = ({
  value,
  onChange,
  disabled = false,
  placeholder = 'Select a booking',
  statusFilter,
  autoFocus = true,
}) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<number | undefined>(undefined);

  // ------------------------------------------------------------------
  // Load bookings (with pagination & filters)
  // ------------------------------------------------------------------
  const loadBookings = useCallback(
    async (reset = true, search?: string) => {
      if (loading) return;
      try {
        setLoading(true);
        const currentPage = reset ? 1 : page;

        const params: any = {
          page: currentPage,
          limit: 15,
          sortBy: 'checkInDate',
          sortOrder: 'DESC',
          search,
        };
        if (statusFilter) {
          params.status = Array.isArray(statusFilter) ? statusFilter : [statusFilter];
        }

        const response = await bookingAPI.getAll(params);
        if (response.status && response.data) {
          // response.data can be PaginatedBookings or Booking[]
          let newBookings: Booking[] = [];
          let totalPages = 1;
          let totalItems = 0;

          if (Array.isArray(response.data)) {
            newBookings = response.data;
            totalPages = 1;
            totalItems = newBookings.length;
          } else {
            newBookings = response.data.items || [];
            totalPages = response.data.totalPages || 1;
            totalItems = response.data.total || 0;
          }

          setBookings((prev) => (reset ? newBookings : [...prev, ...newBookings]));
          setFilteredBookings((prev) => (reset ? newBookings : [...prev, ...newBookings]));
          setPage(currentPage + 1);
          setHasMore(currentPage < totalPages);
          setTotal(totalItems);
        }
      } catch (error) {
        console.error('Failed to load bookings:', error);
      } finally {
        setLoading(false);
      }
    },
    [page, loading, statusFilter]
  );

  // ------------------------------------------------------------------
  // Debounced search
  // ------------------------------------------------------------------
  useEffect(() => {
    if (isOpen) {
      debounceTimer.current = setTimeout(() => {
        loadBookings(true, searchTerm || undefined);
      }, 400);
    }
    return () => clearTimeout(debounceTimer.current);
  }, [searchTerm, isOpen, loadBookings]);

  // ------------------------------------------------------------------
  // Load initial bookings when dropdown opens
  // ------------------------------------------------------------------
  useEffect(() => {
    if (isOpen && bookings.length === 0 && !loading) {
      loadBookings(true);
    }
  }, [isOpen, bookings.length, loading, loadBookings]);

  // ------------------------------------------------------------------
  // Close dropdown on outside click
  // ------------------------------------------------------------------
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ------------------------------------------------------------------
  // Auto‑focus
  // ------------------------------------------------------------------
  useEffect(() => {
    if (isOpen && autoFocus && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isOpen, autoFocus]);

  // ------------------------------------------------------------------
  // Handlers
  // ------------------------------------------------------------------
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    loadBookings(true);
  };

  const handleSelect = (booking: Booking) => {
    onChange(booking.id, booking);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = () => {
    onChange(null);
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      loadBookings(false, searchTerm || undefined);
    }
  };

  // ------------------------------------------------------------------
  // Status badge colour
  // ------------------------------------------------------------------
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'var(--status-confirmed)';
      case 'checked_in':
        return 'var(--status-available)'; // use green
      case 'checked_out':
        return 'var(--status-completed)';
      case 'cancelled':
        return 'var(--status-cancelled)';
      default:
        return 'var(--text-secondary)';
    }
  };

  // ------------------------------------------------------------------
  // Selected booking display
  // ------------------------------------------------------------------
  const selectedBooking = bookings.find((b) => b.id === value);

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------
  return (
    <div className="relative" ref={dropdownRef}>
      {/* ---------- Trigger button ---------- */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full p-3 rounded-lg text-left flex justify-between items-center text-sm
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        style={{
          backgroundColor: 'var(--card-bg)',
          border: '1px solid var(--border-color)',
          color: 'var(--text-primary)',
          minHeight: '44px',
        }}
      >
        <div className="flex items-center gap-2 truncate">
          {selectedBooking ? (
            <>
              <Tag className="w-4 h-4" style={{ color: 'var(--primary-color)' }} />
              <div className="truncate">
                <div className="font-medium flex items-center gap-2">
                  Booking #{selectedBooking.id}
                  <span
                    className="px-1.5 py-0.5 text-xs rounded"
                    style={{
                      backgroundColor: `${getStatusColor(selectedBooking.status)}20`,
                      color: getStatusColor(selectedBooking.status),
                    }}
                  >
                    {selectedBooking.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {selectedBooking.guest?.fullName} • Room{' '}
                  {selectedBooking.room?.roomNumber} •{' '}
                  {new Date(selectedBooking.checkInDate).toLocaleDateString()} –{' '}
                  {new Date(selectedBooking.checkOutDate).toLocaleDateString()}
                </div>
              </div>
            </>
          ) : (
            <span style={{ color: 'var(--text-secondary)' }}>{placeholder}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {selectedBooking && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="p-1 rounded hover:bg-gray-700 transition-colors"
              style={{ color: 'var(--primary-hover)' }}
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <ChevronDown
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            style={{ color: 'var(--text-secondary)' }}
          />
        </div>
      </button>

      {/* ---------- Dropdown panel ---------- */}
      {isOpen && (
        <div
          className="absolute z-50 w-full mt-1 rounded-lg shadow-lg"
          style={{
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            maxHeight: '420px',
            overflow: 'hidden',
          }}
        >
          {/* ----- Search header ----- */}
          <div
            className="p-3 border-b"
            style={{ borderColor: 'var(--border-color)' }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Search
                  className="w-4 h-4"
                  style={{ color: 'var(--text-secondary)' }}
                />
                <span
                  className="text-sm font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Find booking
                </span>
              </div>
              {searchTerm && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="text-xs px-2 py-1 rounded hover:bg-gray-700 transition-colors"
                  style={{ color: 'var(--primary-color)' }}
                >
                  Clear
                </button>
              )}
            </div>
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search by guest name, room #, or booking ID..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-9 pr-8 py-2 rounded-lg text-sm"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                }}
              />
              {loading && (
                <Loader
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin"
                  style={{ color: 'var(--primary-color)' }}
                />
              )}
            </div>
            {total > 0 && (
              <div
                className="text-xs mt-2"
                style={{ color: 'var(--text-secondary)' }}
              >
                {total} booking{total !== 1 ? 's' : ''} total
              </div>
            )}
          </div>

          {/* ----- Booking list ----- */}
          <div
            className="overflow-y-auto"
            style={{ maxHeight: '250px' }}
            onScroll={(e) => {
              const target = e.target as HTMLDivElement;
              const bottom =
                target.scrollHeight - target.scrollTop === target.clientHeight;
              if (bottom && hasMore && !loading) {
                handleLoadMore();
              }
            }}
          >
            {filteredBookings.length === 0 ? (
              <div className="p-4 text-center">
                {loading ? (
                  <Loader
                    className="w-5 h-5 animate-spin mx-auto"
                    style={{ color: 'var(--primary-color)' }}
                  />
                ) : (
                  <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    No bookings found
                  </div>
                )}
              </div>
            ) : (
              <>
                {filteredBookings.map((booking) => (
                  <button
                    key={booking.id}
                    type="button"
                    onClick={() => handleSelect(booking)}
                    className={`
                      w-full p-3 text-left transition-colors flex items-start gap-3
                      hover:bg-gray-800
                      ${booking.id === value ? 'bg-gray-800' : ''}
                    `}
                    style={{
                      borderBottom: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {/* Selection indicator */}
                    <div
                      className={`
                        w-4 h-4 rounded-full border flex-shrink-0 mt-1 flex items-center justify-center
                        ${booking.id === value ? 'border-primary' : 'border-gray-600'}
                      `}
                    >
                      {booking.id === value && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>

                    <Tag
                      className="w-4 h-4 flex-shrink-0 mt-1"
                      style={{ color: 'var(--primary-color)' }}
                    />

                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm flex items-center gap-2">
                        #{booking.id}
                        <span
                          className="px-1.5 py-0.5 text-xs rounded"
                          style={{
                            backgroundColor: `${getStatusColor(booking.status)}20`,
                            color: getStatusColor(booking.status),
                          }}
                        >
                          {booking.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div
                        className="text-xs flex flex-col gap-0.5 mt-0.5"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">
                            {booking.guest?.fullName || 'Unknown guest'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DoorOpen className="w-3 h-3 flex-shrink-0" />
                          <span>Room {booking.room?.roomNumber || 'N/A'}</span>
                          <span>· {booking.room?.type}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 flex-shrink-0" />
                          <span>
                            {new Date(booking.checkInDate).toLocaleDateString()} –{' '}
                            {new Date(booking.checkOutDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span>
                            {booking.numberOfGuests} guest
                            {booking.numberOfGuests !== 1 ? 's' : ''} · ₱
                            {booking.totalPrice?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}

                {/* Load more */}
                {hasMore && (
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    className="w-full p-2 text-center text-sm transition-colors hover:bg-gray-800"
                    style={{ color: 'var(--primary-color)' }}
                  >
                    {loading ? (
                      <Loader className="w-4 h-4 animate-spin mx-auto" />
                    ) : (
                      'Load more...'
                    )}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingSelect;
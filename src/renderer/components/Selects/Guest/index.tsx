// src/renderer/components/GuestSelect.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search,
  ChevronDown,
  Loader,
  User,
  Mail,
  Phone,
  X,
  Plus,
  Calendar,
} from 'lucide-react';
import guestAPI from '../../../api/guest';
import type { Guest, GuestWithStats } from '../../../api/guest';

interface GuestSelectProps {
  /** Currently selected guest ID (or null) */
  value: number | null;
  /** Callback when selection changes */
  onChange: (guestId: number | null, guest?: Guest) => void;
  /** Disable the entire control */
  disabled?: boolean;
  /** Placeholder text when no guest is selected */
  placeholder?: string;
  /** Show "Create new guest" button */
  allowCreate?: boolean;
  /** Called when the "Create new guest" button is clicked */
  onCreateNew?: () => void;
  /** Auto‑focus the search input when dropdown opens */
  autoFocus?: boolean;
}

const GuestSelect: React.FC<GuestSelectProps> = ({
  value,
  onChange,
  disabled = false,
  placeholder = 'Select a guest',
  allowCreate = true,
  onCreateNew,
  autoFocus = true,
}) => {
  const [guests, setGuests] = useState<GuestWithStats[]>([]);
  const [filteredGuests, setFilteredGuests] = useState<GuestWithStats[]>([]);
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
  // Load initial guests (first page, no search)
  // ------------------------------------------------------------------
  const loadGuests = useCallback(
    async (reset = true) => {
      if (loading) return;
      try {
        setLoading(true);
        const currentPage = reset ? 1 : page;
        const response = await guestAPI.search({
          page: currentPage,
          limit: 20,
          sortBy: 'createdAt',
          sortOrder: 'DESC',
        });

        if (response.status && response.data) {
          const newGuests = response.data.guests || [];
          const totalPages = response.data.totalPages || 1;

          setGuests((prev) => (reset ? newGuests : [...prev, ...newGuests]));
          setFilteredGuests((prev) => (reset ? newGuests : [...prev, ...newGuests]));
          setPage(currentPage + 1);
          setHasMore(currentPage < totalPages);
          setTotal(response.data.total || 0);
        }
      } catch (error) {
        console.error('Failed to load guests:', error);
      } finally {
        setLoading(false);
      }
    },
    [page, loading]
  );

  // ------------------------------------------------------------------
  // Search guests with debounce
  // ------------------------------------------------------------------
  const searchGuests = useCallback(
    async (term: string) => {
      if (!term.trim()) {
        // If search is cleared, reload first page
        loadGuests(true);
        return;
      }

      try {
        setLoading(true);
        const response = await guestAPI.search({
          search: term,
          page: 1,
          limit: 20,
        });

        if (response.status && response.data) {
          setGuests(response.data.guests || []);
          setFilteredGuests(response.data.guests || []);
          setPage(2);
          setHasMore(response.data.totalPages > 1);
          setTotal(response.data.total || 0);
        }
      } catch (error) {
        console.error('Failed to search guests:', error);
      } finally {
        setLoading(false);
      }
    },
    [loadGuests]
  );

  // ------------------------------------------------------------------
  // Debounce search input
  // ------------------------------------------------------------------
  useEffect(() => {
    if (isOpen) {
      debounceTimer.current = setTimeout(() => {
        searchGuests(searchTerm);
      }, 400);
    }
    return () => clearTimeout(debounceTimer.current);
  }, [searchTerm, isOpen, searchGuests]);

  // ------------------------------------------------------------------
  // Load initial guests when dropdown opens
  // ------------------------------------------------------------------
  useEffect(() => {
    if (isOpen && guests.length === 0 && !loading) {
      loadGuests(true);
    }
  }, [isOpen, guests.length, loading, loadGuests]);

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
  // Auto‑focus search when dropdown opens
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
    loadGuests(true);
  };

  const handleSelect = (guest: GuestWithStats) => {
    onChange(guest.id, guest);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = () => {
    onChange(null);
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      loadGuests(false);
    }
  };

  const handleCreateNew = () => {
    onCreateNew?.();
    setIsOpen(false);
  };

  // ------------------------------------------------------------------
  // Selected guest display
  // ------------------------------------------------------------------
  const selectedGuest = guests.find((g) => g.id === value);

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
          {selectedGuest ? (
            <>
              <User className="w-4 h-4" style={{ color: 'var(--primary-color)' }} />
              <div className="truncate">
                <div className="font-medium">{selectedGuest.fullName}</div>
                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {selectedGuest.email} • {selectedGuest.phone}
                  {selectedGuest.totalBookings !== undefined && (
                    <span className="ml-2">
                      {selectedGuest.totalBookings} booking
                      {selectedGuest.totalBookings !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
            </>
          ) : (
            <span style={{ color: 'var(--text-secondary)' }}>{placeholder}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {selectedGuest && (
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
                  Find guest
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
                placeholder="Search by name, email, or phone..."
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
                {total} guest{total !== 1 ? 's' : ''} total
              </div>
            )}
          </div>

          {/* ----- Guest list ----- */}
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
            {filteredGuests.length === 0 ? (
              <div className="p-4 text-center">
                {loading ? (
                  <Loader
                    className="w-5 h-5 animate-spin mx-auto"
                    style={{ color: 'var(--primary-color)' }}
                  />
                ) : (
                  <>
                    <div
                      className="text-sm mb-2"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      No guests found
                    </div>
                    {allowCreate && (
                      <button
                        type="button"
                        onClick={handleCreateNew}
                        className="text-sm px-3 py-1 rounded hover:bg-gray-700 transition-colors inline-flex items-center gap-1"
                        style={{ color: 'var(--primary-color)' }}
                      >
                        <Plus className="w-3 h-3" /> Create new guest
                      </button>
                    )}
                  </>
                )}
              </div>
            ) : (
              <>
                {filteredGuests.map((guest) => (
                  <button
                    key={guest.id}
                    type="button"
                    onClick={() => handleSelect(guest)}
                    className={`
                      w-full p-3 text-left transition-colors flex items-start gap-3
                      hover:bg-gray-800
                      ${guest.id === value ? 'bg-gray-800' : ''}
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
                        ${guest.id === value ? 'border-primary' : 'border-gray-600'}
                      `}
                    >
                      {guest.id === value && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>

                    <User
                      className="w-4 h-4 flex-shrink-0 mt-1"
                      style={{ color: 'var(--primary-color)' }}
                    />

                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {guest.fullName}
                      </div>
                      <div
                        className="text-xs flex flex-col gap-0.5 mt-0.5"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{guest.email}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3 flex-shrink-0" />
                          <span>{guest.phone}</span>
                        </div>
                        {guest.totalBookings !== undefined && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3 flex-shrink-0" />
                            <span>
                              {guest.totalBookings} booking
                              {guest.totalBookings !== 1 ? 's' : ''}
                              {guest.totalSpent &&
                                ` · ₱${guest.totalSpent.toLocaleString()}`}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}

                {/* Load more indicator */}
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

          {/* ----- Create new footer ----- */}
          {allowCreate && filteredGuests.length > 0 && (
            <div
              className="p-2 border-t text-center"
              style={{ borderColor: 'var(--border-color)' }}
            >
              <button
                type="button"
                onClick={handleCreateNew}
                className="w-full py-2 px-3 rounded-md text-sm transition-colors flex items-center justify-center gap-1 hover:bg-gray-800"
                style={{ color: 'var(--primary-color)' }}
              >
                <Plus className="w-4 h-4" /> Create new guest
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GuestSelect;
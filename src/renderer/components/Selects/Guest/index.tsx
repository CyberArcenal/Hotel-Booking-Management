// src/renderer/components/GuestSelect.tsx
import React, { useState, useEffect, useRef, useCallback } from "react";
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
} from "lucide-react";
import guestAPI from "../../../api/guest";
import type { Guest, GuestWithStats } from "../../../api/guest";

interface GuestSelectProps {
  value: number | null;
  onChange: (guestId: number | null, guest?: Guest) => void;
  disabled?: boolean;
  placeholder?: string;
  allowCreate?: boolean;
  onCreateNew?: () => void;
  autoFocus?: boolean;
}

const GuestSelect: React.FC<GuestSelectProps> = ({
  value,
  onChange,
  disabled = false,
  placeholder = "Select a guest",
  allowCreate = true,
  onCreateNew,
  autoFocus = true,
}) => {
  const [guests, setGuests] = useState<GuestWithStats[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false); // initial load or search
  const [loadingMore, setLoadingMore] = useState(false); // pagination load
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [selectedGuest, setSelectedGuest] = useState<GuestWithStats | null>(
    null,
  );

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<number | undefined>(undefined);
  const scrollRAF = useRef<number | undefined>(undefined);
  const isMounted = useRef(true);

  // --------------------------------------------------------------------
  // Cleanup on unmount
  // --------------------------------------------------------------------
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      clearTimeout(debounceTimer.current);
      cancelAnimationFrame(scrollRAF.current!);
    };
  }, []);

  // --------------------------------------------------------------------
  // Fetch selected guest (edit mode)
  // --------------------------------------------------------------------
  useEffect(() => {
    if (!value) {
      setSelectedGuest(null);
      return;
    }

    // If already in the list, use it
    const existing = guests.find((g) => g.id === value);
    if (existing) {
      setSelectedGuest(existing);
      return;
    }

    // Otherwise fetch it
    let cancelled = false;
    const fetchSelected = async () => {
      try {
        const response = await guestAPI.getById(value, false);
        if (!isMounted.current || cancelled) return;
        if (response.status && response.data) {
          // Convert to GuestWithStats if needed (API returns Guest)
          const guest = response.data as GuestWithStats;
          setSelectedGuest(guest);
          // Also insert into the list so it appears in dropdown
          setGuests((prev) => {
            if (prev.some((g) => g.id === guest.id)) return prev;
            return [guest, ...prev];
          });
        }
      } catch (error) {
        console.error("Failed to fetch selected guest:", error);
      }
    };
    fetchSelected();

    return () => {
      cancelled = true;
    };
  }, [value, guests]);

  // --------------------------------------------------------------------
  // Load guests (first page or next page)
  // --------------------------------------------------------------------
  const loadGuests = useCallback(async (reset = true) => {
    if (reset && loading) return;
    if (!reset && (loadingMore || !hasMore)) return;

    try {
      if (reset) {
        setLoading(true);
        setPage(1);
      } else {
        setLoadingMore(true);
      }

      const currentPage = reset ? 1 : page;
      const response = await guestAPI.search({ page: currentPage, limit: 20 });

      if (!isMounted.current) return;

      if (response.status && response.data) {
        const newGuests = response.data.guests || [];
        const totalPages = response.data.totalPages || 1;

        setGuests((prev) => {
          if (reset) return newGuests;
          const existingIds = new Set(prev.map((g) => g.id));
          const uniqueNew = newGuests.filter((g) => !existingIds.has(g.id));
          return [...prev, ...uniqueNew];
        });

        setPage((prev) => prev + 1);
        setHasMore(currentPage < totalPages);
        setTotal(response.data.total || 0);
      }
    } catch (error) {
      console.error(error);
    } finally {
      if (isMounted.current) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }, []); // no dependencies

  // --------------------------------------------------------------------
  // Search guests (debounced)
  // --------------------------------------------------------------------
  const searchGuests = useCallback(
    async (term: string) => {
      if (!term.trim()) {
        await loadGuests(true);
        return;
      }

      try {
        setLoading(true);
        const response = await guestAPI.search({
          search: term,
          page: 1,
          limit: 20,
        });

        if (!isMounted.current) return;

        if (response.status && response.data) {
          setGuests(response.data.guests || []);
          setPage(2);
          setHasMore(response.data.totalPages > 1);
          setTotal(response.data.total || 0);
        }
      } catch (error) {
        console.error("Failed to search guests:", error);
      } finally {
        if (isMounted.current) setLoading(false);
      }
    },
    [loadGuests],
  );

  // --------------------------------------------------------------------
  // Debounce search input
  // --------------------------------------------------------------------
  useEffect(() => {
    if (isOpen) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        searchGuests(searchTerm);
      }, 400);
    }
    return () => clearTimeout(debounceTimer.current);
  }, [searchTerm, isOpen, searchGuests]);

  // --------------------------------------------------------------------
  // Load initial guests ONLY when dropdown opens and page === 1
  // --------------------------------------------------------------------
  useEffect(() => {
    if (isOpen && guests.length === 0 && !loading && page === 1) {
      loadGuests(true);
    }
  }, [isOpen, guests.length, loading, page, loadGuests]);

  // --------------------------------------------------------------------
  // Close dropdown on outside click
  // --------------------------------------------------------------------
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --------------------------------------------------------------------
  // Auto‑focus search when dropdown opens
  // --------------------------------------------------------------------
  useEffect(() => {
    if (isOpen && autoFocus && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isOpen, autoFocus]);

  // --------------------------------------------------------------------
  // Throttled scroll handler (requestAnimationFrame)
  // --------------------------------------------------------------------
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      if (scrollRAF.current) cancelAnimationFrame(scrollRAF.current);
      scrollRAF.current = requestAnimationFrame(() => {
        const target = e.target as HTMLDivElement;
        const bottom =
          target.scrollHeight - target.scrollTop - target.clientHeight < 10; // threshold
        if (bottom && hasMore && !loadingMore && !loading) {
          loadGuests(false);
        }
      });
    },
    [hasMore, loadingMore, loading, loadGuests],
  );

  // --------------------------------------------------------------------
  // Handlers
  // --------------------------------------------------------------------
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    loadGuests(true);
  };

  const handleSelect = (guest: GuestWithStats) => {
    onChange(guest.id, guest);
    setSelectedGuest(guest);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClear = () => {
    onChange(null);
    setSelectedGuest(null);
  };

  const handleLoadMore = () => {
    if (hasMore && !loadingMore && !loading) {
      loadGuests(false);
    }
  };

  const handleCreateNew = () => {
    onCreateNew?.();
    setIsOpen(false);
  };

  // --------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------
  return (
    <div className="relative" ref={dropdownRef}>
      {/* ---------- Trigger button ---------- */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full p-3 rounded-lg text-left flex justify-between items-center text-sm
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
        style={{
          backgroundColor: "var(--card-bg)",
          border: "1px solid var(--border-color)",
          color: "var(--text-primary)",
          minHeight: "44px",
        }}
      >
        <div className="flex items-center gap-2 truncate">
          {selectedGuest ? (
            <>
              <User
                className="w-4 h-4"
                style={{ color: "var(--primary-color)" }}
              />
              <div className="truncate">
                <div className="font-medium">{selectedGuest.fullName}</div>
                <div
                  className="text-xs"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {selectedGuest.email} • {selectedGuest.phone}
                  {selectedGuest.totalBookings !== undefined && (
                    <span className="ml-2">
                      {selectedGuest.totalBookings} booking
                      {selectedGuest.totalBookings !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </div>
            </>
          ) : (
            <span style={{ color: "var(--text-secondary)" }}>
              {placeholder}
            </span>
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
              style={{ color: "var(--primary-hover)" }}
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <ChevronDown
            className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
            style={{ color: "var(--text-secondary)" }}
          />
        </div>
      </button>

      {/* ---------- Dropdown panel ---------- */}
      {isOpen && (
        <div
          className="absolute z-50 w-full mt-1 rounded-lg shadow-lg"
          style={{
            backgroundColor: "var(--card-bg)",
            border: "1px solid var(--border-color)",
            maxHeight: "420px",
            overflow: "hidden",
          }}
        >
          {/* ----- Search header ----- */}
          <div
            className="p-3 border-b"
            style={{ borderColor: "var(--border-color)" }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Search
                  className="w-4 h-4"
                  style={{ color: "var(--text-secondary)" }}
                />
                <span
                  className="text-sm font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  Find guest
                </span>
              </div>
              {searchTerm && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="text-xs px-2 py-1 rounded hover:bg-gray-700 transition-colors"
                  style={{ color: "var(--primary-color)" }}
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
                  backgroundColor: "var(--card-bg)",
                  border: "1px solid var(--border-color)",
                  color: "var(--text-primary)",
                }}
              />
              {(loading || loadingMore) && (
                <Loader
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin"
                  style={{ color: "var(--primary-color)" }}
                />
              )}
            </div>
            {total > 0 && (
              <div
                className="text-xs mt-2"
                style={{ color: "var(--text-secondary)" }}
              >
                {total} guest{total !== 1 ? "s" : ""} total
              </div>
            )}
          </div>

          {/* ----- Guest list ----- */}
          <div
            className="overflow-y-auto"
            style={{ maxHeight: "250px" }}
            onScroll={handleScroll}
          >
            {guests.length === 0 && !loading ? (
              <div className="p-4 text-center">
                <div
                  className="text-sm mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  No guests found
                </div>
                {allowCreate && (
                  <button
                    type="button"
                    onClick={handleCreateNew}
                    className="text-sm px-3 py-1 rounded hover:bg-gray-700 transition-colors inline-flex items-center gap-1"
                    style={{ color: "var(--primary-color)" }}
                  >
                    <Plus className="w-3 h-3" /> Create new guest
                  </button>
                )}
              </div>
            ) : (
              <>
                {guests.map((guest) => (
                  <button
                    key={guest.id}
                    type="button"
                    onClick={() => handleSelect(guest)}
                    className={`
                      w-full p-3 text-left transition-colors flex items-start gap-3
                      hover:bg-gray-800
                      ${guest.id === selectedGuest?.id ? "bg-gray-800" : ""}
                    `}
                    style={{
                      borderBottom: "1px solid var(--border-color)",
                      color: "var(--text-primary)",
                    }}
                  >
                    {/* Selection indicator */}
                    <div
                      className={`
                        w-4 h-4 rounded-full border flex-shrink-0 mt-1 flex items-center justify-center
                        ${
                          guest.id === selectedGuest?.id
                            ? "border-primary"
                            : "border-gray-600"
                        }
                      `}
                    >
                      {guest.id === selectedGuest?.id && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>

                    <User
                      className="w-4 h-4 flex-shrink-0 mt-1"
                      style={{ color: "var(--primary-color)" }}
                    />

                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {guest.fullName}
                      </div>
                      <div
                        className="text-xs flex flex-col gap-0.5 mt-0.5"
                        style={{ color: "var(--text-secondary)" }}
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
                              {guest.totalBookings !== 1 ? "s" : ""}
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
                    style={{ color: "var(--primary-color)" }}
                  >
                    {loadingMore ? (
                      <Loader className="w-4 h-4 animate-spin mx-auto" />
                    ) : (
                      "Load more..."
                    )}
                  </button>
                )}
              </>
            )}
          </div>

          {/* ----- Create new footer ----- */}
          {allowCreate && guests.length > 0 && (
            <div
              className="p-2 border-t text-center"
              style={{ borderColor: "var(--border-color)" }}
            >
              <button
                type="button"
                onClick={handleCreateNew}
                className="w-full py-2 px-3 rounded-md text-sm transition-colors flex items-center justify-center gap-1 hover:bg-gray-800"
                style={{ color: "var(--primary-color)" }}
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

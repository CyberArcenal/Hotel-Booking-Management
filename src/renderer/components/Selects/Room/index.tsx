// src/renderer/components/RoomSelect.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  ChevronDown,
  Loader,
  Filter,
  DollarSign,
  Users,
  X,
  DoorOpen
} from 'lucide-react';
import roomAPI from '../../../api/room';           // adjust path if needed
import type { Room } from '../../../api/room';

interface RoomSelectProps {
  /** Currently selected room ID (or null) */
  value: number | null;
  /** Callback when selection changes */
  onChange: (roomId: number | null) => void;
  /** Disable the entire control */
  disabled?: boolean;
  /** Placeholder text when no room is selected */
  placeholder?: string;
  /** Show room type filter dropdown */
  includeTypeFilter?: boolean;
  /** Show "available only" checkbox */
  includeAvailabilityFilter?: boolean;
}

const RoomSelect: React.FC<RoomSelectProps> = ({
  value,
  onChange,
  disabled = false,
  placeholder = 'Select a room',
  includeTypeFilter = true,
  includeAvailabilityFilter = true,
}) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [roomTypes, setRoomTypes] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<string>('');
  const [availableOnly, setAvailableOnly] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // ------------------------------------------------------------------
  // 1. Fetch all rooms
  // ------------------------------------------------------------------
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const response = await roomAPI.getAll();
        if (response.status && response.data) {
          const list = Array.isArray(response.data) ? response.data : [];
          setRooms(list);
          setFilteredRooms(list);

          // Extract unique room types
          const types = Array.from(
            new Set(list.map((r) => r.type).filter(Boolean))
          ) as string[];
          setRoomTypes(types);
        }
      } catch (err) {
        console.error('Failed to fetch rooms:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  // ------------------------------------------------------------------
  // 2. Apply filters (type, availability, search)
  // ------------------------------------------------------------------
  useEffect(() => {
    let filtered = rooms;

    if (selectedType) {
      filtered = filtered.filter((room) => room.type === selectedType);
    }

    if (availableOnly) {
      filtered = filtered.filter((room) => room.isAvailable === true);
    }

    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (room) =>
          room.roomNumber.toLowerCase().includes(term) ||
          room.type?.toLowerCase().includes(term) ||
          (room.amenities && room.amenities.toLowerCase().includes(term))
      );
    }

    setFilteredRooms(filtered);
  }, [rooms, selectedType, availableOnly, searchTerm]);

  // ------------------------------------------------------------------
  // 3. Close dropdown on outside click
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
  // 4. Event handlers
  // ------------------------------------------------------------------
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleTypeFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedType(e.target.value);
  };

  const handleAvailabilityToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAvailableOnly(e.target.checked);
  };

  const handleClearFilters = () => {
    setSelectedType('');
    setAvailableOnly(false);
    setSearchTerm('');
  };

  const handleSelect = (roomId: number) => {
    onChange(roomId);
    setIsOpen(false);
    // Reset filters after selection (optional)
    setSearchTerm('');
    setSelectedType('');
    setAvailableOnly(false);
  };

  const handleClear = () => {
    onChange(null);
  };

  // ------------------------------------------------------------------
  // 5. Helper: get selected room object
  // ------------------------------------------------------------------
  const selectedRoom = rooms.find((r) => r.id === value);

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------
  return (
    <div className="relative" ref={dropdownRef}>
      {/* ---------- Main trigger button ---------- */}
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
          {selectedRoom ? (
            <>
              <DoorOpen className="w-4 h-4" style={{ color: 'var(--primary-color)' }} />
              <div className="truncate">
                <div className="font-medium">Room {selectedRoom.roomNumber}</div>
                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {selectedRoom.type} • {selectedRoom.capacity} guests • ${selectedRoom.pricePerNight}/night
                  {!selectedRoom.isAvailable && (
                    <span
                      className="ml-2 px-1.5 py-0.5 text-xs rounded"
                      style={{
                        backgroundColor: 'rgba(255,76,76,0.2)',
                        color: 'var(--status-occupied)',
                      }}
                    >
                      Not Available
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
          {selectedRoom && (
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
            maxHeight: '400px',
            overflow: 'hidden',
          }}
        >
          {/* ----- Filter header ----- */}
          <div className="p-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  Filter Rooms
                </span>
              </div>
              {(selectedType || availableOnly || searchTerm) && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="text-xs px-2 py-1 rounded hover:bg-gray-700 transition-colors"
                  style={{ color: 'var(--primary-color)' }}
                >
                  Clear filters
                </button>
              )}
            </div>

            {/* Room type dropdown */}
            {includeTypeFilter && (
              <div className="mb-2">
                <select
                  value={selectedType}
                  onChange={handleTypeFilterChange}
                  className="w-full p-2 rounded-lg text-sm"
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <option value="">All room types</option>
                  {roomTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Available only checkbox */}
            {includeAvailabilityFilter && (
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  id="availableOnly"
                  checked={availableOnly}
                  onChange={handleAvailabilityToggle}
                  className="rounded"
                  style={{ accentColor: 'var(--primary-color)' }}
                />
                <label
                  htmlFor="availableOnly"
                  className="text-sm"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Show available only
                </label>
              </div>
            )}

            {/* Search input */}
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
                style={{ color: 'var(--text-secondary)' }}
              />
              <input
                type="text"
                placeholder="Search by room #, type, amenities..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-9 pr-3 py-2 rounded-lg text-sm"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                }}
                autoFocus
              />
            </div>
          </div>

          {/* ----- Result summary (only when filters active) ----- */}
          {(selectedType || availableOnly || searchTerm) && filteredRooms.length > 0 && (
            <div
              className="px-3 py-2 text-xs border-b"
              style={{
                borderColor: 'var(--border-color)',
                backgroundColor: 'var(--card-bg)',
              }}
            >
              <span style={{ color: 'var(--text-secondary)' }}>
                Showing {filteredRooms.length} room{filteredRooms.length !== 1 ? 's' : ''}
                {selectedType && ` of type "${selectedType}"`}
                {availableOnly && ' (available)'}
                {searchTerm && ` matching "${searchTerm}"`}
              </span>
            </div>
          )}

          {/* ----- Loading state ----- */}
          {loading && (
            <div className="p-4 text-center">
              <Loader
                className="w-5 h-5 animate-spin mx-auto"
                style={{ color: 'var(--primary-color)' }}
              />
              <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
                Loading rooms...
              </p>
            </div>
          )}

          {/* ----- Room list ----- */}
          {!loading && (
            <div className="max-h-60 overflow-y-auto">
              {filteredRooms.length === 0 ? (
                <div className="p-4 text-center">
                  <div className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                    {searchTerm || selectedType || availableOnly
                      ? 'No rooms found matching your criteria'
                      : 'No rooms available'}
                  </div>
                  {(searchTerm || selectedType || availableOnly) && (
                    <button
                      type="button"
                      onClick={handleClearFilters}
                      className="text-sm px-3 py-1 rounded hover:bg-gray-700 transition-colors"
                      style={{ color: 'var(--primary-color)' }}
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              ) : (
                filteredRooms.map((room) => (
                  <button
                    key={room.id}
                    type="button"
                    onClick={() => handleSelect(room.id)}
                    className={`
                      w-full p-3 text-left transition-colors flex items-center gap-3
                      hover:bg-gray-800
                      ${room.id === value ? 'bg-gray-800' : ''}
                    `}
                    style={{
                      borderBottom: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {/* Selection indicator */}
                    <div
                      className={`
                        w-4 h-4 rounded-full border flex items-center justify-center
                        ${room.id === value ? 'border-primary' : 'border-gray-600'}
                      `}
                    >
                      {room.id === value && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>

                    <DoorOpen
                      className="w-4 h-4 flex-shrink-0"
                      style={{ color: 'var(--primary-color)' }}
                    />

                    <div className="flex-1 text-left min-w-0">
                      <div className="font-medium text-sm truncate flex items-center gap-2">
                        Room {room.roomNumber}
                        {!room.isAvailable && (
                          <span
                            className="text-xs px-1.5 py-0.5 rounded"
                            style={{
                              backgroundColor: 'rgba(255,76,76,0.2)',
                              color: 'var(--status-occupied)',
                            }}
                          >
                            Occupied
                          </span>
                        )}
                      </div>

                      <div
                        className="text-xs flex items-center gap-2 flex-wrap"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        <span>{room.type}</span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5">
                          <Users className="w-3 h-3" /> {room.capacity} guests
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5">
                          <DollarSign className="w-3 h-3" /> ${room.pricePerNight}/night
                        </span>
                        {room.amenities && (
                          <>
                            <span>•</span>
                            <span className="truncate max-w-[150px]">
                              {room.amenities}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RoomSelect;
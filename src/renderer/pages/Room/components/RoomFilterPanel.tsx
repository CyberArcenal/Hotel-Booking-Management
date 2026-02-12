import React from "react";
import { Filter, X } from "lucide-react";
import type { GetAllRoomsParams } from "../../../api/room";

interface RoomFilterPanelProps {
  filters: GetAllRoomsParams;
  onChange: (filters: GetAllRoomsParams) => void;
  onClear: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const RoomFilterPanel: React.FC<RoomFilterPanelProps> = ({
  filters,
  onChange,
  onClear,
  isOpen,
  onToggle,
}) => {
  const updateFilter = (key: keyof GetAllRoomsParams, value: any) => {
    onChange({ ...filters, [key]: value });
  };

  if (!isOpen) return null;

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border-color)]/20 rounded-lg p-5 mt-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-md font-semibold text-[var(--text-primary)] flex items-center gap-2">
          <Filter className="w-4 h-4" /> Filter Rooms
        </h3>
        <button
          onClick={onClear}
          className="text-sm text-[var(--text-secondary)] hover:text-[var(--primary-color)] transition-colors"
        >
          Clear all
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Room Type */}
        <div>
          <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-1 uppercase">
            Room Type
          </label>
          <select
            value={filters.type || ""}
            onChange={(e) => updateFilter("type", e.target.value || undefined)}
            className="w-full px-3 py-2 rounded-md border bg-[var(--card-secondary-bg)] border-[var(--border-color)]/20 
             text-[var(--text-primary)] text-sm focus:border-[var(--primary-color)]"
          >
            <option value="">All types</option>
            <option value="standard">Standard</option>
            <option value="single">Single</option>
            <option value="double">Double</option>
            <option value="twin">Twin</option>
            <option value="suite">Suite</option>
            <option value="deluxe">Deluxe</option>
            <option value="family">Family</option>
            <option value="studio">Studio</option>
            <option value="executive">Executive</option>
          </select>
        </div>

        {/* Min Capacity */}
        <div>
          <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-1 uppercase">
            Min. Capacity
          </label>
          <input
            type="number"
            min="1"
            value={filters.minCapacity || ""}
            onChange={(e) =>
              updateFilter(
                "minCapacity",
                e.target.value ? Number(e.target.value) : undefined,
              )
            }
            placeholder="Any"
            className="w-full px-3 py-2 rounded-md border bg-[var(--card-secondary-bg)] border-[var(--border-color)]/20 
                       text-[var(--text-primary)] placeholder-[var(--text-tertiary)] text-sm"
          />
        </div>

        {/* Max Price */}
        <div>
          <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-1 uppercase">
            Max Price / Night
          </label>
          <input
            type="number"
            min="0"
            step="100"
            value={filters.maxPrice || ""}
            onChange={(e) =>
              updateFilter(
                "maxPrice",
                e.target.value ? Number(e.target.value) : undefined,
              )
            }
            placeholder="No limit"
            className="w-full px-3 py-2 rounded-md border bg-[var(--card-secondary-bg)] border-[var(--border-color)]/20 
                       text-[var(--text-primary)] placeholder-[var(--text-tertiary)] text-sm"
          />
        </div>

   
        {/* ✅ Status Filter – uses new `status` param */}
        <div>
          <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-1 uppercase">
            Status
          </label>
          <select
            value={filters.status || "all"}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "all") {
                // remove status filter
                const { status, ...rest } = filters;
                onChange(rest);
              } else {
                onChange({ ...filters, status: value as "available" });
              }
            }}
            className="w-full px-3 py-2 rounded-md border bg-[var(--card-secondary-bg)] border-[var(--border-color)]/20 
                       text-[var(--text-primary)] text-sm focus:border-[var(--primary-color)]"
          >
            <option value="all">All rooms</option>
            <option value="available">Available only</option>
            {/* You can easily add "Occupied" or "Maintenance" later if needed */}
          </select>
        </div>
      </div>

      {/* Sort Options */}
      <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-[var(--border-color)]/20">
        <span className="text-xs font-medium text-[var(--text-tertiary)] uppercase">
          Sort by
        </span>
        <select
          value={filters.sortBy || ""}
          onChange={(e) => updateFilter("sortBy", e.target.value || undefined)}
          className="px-3 py-1.5 rounded-md border bg-[var(--card-secondary-bg)] border-[var(--border-color)]/20 
                     text-[var(--text-primary)] text-xs"
        >
          <option value="">Default</option>
          <option value="roomNumber">Room number</option>
          <option value="pricePerNight">Price</option>
          <option value="capacity">Capacity</option>
        </select>
        <select
          value={filters.sortOrder || "ASC"}
          onChange={(e) =>
            updateFilter("sortOrder", e.target.value as "ASC" | "DESC")
          }
          className="px-3 py-1.5 rounded-md border bg-[var(--card-secondary-bg)] border-[var(--border-color)]/20 
                     text-[var(--text-primary)] text-xs"
        >
          <option value="ASC">Ascending</option>
          <option value="DESC">Descending</option>
        </select>
      </div>
    </div>
  );
};

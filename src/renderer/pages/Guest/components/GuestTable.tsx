import React from 'react';
import { Eye, Edit2, Trash2, CalendarPlus, Award } from 'lucide-react';
import type { GuestWithStats } from '../../../api/guest';

interface GuestTableProps {
  guests: GuestWithStats[];
  activeGuestIds: Set<number>;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onAddBooking: (id: number) => void;
}

const GuestTable: React.FC<GuestTableProps> = ({
  guests,
  activeGuestIds,
  onView,
  onEdit,
  onDelete,
  onAddBooking,
}) => {
  const getVipBadge = (guest: GuestWithStats) => {
    const isVip = (guest.totalBookings || 0) >= 3 || (guest.totalSpent || 0) >= 10000;
    if (isVip) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full
                         bg-[var(--primary-color)]/20 text-[var(--primary-color)] border border-[var(--primary-color)]/30">
          <Award className="w-3 h-3" /> VIP
        </span>
      );
    }
    return null;
  };

  const getCurrentBookingBadge = (guestId: number) => {
    if (activeGuestIds.has(guestId)) {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full
                         bg-green-500/20 text-green-500 border border-green-500/30">
          Active
        </span>
      );
    }
    return (
      <span className="px-2 py-1 text-xs font-medium rounded-full
                       bg-gray-500/20 text-gray-400 border border-gray-500/30">
        None
      </span>
    );
  };

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-[var(--border-color)]/20">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-black text-[var(--text-primary)] border-b border-[var(--border-color)]/20">
          <tr>
            <th className="px-4 py-3 text-left font-medium">ID</th>
            <th className="px-4 py-3 text-left font-medium">Full Name</th>
            <th className="px-4 py-3 text-left font-medium">Contact</th>
            <th className="px-4 py-3 text-left font-medium">Address</th>
            <th className="px-4 py-3 text-left font-medium">Bookings</th>
            <th className="px-4 py-3 text-left font-medium">Current Booking</th>
            <th className="px-4 py-3 text-left font-medium">VIP</th>
            <th className="px-4 py-3 text-left font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {guests.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-4 py-8 text-center text-[var(--text-tertiary)]">
                No guests found.
              </td>
            </tr>
          ) : (
            guests.map((guest) => (
              <tr
                key={guest.id}
                className="border-b border-[var(--border-color)]/10 hover:bg-[var(--card-hover-bg)]/20 transition-colors"
              >
                <td className="px-4 py-3 text-[var(--text-primary)]">#{guest.id}</td>
                <td className="px-4 py-3 text-[var(--text-primary)] font-medium">
                  {guest.fullName}
                </td>
                <td className="px-4 py-3">
                  <div className="text-[var(--text-primary)]">{guest.email}</div>
                  <div className="text-xs text-[var(--text-tertiary)]">{guest.phone}</div>
                </td>
                <td className="px-4 py-3 text-[var(--text-secondary)] max-w-[200px] truncate">
                  {guest.address || '—'}
                </td>
                <td className="px-4 py-3 text-[var(--text-primary)]">
                  {guest.totalBookings ?? 0}
                </td>
                <td className="px-4 py-3">
                  {getCurrentBookingBadge(guest.id)}
                </td>
                <td className="px-4 py-3">
                  {getVipBadge(guest)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onView(guest.id)}
                      className="p-1.5 rounded-lg hover:bg-[var(--card-hover-bg)] text-[var(--text-secondary)] hover:text-[var(--primary-color)] transition-colors"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEdit(guest.id)}
                      className="p-1.5 rounded-lg hover:bg-[var(--card-hover-bg)] text-[var(--text-secondary)] hover:text-[var(--primary-color)] transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(guest.id)}
                      className="p-1.5 rounded-lg hover:bg-[var(--card-hover-bg)] text-[var(--text-secondary)] hover:text-red-500 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onAddBooking(guest.id)}
                      className="p-1.5 rounded-lg hover:bg-[var(--card-hover-bg)] text-[var(--text-secondary)] hover:text-[var(--primary-color)] transition-colors"
                      title="Add Booking"
                    >
                      <CalendarPlus className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default GuestTable;
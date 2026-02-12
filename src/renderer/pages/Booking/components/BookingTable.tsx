import React from "react";
import { Eye, Edit2, XCircle, FileText } from "lucide-react";
import type { Booking } from "../../../api/booking";

interface BookingTableProps {
  bookings: Booking[];
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onCancel: (id: number) => void;
  onInvoice: (id: number) => void;
}

const BookingTable: React.FC<BookingTableProps> = ({
  bookings,
  onView,
  onEdit,
  onCancel,
  onInvoice,
}) => {
  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full capitalize";
    switch (status) {
      case "confirmed":
        return `${baseClasses} bg-[var(--status-confirmed)]/20 text-[var(--status-confirmed)] border border-[var(--status-confirmed)]/30`;
      case "checked_in":
        return `${baseClasses} bg-[var(--status-confirmed)]/20 text-[var(--status-confirmed)] border border-[var(--status-confirmed)]/30`;
      case "checked_out":
        return `${baseClasses} bg-[var(--status-completed)]/20 text-[var(--status-completed)] border border-[var(--status-completed)]/30`;
      case "cancelled":
        return `${baseClasses} bg-[var(--status-cancelled)]/20 text-[var(--status-cancelled)] border border-[var(--status-cancelled)]/30`;
      default:
        return `${baseClasses} bg-[var(--status-pending)]/20 text-[var(--status-pending)] border border-[var(--status-pending)]/30`;
    }
  };

  // Mock payment status – since wala sa current schema, gagamit tayo ng placeholder
  const getPaymentBadge = (booking: Booking) => {
    // Dummy logic: paid kapag confirmed/checked_in, otherwise unpaid
    const isPaid = ["confirmed", "checked_in", "checked_out"].includes(
      booking.status,
    );
    return isPaid ? (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-500 border border-green-500/30">
        Paid
      </span>
    ) : (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-500/20 text-yellow-500 border border-yellow-500/30">
        Unpaid
      </span>
    );
  };

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-[var(--border-color)]/20">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-black text-[var(--text-primary)] border-b border-[var(--border-color)]/20">
          <tr>
            <th className="px-4 py-3 text-left font-medium">Booking ID</th>
            <th className="px-4 py-3 text-left font-medium">Guest Name</th>
            <th className="px-4 py-3 text-left font-medium">Room</th>
            <th className="px-4 py-3 text-left font-medium">Check‑in</th>
            <th className="px-4 py-3 text-left font-medium">Check‑out</th>
            <th className="px-4 py-3 text-left font-medium">Status</th>
            <th className="px-4 py-3 text-left font-medium">Payment</th>
            <th className="px-4 py-3 text-left font-medium">Total</th>
            <th className="px-4 py-3 text-left font-medium">Created By</th>
            <th className="px-4 py-3 text-left font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings.length === 0 ? (
            <tr>
              <td
                colSpan={10}
                className="px-4 py-8 text-center text-[var(--text-tertiary)]"
              >
                No bookings found.
              </td>
            </tr>
          ) : (
            bookings.map((booking) => (
              <tr
                key={booking.id}
                className="border-b border-[var(--border-color)]/10 hover:bg-[var(--card-hover-bg)]/20 transition-colors"
              >
                <td className="px-4 py-3 text-[var(--text-primary)]">
                  #{booking.id}
                </td>
                <td className="px-4 py-3 text-[var(--text-primary)] font-medium">
                  {booking.guest.fullName}
                </td>
                <td className="px-4 py-3">
                  <span className="text-[var(--text-primary)]">
                    {booking.room.roomNumber}
                  </span>
                  <span className="ml-2 text-xs text-[var(--text-tertiary)]">
                    ({booking.room.type})
                  </span>
                </td>
                <td className="px-4 py-3 text-[var(--text-primary)]">
                  {new Date(booking.checkInDate).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-[var(--text-primary)]">
                  {new Date(booking.checkOutDate).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <span className={getStatusBadge(booking.status)}>
                    {booking.status}
                  </span>
                </td>
                <td className="px-4 py-3">{getPaymentBadge(booking)}</td>
                <td className="px-4 py-3 text-[var(--text-primary)] font-medium">
                  ₱{booking.totalPrice.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-[var(--text-secondary)]">
                  {/* Wala pang createdBy sa entity; pwedeng i-add sa future */}
                  Admin
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onView(booking.id);
                      }}
                      className="p-1.5 rounded-lg hover:bg-[var(--card-hover-bg)] text-[var(--text-secondary)] hover:text-[var(--primary-color)] transition-colors"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(booking.id);
                      }}
                      className="p-1.5 rounded-lg hover:bg-[var(--card-hover-bg)] text-[var(--text-secondary)] hover:text-[var(--primary-color)] transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCancel(booking.id);
                      }}
                      className="p-1.5 rounded-lg hover:bg-[var(--card-hover-bg)] text-[var(--text-secondary)] hover:text-red-500 transition-colors"
                      title="Cancel"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onInvoice(booking.id);
                      }}
                      className="p-1.5 rounded-lg hover:bg-[var(--card-hover-bg)] text-[var(--text-secondary)] hover:text-[var(--primary-color)] transition-colors"
                      title="Invoice"
                    >
                      <FileText className="w-4 h-4" />
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

export default BookingTable;

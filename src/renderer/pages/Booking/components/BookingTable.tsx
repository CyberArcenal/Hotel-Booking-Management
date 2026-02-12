import React from "react";
import {
  Eye,
  Edit2,
  XCircle,
  FileText,
  Clock,
  LogIn,
  LogOut,
  CheckCircle,
} from "lucide-react";
import type { Booking } from "../../../api/booking";
import BookingActionsDropdown from "./Dropdown";
import { formatCurrency } from "../../../utils/formatters";
const statusConfig: Record<
  string,
  { label: string; icon: React.ElementType; classes: string }
> = {
  confirmed: {
    label: "Confirmed",
    icon: Clock,
    classes:
      "bg-[var(--status-confirmed)]/20 text-[var(--status-confirmed)] border border-[var(--status-confirmed)]/30",
  },
  checked_in: {
    label: "Checked In",
    icon: LogIn,
    classes:
      "bg-[var(--status-confirmed)]/20 text-[var(--status-confirmed)] border border-[var(--status-confirmed)]/30",
  },
  checked_out: {
    label: "Checked Out",
    icon: LogOut,
    classes:
      "bg-[var(--status-completed)]/20 text-[var(--status-completed)] border border-[var(--status-completed)]/30",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    classes:
      "bg-[var(--status-cancelled)]/20 text-[var(--status-cancelled)] border border-[var(--status-cancelled)]/30",
  },
  pending: {
    label: "Pending",
    icon: CheckCircle,
    classes:
      "bg-[var(--status-pending)]/20 text-[var(--status-pending)] border border-[var(--status-pending)]/30",
  },
};
export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const config = statusConfig[status] || statusConfig["pending"];
  const Icon = config.icon;
  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded-full capitalize flex items-center gap-1 ${config.classes}`}
    >
      <Icon className="w-3.5 h-3.5 flex-shrink-0" />{" "}
      <span className="ml-1 truncate">{config.label}</span>
    </span>
  );
};
interface BookingTableProps {
  bookings: Booking[];
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onCancel: (id: number) => void;
  onInvoice: (id: number) => void;
  // New handlers for dropdown actions
  onCheckIn: (id: number) => void;
  onCheckOut: (id: number) => void;
  onMarkAsPaid: (id: number) => void;
  onMarkAsFailed: (id: number) => void;
  onDelete: (id: number) => void;
}

const BookingTable: React.FC<BookingTableProps> = ({
  bookings,
  onView,
  onEdit,
  onCancel,
  onInvoice,
  onCheckIn,
  onCheckOut,
  onMarkAsPaid,
  onMarkAsFailed,
  onDelete,
}) => {
  // Mock payment status – since wala sa current schema, gagamit tayo ng placeholder
  const getPaymentBadge = (paymentStatus: string) => {
    // Dummy logic: paid kapag confirmed/checked_in, otherwise unpaid

    switch (paymentStatus) {
      case "paid":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-500 border border-green-500/30">
            Paid
          </span>
        );
      case "failed":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-500/20 text-red-500 border border-red-500/30">
            Failed
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-500/20 text-yellow-500 border border-yellow-500/30">
            unpaid
          </span>
        );
    }
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
            bookings?.map((booking) => (
              <tr
                key={booking.id}
                className="border-b border-[var(--border-color)]/10 hover:bg-[var(--card-hover-bg)]/20 transition-colors"
              >
                <td className="px-4 py-3 text-[var(--text-primary)]">
                  #{booking.id}
                </td>
                <td className="px-4 py-3 text-[var(--text-primary)] font-medium">
                  {booking.guest?.fullName || "—"}
                </td>
                <td className="px-4 py-3">
                  <span className="text-[var(--text-primary)]">
                    {booking.room?.roomNumber || "—"}
                  </span>
                  <span className="ml-2 text-xs text-[var(--text-tertiary)]">
                    ({booking.room?.type || "Unknown"})
                  </span>
                </td>
                <td className="px-4 py-3 text-[var(--text-primary)]">
                  {new Date(booking.checkInDate).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-[var(--text-primary)]">
                  {new Date(booking.checkOutDate).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  {" "}
                  <StatusBadge status={booking.status} />{" "}
                </td>
                <td className="px-4 py-3">
                  {getPaymentBadge(booking.paymentStatus)}
                </td>
                <td className="px-4 py-3 text-[var(--text-primary)] font-medium">
                  {formatCurrency(booking.totalPrice)}
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
                    {/* NEW: Dropdown with more actions */}
                    <BookingActionsDropdown
                      booking={booking}
                      onCheckIn={onCheckIn}
                      onCheckOut={onCheckOut}
                      onCancel={onCancel}
                      onMarkAsPaid={onMarkAsPaid}
                      onMarkAsFailed={onMarkAsFailed}
                      onGenerateInvoice={onInvoice} // reuse invoice handler
                      onDelete={onDelete}
                    />
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

import React, { useRef, useEffect, useState } from "react";
import {
  MoreVertical,
  CheckCircle,
  XCircle,
  DollarSign,
  FileText,
  Trash2,
} from "lucide-react";
import type { Booking } from "../../../api/booking";
import { dialogs } from "../../../utils/dialogs";

interface BookingActionsDropdownProps {
  booking: Booking;
  onCheckIn: (id: number) => void;
  onCheckOut: (id: number) => void;
  onCancel: (id: number) => void;
  onMarkAsPaid: (id: number) => void;
  onMarkAsFailed: (id: number) => void;
  onGenerateInvoice: (id: number) => void;
  onDelete: (id: number) => void;
}

const BookingActionsDropdown: React.FC<BookingActionsDropdownProps> = ({
  booking,
  onCheckIn,
  onCheckOut,
  onCancel,
  onMarkAsPaid,
  onMarkAsFailed,
  onGenerateInvoice,
  onDelete,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Dynamic positioning – show above if not enough space below
  const getDropdownPosition = () => {
    if (!buttonRef.current) return {};
    const rect = buttonRef.current.getBoundingClientRect();
    const dropdownHeight = 240; // approximate
    const windowHeight = window.innerHeight;
    if (rect.bottom + dropdownHeight > windowHeight) {
      return {
        position: "fixed" as const,
        bottom: `${windowHeight - rect.top + 5}px`,
        right: `${window.innerWidth - rect.right}px`,
        zIndex: 1000,
      };
    }
    return {
      position: "fixed" as const,
      top: `${rect.bottom + 5}px`,
      right: `${window.innerWidth - rect.right}px`,
      zIndex: 1000,
    };
  };

  // console.log("BookingActionsDropdown render", { booking, isOpen });

  const isActive = ["confirmed", "checked_in"].includes(booking.status);
  const canCheckIn = booking.status === "confirmed";
  const canCheckOut = booking.status === "checked_in";
  const canCancel = ["confirmed", "checked_in"].includes(booking.status);

  return (
    <div className="booking-actions-dropdown-container" ref={dropdownRef}>
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="p-1.5 rounded-lg hover:bg-[var(--card-hover-bg)] text-[var(--text-secondary)] 
                   hover:text-[var(--primary-color)] transition-colors relative z-50"
        title="More actions"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <div
          className="bg-[var(--card-bg)] rounded-lg shadow-xl border border-[var(--border-color)]/30 
                     min-w-[200px] py-1 windows-fade-in"
          style={getDropdownPosition()}
        >
          {/* Check In */}
          {canCheckIn && (
            <button
              onClick={async (e) => {
                e.stopPropagation();
                if (
                  !(await dialogs.confirm({
                    title: "Confirm Check In",
                    message: "Are you sure you want to check in this booking?",
                  }))
                )
                  return;
                handleAction(() => onCheckIn(booking.id));
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm 
                       text-[var(--text-primary)] hover:bg-[var(--card-hover-bg)] 
                       transition-colors"
            >
              <CheckCircle className="w-4 h-4 text-[var(--status-confirmed)]" />
              <span>Check In</span>
            </button>
          )}

          {/* Check Out */}
          {canCheckOut && (
            <button
              onClick={async (e) => {
                e.stopPropagation();
                if (
                  !(await dialogs.confirm({
                    title: "Confirm Check Out",
                    message: "Are you sure you want to check out this booking?",
                  }))
                )
                  return;
                handleAction(() => onCheckOut(booking.id));
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm 
                       text-[var(--text-primary)] hover:bg-[var(--card-hover-bg)] 
                       transition-colors"
            >
              <XCircle className="w-4 h-4 text-[var(--status-completed)]" />
              <span>Check Out</span>
            </button>
          )}

          {/* Cancel */}
          {canCancel && (
            <button
              onClick={async (e) => {
                e.stopPropagation();
                if (
                  !(await dialogs.confirm({
                    title: "Confirm Cancel",
                    message: "Are you sure you want to cancel this booking?",
                  }))
                )
                  return;
                handleAction(() => onCancel(booking.id));
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm 
                       text-[var(--text-primary)] hover:bg-[var(--card-hover-bg)] 
                       transition-colors"
            >
              <XCircle className="w-4 h-4 text-[var(--status-cancelled)]" />
              <span>Cancel</span>
            </button>
          )}

          {/* Divider */}
          {(canCheckIn || canCheckOut || canCancel) && (
            <div className="border-t border-[var(--border-color)]/20 my-1" />
          )}

          {/* Mark as Paid (placeholder) */}
          {booking.paymentStatus === "pending" && (
            <button
              onClick={async (e) => {
                e.stopPropagation();
                if (
                  !(await dialogs.confirm({
                    title: "Confirm Mark as Paid",
                    message:
                      "Are you sure you want to mark this booking as paid?",
                  }))
                )
                  return;
                handleAction(() => onMarkAsPaid(booking.id));
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm 
                     text-[var(--text-primary)] hover:bg-[var(--card-hover-bg)] 
                     transition-colors"
            >
              <DollarSign className="w-4 h-4 text-[var(--primary-color)]" />
              <span>Mark as Paid</span>
            </button>
          )}

          {/* Mark as Failed */}
          {booking.paymentStatus === "pending" && (
            <button
              onClick={async (e) => {
                e.stopPropagation();
                if (
                  !(await dialogs.confirm({
                    title: "Confirm Mark as Failed",
                    message:
                      "Are you sure you want to mark this booking as failed?",
                  }))
                )
                  return;
                handleAction(() => onMarkAsFailed(booking.id));
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm 
                     text-[var(--text-primary)] hover:bg-[var(--card-hover-bg)] 
                     transition-colors"
            >
              <XCircle className="w-4 h-4 text-red-500" />
              <span>Mark as Failed</span>
            </button>
          )}

          {/* Generate Invoice */}
          <button
            onClick={async (e) => {
              e.stopPropagation();
              if (
                !(await dialogs.confirm({
                  title: "Invoice",
                  message: "Are you sure you want to invoice this booking?",
                }))
              )
                return;
              handleAction(() => onGenerateInvoice(booking.id));
            }}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm 
                     text-[var(--text-primary)] hover:bg-[var(--card-hover-bg)] 
                     transition-colors"
          >
            <FileText className="w-4 h-4 text-[var(--primary-color)]" />
            <span>Generate Invoice</span>
          </button>

          {/* Divider before delete */}
          <div className="border-t border-[var(--border-color)]/20 my-1" />

          {/* Delete – shown for cancelled or inactive bookings, or always with caution */}
          {!isActive && (
            <button
              onClick={async (e) => {
                e.stopPropagation();
                if (
                  !(await dialogs.confirm({
                    title: "Confirm Deletion",
                    message: "Are you sure you want to delete this booking?",
                  }))
                )
                  return;
                handleAction(() => onDelete(booking.id));
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm 
                       text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default BookingActionsDropdown;

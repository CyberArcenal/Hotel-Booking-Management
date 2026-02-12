// src/renderer/components/Booking/Form/types.ts
import type { Booking, Guest } from '../../../api/booking';

export interface FormData {
  checkInDate: string;
  checkOutDate: string;
  roomId: number | null;
  numberOfGuests: number;
  specialRequests: string;
  guestId: number | null;          // ← pinalitan ang guest object
}

export interface BookingFormDialogProps {
  id?: number;          // edit mode
  mode: 'add' | 'edit';
  roomId?: number;      // pre‑select room (add mode only)
  guestId?: number;     // pre‑select guest (add mode only)
  onClose: () => void;
  onSuccess: (booking: Booking) => void;
}
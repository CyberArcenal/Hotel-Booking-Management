// src/renderer/components/Booking/Form/BookingFormDialog.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Loader } from 'lucide-react';
// Components
import FormHeader from './components/FormHeader';
import FormFooter from './components/FormFooter';
import SummaryCard from './components/SummaryCard';
import TotalPreview from './components/TotalPreview';

// Types
import type { FormData, BookingFormDialogProps } from './types';
import type { Booking } from '../../api/booking';
import type { Room } from '../../api/room';
import type { Guest } from '../../api/guest';
import bookingAPI from '../../api/booking';
import { showError, showSuccess } from '../../utils/notification';
import guestAPI from '../../api/guest';
import { dialogs } from '../../utils/dialogs';
import RoomSelectionSection from './components/RoomSelectionSection';
import StayDatesSection from './components/StayDatesSection';
import GuestsRequestsSection from './components/GuestsRequestsSection';
import GuestSelectSection from './components/GuestSelectSection';
import roomAPI from '../../api/room';

const BookingFormDialog: React.FC<BookingFormDialogProps> = ({
  id,
  mode,
  roomId: initialRoomId,
  guestId: initialGuestId,
  onClose,
  onSuccess,
}) => {
  // ---------- State ----------
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [nights, setNights] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initial form state
  const [formData, setFormData] = useState<FormData>({
    checkInDate: new Date().toISOString().split('T')[0],
    checkOutDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    roomId: initialRoomId || null,
    numberOfGuests: 1,
    specialRequests: '',
    guestId: initialGuestId || null,
  });

  // ---------- Fetch booking (edit mode) ----------
  useEffect(() => {
    const fetchBooking = async () => {
      if (mode === 'edit' && id) {
        try {
          setLoading(true);
          const res = await bookingAPI.getById(id);
          if (res.status && res.data) {
            const data = res.data;
            setBooking(data);
            setFormData({
              checkInDate: data.checkInDate,
              checkOutDate: data.checkOutDate,
              roomId: data.room.id,
              numberOfGuests: data.numberOfGuests,
              specialRequests: data.specialRequests || '',
              guestId: data.guest.id,   // ← gamit ang guest.id
            });
            setSelectedRoom(data.room as Room);
            setSelectedGuest(data.guest); // ← i-display agad ang napiling guest
          } else {
            showError('Booking not found');
            onClose();
          }
        } catch (error) {
          showError('Failed to load booking');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [id, mode, onClose]);

  // ---------- Fetch guest details when guestId changes (add mode) ----------
  useEffect(() => {
    const fetchGuest = async () => {
      if (formData.guestId) {
        try {
          const res = await guestAPI.getById(formData.guestId, false);
          if (res.status && res.data) {
            setSelectedGuest(res.data);
          }
        } catch (error) {
          console.error('Failed to fetch guest details:', error);
          setSelectedGuest(null);
        }
      } else {
        setSelectedGuest(null);
      }
    };
    fetchGuest();
  }, [formData.guestId]);

  // ---------- Fetch room details when roomId changes ----------
  useEffect(() => {
    if (!formData.roomId) {
      setSelectedRoom(null);
      return;
    }
    const fetchRoom = async () => {
      try {
        const res = await roomAPI.getById(formData.roomId!);
        if (res.status && res.data) setSelectedRoom(res.data);
      } catch (error) {
        console.error('Error fetching room:', error);
      }
    };
    fetchRoom();
  }, [formData.roomId]);

  // ---------- Compute nights ----------
  useEffect(() => {
    if (formData.checkInDate && formData.checkOutDate) {
      const start = new Date(formData.checkInDate);
      const end = new Date(formData.checkOutDate);
      const diff = end.getTime() - start.getTime();
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      setNights(days > 0 ? days : 0);
    }
  }, [formData.checkInDate, formData.checkOutDate]);

  // ---------- Compute total price ----------
  useEffect(() => {
    if (selectedRoom && nights > 0) {
      setTotalPrice(selectedRoom.pricePerNight * nights);
    } else {
      setTotalPrice(0);
    }
  }, [selectedRoom, nights]);

  // ---------- Handlers ----------
  const handleChange = useCallback(
    (field: keyof Omit<FormData, 'guestId'>, value: any) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
    },
    [errors],
  );

  const handleGuestChange = useCallback(
    (guestId: number | null, guest?: Guest) => {
      setFormData((prev) => ({ ...prev, guestId }));
      setSelectedGuest(guest || null);
      if (errors.guestId) setErrors((prev) => ({ ...prev, guestId: '' }));
    },
    [errors],
  );

  const handleRoomChange = useCallback(
    (roomId: number | null) => {
      setFormData((prev) => ({ ...prev, roomId }));
      if (errors.roomId) setErrors((prev) => ({ ...prev, roomId: '' }));
    },
    [errors],
  );

  // ---------- Validation ----------
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.roomId) newErrors.roomId = 'Please select a room';
    if (!formData.checkInDate) newErrors.checkInDate = 'Check-in is required';
    if (!formData.checkOutDate) newErrors.checkOutDate = 'Check-out is required';
    if (
      formData.checkInDate &&
      formData.checkOutDate &&
      new Date(formData.checkOutDate) <= new Date(formData.checkInDate)
    ) {
      newErrors.checkOutDate = 'Check-out must be after check-in';
    }

    if (!formData.numberOfGuests || formData.numberOfGuests < 1) {
      newErrors.numberOfGuests = 'At least 1 guest is required';
    }
    if (selectedRoom && formData.numberOfGuests > selectedRoom.capacity) {
      newErrors.numberOfGuests = `Max capacity is ${selectedRoom.capacity}`;
    }

    // Guest validation – required
    if (!formData.guestId) {
      newErrors.guestId = 'Please select a guest';
    }

    if (formData.specialRequests && formData.specialRequests.length > 500) {
      newErrors.specialRequests = 'Special requests too long (max 500)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, selectedRoom]);

  // ---------- Submit ----------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      showError('Please fix the errors in the form');
      return;
    }

    const confirmTitle = mode === 'add' ? 'Create Booking' : 'Update Booking';
    const confirmMsg =
      mode === 'add'
        ? 'Are you sure you want to create this booking?'
        : 'Are you sure you want to update this booking?';

    if (!(await dialogs.confirm({ title: confirmTitle, message: confirmMsg }))) return;

    setSubmitting(true);
    try {
      let response;
      const user = 'system'; // TODO: replace with real user from auth

      if (mode === 'add') {
        // CREATE: gumagamit ng existing guest (guestData = { id: ... })
        response = await bookingAPI.create({
          checkInDate: formData.checkInDate,
          checkOutDate: formData.checkOutDate,
          roomId: formData.roomId!,
          guestData: { id: formData.guestId! },
          numberOfGuests: formData.numberOfGuests,
          specialRequests: formData.specialRequests.trim() || undefined,
          user,
        });
      } else {
        // UPDATE: pwedeng magpalit ng guest sa pamamagitan ng guestData
        response = await bookingAPI.update(
          id!,
          {
            checkInDate: formData.checkInDate,
            checkOutDate: formData.checkOutDate,
            numberOfGuests: formData.numberOfGuests,
            specialRequests: formData.specialRequests.trim() || null,
            roomId: formData.roomId!,
            guestData: { id: formData.guestId! }, // ← pinapayagan ang pagpalit ng guest
          },
          user,
        );
      }

      if (response?.status) {
        showSuccess(mode === 'add' ? 'Booking created!' : 'Booking updated!');
        onSuccess(response.data);
      } else {
        throw new Error(response?.message || 'Failed to save booking');
      }
    } catch (error: any) {
      showError(error.message || 'Failed to save booking');
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- Render ----------
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100]">
        <div className="p-6 rounded-lg bg-[var(--card-bg)] text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-3" style={{ color: 'var(--primary-color)' }} />
          <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div
        className="w-full max-w-4xl rounded-lg shadow-2xl border max-h-[90vh] overflow-hidden"
        style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
      >
        <FormHeader mode={mode} id={id} onClose={onClose} submitting={submitting} />

        <div className="overflow-y-auto max-h-[calc(90vh-130px)] p-6">
          {mode === 'edit' && booking && (
            <SummaryCard booking={booking} selectedRoom={selectedRoom} nights={nights} totalPrice={totalPrice} />
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* LEFT COLUMN – Room, Dates, Guests & Requests */}
              <div className="space-y-6">
                <RoomSelectionSection
                  value={formData.roomId}
                  onChange={handleRoomChange}
                  disabled={submitting || initialRoomId !== undefined}
                  error={errors.roomId}
                />
                <StayDatesSection
                  checkInDate={formData.checkInDate}
                  checkOutDate={formData.checkOutDate}
                  onCheckInChange={(val) => handleChange('checkInDate', val)}
                  onCheckOutChange={(val) => handleChange('checkOutDate', val)}
                  nights={nights}
                  pricePerNight={selectedRoom?.pricePerNight}
                  errors={{
                    checkInDate: errors.checkInDate,
                    checkOutDate: errors.checkOutDate,
                  }}
                  disabled={submitting}
                />
                <GuestsRequestsSection
                  numberOfGuests={formData.numberOfGuests}
                  onNumberOfGuestsChange={(val) => handleChange('numberOfGuests', val)}
                  specialRequests={formData.specialRequests}
                  onSpecialRequestsChange={(val) => handleChange('specialRequests', val)}
                  maxCapacity={selectedRoom?.capacity}
                  errors={{
                    numberOfGuests: errors.numberOfGuests,
                    specialRequests: errors.specialRequests,
                  }}
                  disabled={submitting}
                />
              </div>

              {/* RIGHT COLUMN – Guest Selection */}
              <div className="space-y-6">
                <GuestSelectSection
                  guestId={formData.guestId}
                  selectedGuest={selectedGuest}
                  onChange={handleGuestChange}
                  error={errors.guestId}
                  disabled={submitting || (mode === 'add' && !!initialGuestId)} // kung may initial guestId, i-lock
                />
              </div>
            </div>

            <TotalPreview selectedRoom={selectedRoom} nights={nights} totalPrice={totalPrice} />
          </form>
        </div>

        <FormFooter
          mode={mode}
          submitting={submitting}
          onClose={onClose}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
};

export default BookingFormDialog;
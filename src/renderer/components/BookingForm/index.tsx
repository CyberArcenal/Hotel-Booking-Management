// src/renderer/components/Booking/Form/BookingFormDialog.tsx
import React, { useState, useEffect } from "react";
import {
  X,
  Save,
  Calendar,
  Users,
  Mail,
  Phone,
  MapPin,
  FileText,
  AlertCircle,
  Loader,
  DoorOpen,
  CreditCard,
  Hash,
  User,
  Hotel,
} from "lucide-react";

// API and types
import bookingAPI, { type Booking, type Room } from "../../api/booking";
import roomAPI from "../../api/room";
import { showError, showSuccess } from "../../utils/notification";
import { dialogs } from "../../utils/dialogs";
import RoomSelect from "../Selects/Room";

// ----------------------------------------------------------------------
// Props
// ----------------------------------------------------------------------
interface BookingFormDialogProps {
  id?: number; // required for edit mode
  mode: "add" | "edit";
  roomId?: number; // optional initial room selection (for add mode)
  onClose: () => void;
  onSuccess: (booking: Booking) => void;
}

// ----------------------------------------------------------------------
// Form Data Structure
// ----------------------------------------------------------------------
interface FormData {
  // Stay details
  checkInDate: string;
  checkOutDate: string;
  roomId: number | null;
  numberOfGuests: number;
  specialRequests: string;

  // Guest details (matches booking.ts Guest interface)
  guest: {
    fullName: string;
    email: string;
    phone: string;
    address?: string;
    idNumber?: string;
  };
}

// ----------------------------------------------------------------------
// Component
// ----------------------------------------------------------------------
const BookingFormDialog: React.FC<BookingFormDialogProps> = ({
  id,
  mode,
  roomId,
  onClose,
  onSuccess,
}) => {
  // --------------------------------------------------------------------
  // State
  // --------------------------------------------------------------------
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [nights, setNights] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initial form state
  const [formData, setFormData] = useState<FormData>({
    checkInDate: new Date().toISOString().split("T")[0],
    checkOutDate: new Date(Date.now() + 86400000).toISOString().split("T")[0], // tomorrow
    roomId: roomId || null,
    numberOfGuests: 1,
    specialRequests: "",
    guest: {
      fullName: "",
      email: "",
      phone: "",
      address: "",
      idNumber: "",
    },
  });

  // --------------------------------------------------------------------
  // 1. Fetch existing booking (edit mode)
  // --------------------------------------------------------------------
  useEffect(() => {
    const fetchBooking = async () => {
      if (mode === "edit" && id) {
        try {
          setLoading(true);
          const response = await bookingAPI.getById(id);
          if (response.status && response.data) {
            const bookingData = response.data;
            setBooking(bookingData);

            setFormData({
              checkInDate: bookingData.checkInDate,
              checkOutDate: bookingData.checkOutDate,
              roomId: bookingData.room.id,
              numberOfGuests: bookingData.numberOfGuests,
              specialRequests: bookingData.specialRequests || "",
              guest: {
                fullName: bookingData.guest.fullName,
                email: bookingData.guest.email,
                phone: bookingData.guest.phone,
                address: bookingData.guest.address || "",
                idNumber: bookingData.guest.idNumber || "",
              },
            });

            // Preload room details for price preview
            setSelectedRoom(bookingData.room);
          } else {
            showError("Booking not found");
            onClose();
          }
        } catch (error) {
          console.error("Error fetching booking:", error);
          showError("Failed to load booking data");
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [id, mode, onClose]);

  // --------------------------------------------------------------------
  // 2. Fetch room details when roomId changes (price preview)
  // --------------------------------------------------------------------
  useEffect(() => {
    if (formData.roomId) {
      const fetchRoom = async () => {
        try {
          const response = await roomAPI.getById(formData.roomId!);
          if (response.status && response.data) {
            setSelectedRoom(response.data);
          }
        } catch (error) {
          console.error("Error fetching room details:", error);
        }
      };
      fetchRoom();
    } else {
      setSelectedRoom(null);
    }
  }, [formData.roomId]);

  // --------------------------------------------------------------------
  // 3. Compute nights and total price
  // --------------------------------------------------------------------
  useEffect(() => {
    if (formData.checkInDate && formData.checkOutDate) {
      const start = new Date(formData.checkInDate);
      const end = new Date(formData.checkOutDate);
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setNights(diffDays > 0 ? diffDays : 0);
    }
  }, [formData.checkInDate, formData.checkOutDate]);

  useEffect(() => {
    if (selectedRoom && nights > 0) {
      setTotalPrice(selectedRoom.pricePerNight * nights);
    } else {
      setTotalPrice(0);
    }
  }, [selectedRoom, nights]);

  // --------------------------------------------------------------------
  // 4. Handlers
  // --------------------------------------------------------------------
  const handleChange = (field: keyof Omit<FormData, "guest">, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleGuestChange = (field: keyof FormData["guest"], value: string) => {
    setFormData((prev) => ({
      ...prev,
      guest: { ...prev.guest, [field]: value },
    }));
    const errorKey = `guest.${field}`;
    if (errors[errorKey]) setErrors((prev) => ({ ...prev, [errorKey]: "" }));
  };

  const handleRoomChange = (roomId: number | null) => {
    setFormData((prev) => ({ ...prev, roomId }));
    if (errors.roomId) setErrors((prev) => ({ ...prev, roomId: "" }));
  };

  // --------------------------------------------------------------------
  // 5. Validation
  // --------------------------------------------------------------------
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Room
    if (!formData.roomId) {
      newErrors.roomId = "Please select a room";
    }

    // Dates
    if (!formData.checkInDate) {
      newErrors.checkInDate = "Check-in date is required";
    }
    if (!formData.checkOutDate) {
      newErrors.checkOutDate = "Check-out date is required";
    }
    if (
      formData.checkInDate &&
      formData.checkOutDate &&
      new Date(formData.checkOutDate) <= new Date(formData.checkInDate)
    ) {
      newErrors.checkOutDate = "Check-out must be after check-in";
    }

    // Guests count
    if (!formData.numberOfGuests || formData.numberOfGuests < 1) {
      newErrors.numberOfGuests = "At least 1 guest is required";
    }
    if (selectedRoom && formData.numberOfGuests > selectedRoom.capacity) {
      newErrors.numberOfGuests = `Room capacity is ${selectedRoom.capacity} guests`;
    }

    // Guest details
    if (!formData.guest.fullName.trim()) {
      newErrors["guest.fullName"] = "Full name is required";
    } else if (formData.guest.fullName.length > 100) {
      newErrors["guest.fullName"] = "Name must be less than 100 characters";
    }

    if (!formData.guest.email.trim()) {
      newErrors["guest.email"] = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.guest.email)) {
      newErrors["guest.email"] = "Invalid email format";
    }

    if (!formData.guest.phone.trim()) {
      newErrors["guest.phone"] = "Phone number is required";
    }

    if (formData.guest.address && formData.guest.address.length > 255) {
      newErrors["guest.address"] = "Address must be less than 255 characters";
    }

    if (formData.guest.idNumber && formData.guest.idNumber.length > 50) {
      newErrors["guest.idNumber"] = "ID number must be less than 50 characters";
    }

    if (formData.specialRequests && formData.specialRequests.length > 500) {
      newErrors.specialRequests =
        "Special requests must be less than 500 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --------------------------------------------------------------------
  // 6. Submit (Create or Update)
  // --------------------------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showError("Please fix the errors in the form");
      return;
    }

    const confirmTitle = mode === "add" ? "Create Booking" : "Update Booking";
    const confirmMsg =
      mode === "add"
        ? "Are you sure you want to create this booking?"
        : "Are you sure you want to update this booking?";

    if (!(await dialogs.confirm({ title: confirmTitle, message: confirmMsg })))
      return;

    try {
      setSubmitting(true);

      // Prepare guest data (create: full details; update: partial)
      const guestData = {
        fullName: formData.guest.fullName.trim(),
        email: formData.guest.email.trim(),
        phone: formData.guest.phone.trim(),
        ...(formData.guest.address?.trim() && {
          address: formData.guest.address.trim(),
        }),
        ...(formData.guest.idNumber?.trim() && {
          idNumber: formData.guest.idNumber.trim(),
        }),
      };

      let response;

      if (mode === "add") {
        // CREATE: send full guest data, user inside bookingData
        response = await bookingAPI.create({
          checkInDate: formData.checkInDate,
          checkOutDate: formData.checkOutDate,
          roomId: formData.roomId!,
          guestData, // full Omit<Guest, 'id'|'createdAt'>
          numberOfGuests: formData.numberOfGuests,
          specialRequests: formData.specialRequests.trim() || undefined,
          user: "system", // TODO: get from auth context
        });
      } else {
        // UPDATE: roomId and guestData go INSIDE bookingData, user is separate param
        response = await bookingAPI.update(
          id!,
          {
            checkInDate: formData.checkInDate,
            checkOutDate: formData.checkOutDate,
            numberOfGuests: formData.numberOfGuests,
            specialRequests: formData.specialRequests.trim() || null,
            roomId: formData.roomId!, // ✅ correct placement
            guestData, // ✅ correct placement (Partial<Guest>)
          },
          "system", // user (optional)
        );
      }

      if (response?.status) {
        showSuccess(
          mode === "add"
            ? "Booking created successfully!"
            : "Booking updated successfully!",
        );
        onSuccess(response.data);
      } else {
        throw new Error(response?.message || "Failed to save booking");
      }
    } catch (error: any) {
      console.error("Error submitting form:", error);
      showError(error.message || "Failed to save booking");
    } finally {
      setSubmitting(false);
    }
  };

  // --------------------------------------------------------------------
  // 7. Render
  // --------------------------------------------------------------------
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div
        className="w-full max-w-4xl rounded-lg shadow-2xl border max-h-[90vh] overflow-hidden"
        style={{
          backgroundColor: "var(--card-bg)",
          borderColor: "var(--border-color)",
        }}
      >
        {/* ---------- Header ---------- */}
        <div
          className="p-4 border-b flex items-center justify-between"
          style={{
            borderColor: "var(--border-color)",
            backgroundColor: "var(--card-secondary-bg)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                backgroundColor: "var(--primary-color)",
                color: "var(--secondary-color)",
              }}
            >
              <Hotel className="w-4 h-4" />
            </div>
            <div>
              <h3
                className="text-base font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                {mode === "add" ? "New Booking" : "Edit Booking"}
              </h3>
              <div
                className="text-xs flex items-center gap-2"
                style={{ color: "var(--text-secondary)" }}
              >
                {mode === "edit" && (
                  <>
                    <span>Booking #{id}</span>
                    <span>•</span>
                  </>
                )}
                <span>
                  {mode === "add"
                    ? "Create a new reservation"
                    : "Modify reservation details"}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={async () => {
              if (
                !(await dialogs.confirm({
                  title: `${mode === "add" ? "New" : "Edit"} Booking - Close Form`,
                  message:
                    mode === "add"
                      ? "Are you sure you want to close the form? Unsaved changes will be lost."
                      : "Are you sure you want to close the form?",
                }))
              )
                return;
              onClose();
            }}
            className="w-7 h-7 rounded flex items-center justify-center transition-colors hover:bg-gray-700"
            style={{ color: "var(--text-secondary)" }}
            disabled={submitting}
          >
            <X className="w-3 h-3" />
          </button>
        </div>

        {/* ---------- Content (scrollable) ---------- */}
        <div className="overflow-y-auto max-h-[calc(90vh-130px)] p-6">
          {loading ? (
            <div className="text-center py-8">
              <Loader
                className="w-8 h-8 animate-spin mx-auto mb-3"
                style={{ color: "var(--primary-color)" }}
              />
              <p style={{ color: "var(--text-secondary)" }}>
                Loading booking...
              </p>
            </div>
          ) : (
            <>
              {/* ---------- Summary Card (edit mode only) ---------- */}
              {mode === "edit" && booking && (
                <div
                  className="mb-6 p-4 rounded-lg border"
                  style={{
                    backgroundColor: "var(--card-secondary-bg)",
                    borderColor: "var(--border-color)",
                  }}
                >
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{
                          backgroundColor: "rgba(212,175,55,0.1)",
                          color: "var(--primary-color)",
                        }}
                      >
                        <Hash className="w-4 h-4" />
                      </div>
                      <div>
                        <div
                          className="text-xs"
                          style={{ color: "var(--text-tertiary)" }}
                        >
                          Status
                        </div>
                        <span
                          className="text-xs font-medium px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor:
                              booking.status === "confirmed"
                                ? "rgba(212,175,55,0.2)"
                                : booking.status === "checked_in"
                                  ? "rgba(74,222,128,0.2)"
                                  : booking.status === "checked_out"
                                    ? "rgba(255,255,255,0.2)"
                                    : "rgba(255,76,76,0.2)",
                            color:
                              booking.status === "confirmed"
                                ? "var(--status-confirmed)"
                                : booking.status === "checked_in"
                                  ? "var(--status-available)"
                                  : booking.status === "checked_out"
                                    ? "var(--text-primary)"
                                    : "var(--status-cancelled)",
                          }}
                        >
                          {booking.status.replace("_", " ").toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{
                          backgroundColor: "rgba(212,175,55,0.1)",
                          color: "var(--primary-color)",
                        }}
                      >
                        <DoorOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <div
                          className="text-xs"
                          style={{ color: "var(--text-tertiary)" }}
                        >
                          Room
                        </div>
                        <div
                          className="text-sm font-medium"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {booking.room.roomNumber} • {booking.room.type}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{
                          backgroundColor: "rgba(212,175,55,0.1)",
                          color: "var(--primary-color)",
                        }}
                      >
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <div
                          className="text-xs"
                          style={{ color: "var(--text-tertiary)" }}
                        >
                          Nights
                        </div>
                        <div
                          className="text-sm font-medium"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {nights} {nights === 1 ? "night" : "nights"}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{
                          backgroundColor: "rgba(212,175,55,0.1)",
                          color: "var(--primary-color)",
                        }}
                      >
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div>
                        <div
                          className="text-xs"
                          style={{ color: "var(--text-tertiary)" }}
                        >
                          Total
                        </div>
                        <div
                          className="text-sm font-semibold"
                          style={{ color: "var(--primary-color)" }}
                        >
                          ${totalPrice.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ---------- Form ---------- */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* ----- LEFT COLUMN ----- */}
                  <div className="space-y-6">
                    {/* Room Selection */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <DoorOpen
                          className="w-4 h-4"
                          style={{ color: "var(--text-secondary)" }}
                        />
                        <h4
                          className="text-sm font-semibold"
                          style={{ color: "var(--text-primary)" }}
                        >
                          Room Selection
                        </h4>
                      </div>
                      <RoomSelect
                        value={roomId !== undefined ? roomId : formData.roomId}
                        onChange={handleRoomChange}
                        disabled={submitting}
                        placeholder="Select a room"
                        includeTypeFilter={true}
                        includeAvailabilityFilter={true}
                      />
                      {errors.roomId && (
                        <p className="mt-1 text-xs flex items-center gap-1 text-red-400">
                          <AlertCircle className="w-3 h-3" />
                          {errors.roomId}
                        </p>
                      )}
                    </div>

                    {/* Stay Dates */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Calendar
                          className="w-4 h-4"
                          style={{ color: "var(--text-secondary)" }}
                        />
                        <h4
                          className="text-sm font-semibold"
                          style={{ color: "var(--text-primary)" }}
                        >
                          Stay Details
                        </h4>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label
                            className="block text-xs font-medium mb-1.5"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            Check‑in <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="date"
                            value={formData.checkInDate}
                            onChange={(e) =>
                              handleChange("checkInDate", e.target.value)
                            }
                            disabled={submitting}
                            className="w-full px-3 py-2 rounded text-sm disabled:opacity-50"
                            style={{
                              backgroundColor: "var(--card-bg)",
                              border: "1px solid var(--border-color)",
                              color: "var(--text-primary)",
                            }}
                          />
                          {errors.checkInDate && (
                            <p className="mt-1 text-xs flex items-center gap-1 text-red-400">
                              <AlertCircle className="w-3 h-3" />
                              {errors.checkInDate}
                            </p>
                          )}
                        </div>
                        <div>
                          <label
                            className="block text-xs font-medium mb-1.5"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            Check‑out <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="date"
                            value={formData.checkOutDate}
                            onChange={(e) =>
                              handleChange("checkOutDate", e.target.value)
                            }
                            disabled={submitting}
                            className="w-full px-3 py-2 rounded text-sm disabled:opacity-50"
                            style={{
                              backgroundColor: "var(--card-bg)",
                              border: "1px solid var(--border-color)",
                              color: "var(--text-primary)",
                            }}
                          />
                          {errors.checkOutDate && (
                            <p className="mt-1 text-xs flex items-center gap-1 text-red-400">
                              <AlertCircle className="w-3 h-3" />
                              {errors.checkOutDate}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span
                          className="text-xs"
                          style={{ color: "var(--text-tertiary)" }}
                        >
                          {nights} {nights === 1 ? "night" : "nights"}
                        </span>
                        {selectedRoom && (
                          <span
                            className="text-xs font-medium"
                            style={{ color: "var(--primary-color)" }}
                          >
                            ${selectedRoom.pricePerNight} / night
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Guests & Requests */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Users
                          className="w-4 h-4"
                          style={{ color: "var(--text-secondary)" }}
                        />
                        <h4
                          className="text-sm font-semibold"
                          style={{ color: "var(--text-primary)" }}
                        >
                          Guests & Requests
                        </h4>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label
                            className="block text-xs font-medium mb-1.5"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            Number of guests{" "}
                            <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="number"
                            min="1"
                            max={selectedRoom?.capacity || 10}
                            value={formData.numberOfGuests}
                            onChange={(e) =>
                              handleChange(
                                "numberOfGuests",
                                parseInt(e.target.value) || 1,
                              )
                            }
                            disabled={submitting}
                            className="w-full px-3 py-2 rounded text-sm disabled:opacity-50"
                            style={{
                              backgroundColor: "var(--card-bg)",
                              border: "1px solid var(--border-color)",
                              color: "var(--text-primary)",
                            }}
                          />
                          {errors.numberOfGuests && (
                            <p className="mt-1 text-xs flex items-center gap-1 text-red-400">
                              <AlertCircle className="w-3 h-3" />
                              {errors.numberOfGuests}
                            </p>
                          )}
                        </div>
                        <div>
                          <label
                            className="block text-xs font-medium mb-1.5"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            Special requests
                          </label>
                          <textarea
                            rows={3}
                            value={formData.specialRequests}
                            onChange={(e) =>
                              handleChange("specialRequests", e.target.value)
                            }
                            disabled={submitting}
                            className="w-full px-3 py-2 rounded text-sm resize-none disabled:opacity-50"
                            style={{
                              backgroundColor: "var(--card-bg)",
                              border: "1px solid var(--border-color)",
                              color: "var(--text-primary)",
                            }}
                            placeholder="Early check-in, extra bed, dietary restrictions..."
                          />
                          {errors.specialRequests && (
                            <p className="mt-1 text-xs flex items-center gap-1 text-red-400">
                              <AlertCircle className="w-3 h-3" />
                              {errors.specialRequests}
                            </p>
                          )}
                          <div className="mt-1 text-right">
                            <span
                              className={`text-xs px-2 py-0.5 rounded ${
                                formData.specialRequests.length > 500
                                  ? "bg-red-900/50 text-red-300"
                                  : "bg-gray-800 text-gray-400"
                              }`}
                            >
                              {formData.specialRequests.length}/500
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ----- RIGHT COLUMN ----- */}
                  <div className="space-y-6">
                    {/* Guest Information */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <User
                          className="w-4 h-4"
                          style={{ color: "var(--text-secondary)" }}
                        />
                        <h4
                          className="text-sm font-semibold"
                          style={{ color: "var(--text-primary)" }}
                        >
                          Guest Information
                        </h4>
                      </div>
                      <div className="space-y-4">
                        {/* Full Name */}
                        <div>
                          <label
                            className="block text-xs font-medium mb-1.5"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            Full name <span className="text-red-400">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={formData.guest.fullName}
                              onChange={(e) =>
                                handleGuestChange("fullName", e.target.value)
                              }
                              disabled={submitting}
                              className="w-full px-3 py-2 rounded text-sm pl-9 disabled:opacity-50"
                              style={{
                                backgroundColor: "var(--card-bg)",
                                border: "1px solid var(--border-color)",
                                color: "var(--text-primary)",
                              }}
                              placeholder="Juan Dela Cruz"
                            />
                            <User
                              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5"
                              style={{ color: "var(--text-tertiary)" }}
                            />
                          </div>
                          {errors["guest.fullName"] && (
                            <p className="mt-1 text-xs flex items-center gap-1 text-red-400">
                              <AlertCircle className="w-3 h-3" />
                              {errors["guest.fullName"]}
                            </p>
                          )}
                        </div>

                        {/* Email */}
                        <div>
                          <label
                            className="block text-xs font-medium mb-1.5"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            Email <span className="text-red-400">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type="email"
                              value={formData.guest.email}
                              onChange={(e) =>
                                handleGuestChange("email", e.target.value)
                              }
                              disabled={submitting}
                              className="w-full px-3 py-2 rounded text-sm pl-9 disabled:opacity-50"
                              style={{
                                backgroundColor: "var(--card-bg)",
                                border: "1px solid var(--border-color)",
                                color: "var(--text-primary)",
                              }}
                              placeholder="guest@example.com"
                            />
                            <Mail
                              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5"
                              style={{ color: "var(--text-tertiary)" }}
                            />
                          </div>
                          {errors["guest.email"] && (
                            <p className="mt-1 text-xs flex items-center gap-1 text-red-400">
                              <AlertCircle className="w-3 h-3" />
                              {errors["guest.email"]}
                            </p>
                          )}
                        </div>

                        {/* Phone */}
                        <div>
                          <label
                            className="block text-xs font-medium mb-1.5"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            Phone <span className="text-red-400">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type="tel"
                              value={formData.guest.phone}
                              onChange={(e) =>
                                handleGuestChange("phone", e.target.value)
                              }
                              disabled={submitting}
                              className="w-full px-3 py-2 rounded text-sm pl-9 disabled:opacity-50"
                              style={{
                                backgroundColor: "var(--card-bg)",
                                border: "1px solid var(--border-color)",
                                color: "var(--text-primary)",
                              }}
                              placeholder="+63 912 345 6789"
                            />
                            <Phone
                              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5"
                              style={{ color: "var(--text-tertiary)" }}
                            />
                          </div>
                          {errors["guest.phone"] && (
                            <p className="mt-1 text-xs flex items-center gap-1 text-red-400">
                              <AlertCircle className="w-3 h-3" />
                              {errors["guest.phone"]}
                            </p>
                          )}
                        </div>

                        {/* Address */}
                        <div>
                          <label
                            className="block text-xs font-medium mb-1.5"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            Address
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={formData.guest.address}
                              onChange={(e) =>
                                handleGuestChange("address", e.target.value)
                              }
                              disabled={submitting}
                              className="w-full px-3 py-2 rounded text-sm pl-9 disabled:opacity-50"
                              style={{
                                backgroundColor: "var(--card-bg)",
                                border: "1px solid var(--border-color)",
                                color: "var(--text-primary)",
                              }}
                              placeholder="Street, City, Province"
                            />
                            <MapPin
                              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5"
                              style={{ color: "var(--text-tertiary)" }}
                            />
                          </div>
                          {errors["guest.address"] && (
                            <p className="mt-1 text-xs flex items-center gap-1 text-red-400">
                              <AlertCircle className="w-3 h-3" />
                              {errors["guest.address"]}
                            </p>
                          )}
                        </div>

                        {/* ID / Passport */}
                        <div>
                          <label
                            className="block text-xs font-medium mb-1.5"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            ID / Passport number
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={formData.guest.idNumber}
                              onChange={(e) =>
                                handleGuestChange("idNumber", e.target.value)
                              }
                              disabled={submitting}
                              className="w-full px-3 py-2 rounded text-sm pl-9 disabled:opacity-50"
                              style={{
                                backgroundColor: "var(--card-bg)",
                                border: "1px solid var(--border-color)",
                                color: "var(--text-primary)",
                              }}
                              placeholder="Optional"
                            />
                            <Hash
                              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5"
                              style={{ color: "var(--text-tertiary)" }}
                            />
                          </div>
                          {errors["guest.idNumber"] && (
                            <p className="mt-1 text-xs flex items-center gap-1 text-red-400">
                              <AlertCircle className="w-3 h-3" />
                              {errors["guest.idNumber"]}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ---------- Total Preview ---------- */}
                {selectedRoom && nights > 0 && (
                  <div
                    className="mt-4 p-4 rounded-lg flex justify-between items-center"
                    style={{
                      backgroundColor: "rgba(212,175,55,0.05)",
                      border: "1px solid var(--border-color)",
                    }}
                  >
                    <div>
                      <span
                        className="text-sm font-medium"
                        style={{ color: "var(--text-primary)" }}
                      >
                        Total stay price
                      </span>
                      <p
                        className="text-xs"
                        style={{ color: "var(--text-tertiary)" }}
                      >
                        {nights} nights × ${selectedRoom.pricePerNight}/night
                      </p>
                    </div>
                    <span
                      className="text-lg font-bold"
                      style={{ color: "var(--primary-color)" }}
                    >
                      ${totalPrice.toFixed(2)}
                    </span>
                  </div>
                )}

                {/* Hidden submit for enter key */}
                <button type="submit" className="hidden" />
              </form>
            </>
          )}
        </div>

        {/* ---------- Footer ---------- */}
        <div
          className="p-4 border-t flex items-center justify-between"
          style={{
            borderColor: "var(--border-color)",
            backgroundColor: "var(--card-secondary-bg)",
          }}
        >
          <div
            className="flex items-center gap-2 text-xs"
            style={{ color: "var(--text-tertiary)" }}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>
              Fields marked <span className="text-red-400">*</span> are required
            </span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={async () => {
                if (
                  !(await dialogs.confirm({
                    title: `${mode === "add" ? "New" : "Edit"} Booking - Close Form`,
                    message:
                      mode === "add"
                        ? "Are you sure you want to close the form? Unsaved changes will be lost."
                        : "Are you sure you want to close the form?",
                  }))
                )
                  return;
                onClose();
              }}
              disabled={submitting}
              className="px-3 py-1.5 rounded text-sm font-medium transition-colors disabled:opacity-50"
              style={{
                backgroundColor: "transparent",
                border: "1px solid var(--border-color)",
                color: "var(--text-secondary)",
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="px-3 py-1.5 rounded text-sm font-medium flex items-center gap-1.5 disabled:opacity-50 transition-colors"
              style={{
                backgroundColor: "var(--primary-color)",
                color: "var(--secondary-color)",
              }}
            >
              {submitting ? (
                <>
                  <Loader className="w-3.5 h-3.5 animate-spin" />
                  {mode === "add" ? "Creating..." : "Updating..."}
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  {mode === "add" ? "Create Booking" : "Update Booking"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingFormDialog;

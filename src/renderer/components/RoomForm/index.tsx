// src/renderer/components/Room/Form/RoomFormDialog.tsx
import React, { useState, useEffect } from "react";
import {
  X,
  Save,
  DoorOpen,
  Hash,
  Users,
  DollarSign,
  CheckCircle,
  AlignLeft,
  Loader,
  AlertCircle,
  Hotel,
} from "lucide-react";

// API and types
import roomAPI, { type Room } from "../../api/room";
import { showError, showSuccess } from "../../utils/notification";
import { dialogs } from "../../utils/dialogs";

// ----------------------------------------------------------------------
// Props
// ----------------------------------------------------------------------
interface RoomFormDialogProps {
  id?: number; // required for edit mode
  mode: "add" | "edit";
  onClose: () => void;
  onSuccess: (room: Room) => void;
}

// ----------------------------------------------------------------------
// Form Data Structure (matches Omit<Room, "id" | "createdAt" | "bookings">)
// ----------------------------------------------------------------------
interface FormData {
  roomNumber: string;
  type:
    | "standard"
    | "single"
    | "double"
    | "twin"
    | "suite"
    | "deluxe"
    | "family"
    | "studio"
    | "executive";
  capacity: number;
  pricePerNight: number;
  isAvailable: boolean;
  amenities: string;
}

// ----------------------------------------------------------------------
// Component
// ----------------------------------------------------------------------
const RoomFormDialog: React.FC<RoomFormDialogProps> = ({
  id,
  mode,
  onClose,
  onSuccess,
}) => {
  // --------------------------------------------------------------------
  // State
  // --------------------------------------------------------------------
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [room, setRoom] = useState<Room | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initial form state
  const [formData, setFormData] = useState<FormData>({
    roomNumber: "",
    type: "single",
    capacity: 1,
    pricePerNight: 0,
    isAvailable: true,
    amenities: "",
  });

  // --------------------------------------------------------------------
  // 1. Fetch existing room (edit mode)
  // --------------------------------------------------------------------
  useEffect(() => {
    const fetchRoom = async () => {
      if (mode === "edit" && id) {
        try {
          setLoading(true);
          const response = await roomAPI.getById(id);
          if (response.status && response.data) {
            const roomData = response.data;
            setRoom(roomData);
            setFormData({
              roomNumber: roomData.roomNumber,
              type: roomData.type,
              capacity: roomData.capacity,
              pricePerNight: roomData.pricePerNight,
              isAvailable: roomData.isAvailable,
              amenities: roomData.amenities || "",
            });
          } else {
            showError("Room not found");
            onClose();
          }
        } catch (error) {
          console.error("Error fetching room:", error);
          showError("Failed to load room data");
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    fetchRoom();
  }, [id, mode, onClose]);

  // --------------------------------------------------------------------
  // 2. Handlers
  // --------------------------------------------------------------------
  const handleChange = (
    field: keyof Omit<FormData, "isAvailable">,
    value: string | number,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleCheckboxChange = (field: "isAvailable", checked: boolean) => {
    setFormData((prev) => ({ ...prev, [field]: checked }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleAmenitiesChange = (value: string) => {
    setFormData((prev) => ({ ...prev, amenities: value }));
    if (errors.amenities) setErrors((prev) => ({ ...prev, amenities: "" }));
  };

  // --------------------------------------------------------------------
  // 3. Validation
  // --------------------------------------------------------------------
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Room number
    if (!formData.roomNumber.trim()) {
      newErrors.roomNumber = "Room number is required";
    } else if (formData.roomNumber.length > 20) {
      newErrors.roomNumber = "Room number must be less than 20 characters";
    }

    // Type
    if (!formData.type.trim()) {
      newErrors.type = "Room type is required";
    } else if (formData.type.length > 50) {
      newErrors.type = "Room type must be less than 50 characters";
    }

    // Capacity
    if (!formData.capacity || formData.capacity < 1) {
      newErrors.capacity = "Capacity must be at least 1";
    } else if (formData.capacity > 20) {
      newErrors.capacity = "Capacity cannot exceed 20 guests";
    }

    // Price per night
    if (formData.pricePerNight <= 0) {
      newErrors.pricePerNight = "Price per night must be greater than 0";
    } else if (formData.pricePerNight > 10000) {
      newErrors.pricePerNight = "Price per night cannot exceed $10,000";
    }

    // Amenities (optional, but length check)
    if (formData.amenities && formData.amenities.length > 500) {
      newErrors.amenities = "Amenities must be less than 500 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --------------------------------------------------------------------
  // 4. Submit (Create or Update)
  // --------------------------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showError("Please fix the errors in the form");
      return;
    }

    const confirmTitle = mode === "add" ? "Create Room" : "Update Room";
    const confirmMsg =
      mode === "add"
        ? "Are you sure you want to create this room?"
        : "Are you sure you want to update this room?";

    if (!(await dialogs.confirm({ title: confirmTitle, message: confirmMsg })))
      return;

    try {
      setSubmitting(true);

      // Prepare data (omit fields that are auto-generated)
      const roomData = {
        roomNumber: formData.roomNumber.trim(),
        type: formData.type.trim() as
          | "standard"
          | "single"
          | "double"
          | "twin"
          | "suite"
          | "deluxe"
          | "family"
          | "studio"
          | "executive",
        capacity: formData.capacity,
        pricePerNight: formData.pricePerNight,
        isAvailable: formData.isAvailable,
        amenities: formData.amenities.trim() || null,
      };

      let response;

      if (mode === "add") {
        // CREATE
        response = await roomAPI.create({
          roomData,
          user: "system", // TODO: get from auth context
        });
      } else {
        // UPDATE
        response = await roomAPI.update({
          id: id!,
          updates: roomData,
          user: "system",
        });
      }

      if (response?.status) {
        showSuccess(
          mode === "add"
            ? "Room created successfully!"
            : "Room updated successfully!",
        );
        onSuccess(response.data!);
      } else {
        throw new Error(response?.message || "Failed to save room");
      }
    } catch (error: any) {
      console.error("Error submitting form:", error);
      showError(error.message || "Failed to save room");
    } finally {
      setSubmitting(false);
    }
  };

  // --------------------------------------------------------------------
  // 5. Render
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
                {mode === "add" ? "New Room" : "Edit Room"}
              </h3>
              <div
                className="text-xs flex items-center gap-2"
                style={{ color: "var(--text-secondary)" }}
              >
                {mode === "edit" && (
                  <>
                    <span>Room #{id}</span>
                    <span>•</span>
                  </>
                )}
                <span>
                  {mode === "add"
                    ? "Add a new room to the inventory"
                    : "Modify room details"}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={async () => {
              if (
                !(await dialogs.confirm({
                  title: `${mode === "add" ? "New" : "Edit"} Room - Close Form`,
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
              <p style={{ color: "var(--text-secondary)" }}>Loading room...</p>
            </div>
          ) : (
            <>
              {/* ---------- Summary Card (edit mode only) ---------- */}
              {mode === "edit" && room && (
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
                            backgroundColor: room.isAvailable
                              ? "rgba(74,222,128,0.2)"
                              : "rgba(255,76,76,0.2)",
                            color: room.isAvailable
                              ? "var(--status-available-room)"
                              : "var(--status-occupied)",
                          }}
                        >
                          {room.isAvailable ? "Available" : "Occupied"}
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
                          {room.roomNumber} • {room.type}
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
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <div
                          className="text-xs"
                          style={{ color: "var(--text-tertiary)" }}
                        >
                          Capacity
                        </div>
                        <div
                          className="text-sm font-medium"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {room.capacity}{" "}
                          {room.capacity === 1 ? "guest" : "guests"}
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
                        <DollarSign className="w-4 h-4" />
                      </div>
                      <div>
                        <div
                          className="text-xs"
                          style={{ color: "var(--text-tertiary)" }}
                        >
                          Price / night
                        </div>
                        <div
                          className="text-sm font-semibold"
                          style={{ color: "var(--primary-color)" }}
                        >
                          ${room.pricePerNight.toFixed(2)}
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
                    {/* Basic Information */}
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
                          Basic Information
                        </h4>
                      </div>

                      {/* Room Number */}
                      <div className="mb-3">
                        <label
                          className="block text-xs font-medium mb-1.5"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Room number <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={formData.roomNumber}
                            onChange={(e) =>
                              handleChange("roomNumber", e.target.value)
                            }
                            disabled={submitting}
                            className="w-full px-3 py-2 rounded text-sm pl-9 disabled:opacity-50"
                            style={{
                              backgroundColor: "var(--card-bg)",
                              border: "1px solid var(--border-color)",
                              color: "var(--text-primary)",
                            }}
                            placeholder="e.g. 101, 202A"
                          />
                          <Hash
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5"
                            style={{ color: "var(--text-tertiary)" }}
                          />
                        </div>
                        {errors.roomNumber && (
                          <p className="mt-1 text-xs flex items-center gap-1 text-red-400">
                            <AlertCircle className="w-3 h-3" />
                            {errors.roomNumber}
                          </p>
                        )}
                      </div>

                      {/* Room Type */}
                      <div className="mb-3">
                        <label
                          className="block text-xs font-medium mb-1.5"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Room type <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                          <select
                            value={formData.type}
                            onChange={(e) =>
                              handleChange("type", e.target.value)
                            }
                            disabled={submitting}
                            className="w-full px-3 py-2 rounded text-sm pl-9 disabled:opacity-50"
                            style={{
                              backgroundColor: "var(--card-bg)",
                              border: "1px solid var(--border-color)",
                              color: "var(--text-primary)",
                            }}
                          >
                            <option value="" disabled>
                              Select a room type
                            </option>
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
                          <Hotel
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5"
                            style={{ color: "var(--text-tertiary)" }}
                          />
                        </div>
                        {errors.type && (
                          <p className="mt-1 text-xs flex items-center gap-1 text-red-400">
                            <AlertCircle className="w-3 h-3" />
                            {errors.type}
                          </p>
                        )}
                      </div>

                      {/* Capacity */}
                      <div className="mb-3">
                        <label
                          className="block text-xs font-medium mb-1.5"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Capacity <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="1"
                            max="20"
                            value={formData.capacity}
                            onChange={(e) =>
                              handleChange(
                                "capacity",
                                parseInt(e.target.value) || 1,
                              )
                            }
                            disabled={submitting}
                            className="w-full px-3 py-2 rounded text-sm pl-9 disabled:opacity-50"
                            style={{
                              backgroundColor: "var(--card-bg)",
                              border: "1px solid var(--border-color)",
                              color: "var(--text-primary)",
                            }}
                          />
                          <Users
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5"
                            style={{ color: "var(--text-tertiary)" }}
                          />
                        </div>
                        {errors.capacity && (
                          <p className="mt-1 text-xs flex items-center gap-1 text-red-400">
                            <AlertCircle className="w-3 h-3" />
                            {errors.capacity}
                          </p>
                        )}
                      </div>

                      {/* Price per Night */}
                      <div>
                        <label
                          className="block text-xs font-medium mb-1.5"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Price per night ($){" "}
                          <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="1"
                            step="0.01"
                            value={formData.pricePerNight}
                            onChange={(e) =>
                              handleChange(
                                "pricePerNight",
                                parseFloat(e.target.value) || 0,
                              )
                            }
                            disabled={submitting}
                            className="w-full px-3 py-2 rounded text-sm pl-9 disabled:opacity-50"
                            style={{
                              backgroundColor: "var(--card-bg)",
                              border: "1px solid var(--border-color)",
                              color: "var(--text-primary)",
                            }}
                            placeholder="0.00"
                          />
                          <DollarSign
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5"
                            style={{ color: "var(--text-tertiary)" }}
                          />
                        </div>
                        {errors.pricePerNight && (
                          <p className="mt-1 text-xs flex items-center gap-1 text-red-400">
                            <AlertCircle className="w-3 h-3" />
                            {errors.pricePerNight}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ----- RIGHT COLUMN ----- */}
                  <div className="space-y-6">
                    {/* Status & Amenities */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle
                          className="w-4 h-4"
                          style={{ color: "var(--text-secondary)" }}
                        />
                        <h4
                          className="text-sm font-semibold"
                          style={{ color: "var(--text-primary)" }}
                        >
                          Status & Amenities
                        </h4>
                      </div>

                      {/* Availability */}
                      <div className="mb-4">
                        <label
                          className="flex items-center gap-2 cursor-pointer"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          <input
                            type="checkbox"
                            checked={formData.isAvailable}
                            onChange={(e) =>
                              handleCheckboxChange(
                                "isAvailable",
                                e.target.checked,
                              )
                            }
                            disabled={submitting}
                            className="w-4 h-4 rounded"
                            style={{
                              accentColor: "var(--primary-color)",
                            }}
                          />
                          <span className="text-sm">
                            Room is available for booking
                          </span>
                        </label>
                      </div>

                      {/* Amenities */}
                      <div>
                        <label
                          className="block text-xs font-medium mb-1.5"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Amenities
                        </label>
                        <div className="relative">
                          <textarea
                            rows={4}
                            value={formData.amenities}
                            onChange={(e) =>
                              handleAmenitiesChange(e.target.value)
                            }
                            disabled={submitting}
                            className="w-full px-3 py-2 rounded text-sm pl-9 resize-none disabled:opacity-50"
                            style={{
                              backgroundColor: "var(--card-bg)",
                              border: "1px solid var(--border-color)",
                              color: "var(--text-primary)",
                            }}
                            placeholder="WiFi, TV, Air conditioning, Mini-bar, etc."
                          />
                          <AlignLeft
                            className="absolute left-3 top-3 w-3.5 h-3.5"
                            style={{ color: "var(--text-tertiary)" }}
                          />
                        </div>
                        {errors.amenities && (
                          <p className="mt-1 text-xs flex items-center gap-1 text-red-400">
                            <AlertCircle className="w-3 h-3" />
                            {errors.amenities}
                          </p>
                        )}
                        <div className="mt-1 text-right">
                          <span
                            className={`text-xs px-2 py-0.5 rounded ${
                              formData.amenities.length > 500
                                ? "bg-red-900/50 text-red-300"
                                : "bg-gray-800 text-gray-400"
                            }`}
                          >
                            {formData.amenities.length}/500
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

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
                    title: `${mode === "add" ? "New" : "Edit"} Room - Close Form`,
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
                  {mode === "add" ? "Create Room" : "Update Room"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomFormDialog;

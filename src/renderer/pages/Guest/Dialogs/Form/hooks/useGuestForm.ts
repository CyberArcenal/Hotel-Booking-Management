// src/renderer/hooks/guest/useGuestForm.ts

import { useState, useEffect } from 'react';
import type { Guest } from '../../../../../api/guest';
import guestAPI from '../../../../../api/guest';
import { showError, showSuccess } from '../../../../../utils/notification';
import { dialogs } from '../../../../../utils/dialogs';

export interface GuestFormData {
  fullName: string;
  email: string;
  phone: string;
  nationality: string;
  address: string;
  idNumber: string;
}

interface UseGuestFormProps {
  id?: number;                     // required for edit mode
  mode: 'add' | 'edit';
  onSuccess: (guest: Guest) => void;
  onClose: () => void;
}

interface UseGuestFormReturn {
  formData: GuestFormData;
  setFormData: React.Dispatch<React.SetStateAction<GuestFormData>>;
  errors: Record<string, string>;
  loading: boolean;
  submitting: boolean;
  guest: Guest | null;
  handleChange: (field: keyof GuestFormData, value: string) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  validateForm: () => boolean;
  isDirty: boolean;
}

export const useGuestForm = ({
  id,
  mode,
  onSuccess,
  onClose,
}: UseGuestFormProps): UseGuestFormReturn => {
  const [guest, setGuest] = useState<Guest | null>(null);
  const [loading, setLoading] = useState(mode === 'edit');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);

  const [formData, setFormData] = useState<GuestFormData>({
    fullName: '',
    email: '',
    phone: '',
    nationality: '',
    address: '',
    idNumber: '',
  });

  // Load existing guest data in edit mode
  useEffect(() => {
    if (mode === 'edit' && id) {
      const fetchGuest = async () => {
        try {
          setLoading(true);
          const response = await guestAPI.getById(id, false);
          if (response.status && response.data) {
            const g = response.data;
            setGuest(g);
            setFormData({
              fullName: g.fullName || '',
              email: g.email || '',
              phone: g.phone || '',
              nationality: g.nationality || '',
              address: g.address || '',
              idNumber: g.idNumber || '',
            });
          } else {
            showError('Guest not found');
            onClose();
          }
        } catch (error: any) {
          showError(error.message || 'Failed to load guest');
          onClose();
        } finally {
          setLoading(false);
        }
      };
      fetchGuest();
    }
  }, [id, mode, onClose]);

  // Track dirty state
  useEffect(() => {
    if (mode === 'edit' && guest) {
      const initial = {
        fullName: guest.fullName || '',
        email: guest.email || '',
        phone: guest.phone || '',
        nationality: guest.nationality || '',
        address: guest.address || '',
        idNumber: guest.idNumber || '',
      };
      const changed = JSON.stringify(initial) !== JSON.stringify(formData);
      setIsDirty(changed);
    } else if (mode === 'add') {
      const hasValues = Object.values(formData).some(v => v.trim() !== '');
      setIsDirty(hasValues);
    }
  }, [formData, guest, mode]);

  // Field change handler
  const handleChange = (field: keyof GuestFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Validation rules
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Full name
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.length > 100) {
      newErrors.fullName = 'Name must be less than 100 characters';
    }

    // Email
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    } else if (formData.email.length > 100) {
      newErrors.email = 'Email must be less than 100 characters';
    }

    // Phone
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[\d\s\+\-\(\)]{7,20}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Invalid phone number format';
    }

    // Optional fields length checks
    if (formData.nationality && formData.nationality.length > 50) {
      newErrors.nationality = 'Nationality must be less than 50 characters';
    }
    if (formData.address && formData.address.length > 255) {
      newErrors.address = 'Address must be less than 255 characters';
    }
    if (formData.idNumber && formData.idNumber.length > 50) {
      newErrors.idNumber = 'ID number must be less than 50 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showError('Please fix the errors in the form');
      return;
    }

    // Confirm dialog
    const title = mode === 'add' ? 'Create Guest' : 'Update Guest';
    const message =
      mode === 'add'
        ? 'Are you sure you want to create this guest?'
        : 'Are you sure you want to update this guest?';

    if (!(await dialogs.confirm({ title, message }))) return;

    try {
      setSubmitting(true);

      // Prepare data (trim strings, convert empty to undefined)
      const guestData = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        ...(formData.nationality.trim() && { nationality: formData.nationality.trim() }),
        ...(formData.address.trim() && { address: formData.address.trim() }),
        ...(formData.idNumber.trim() && { idNumber: formData.idNumber.trim() }),
      };

      let response;
      if (mode === 'add') {
        response = await guestAPI.create(guestData, 'system'); // TODO: get user from auth
      } else {
        response = await guestAPI.update(id!, guestData, 'system');
      }

      if (response?.status) {
        showSuccess(
          mode === 'add'
            ? 'Guest created successfully!'
            : 'Guest updated successfully!'
        );
        onSuccess(response.data);
      } else {
        throw new Error(response?.message || 'Failed to save guest');
      }
    } catch (error: any) {
      console.error('Error submitting form:', error);
      showError(error.message || 'Failed to save guest');
    } finally {
      setSubmitting(false);
    }
  };

  return {
    formData,
    setFormData,
    errors,
    loading,
    submitting,
    guest,
    handleChange,
    handleSubmit,
    validateForm,
    isDirty,
  };
};
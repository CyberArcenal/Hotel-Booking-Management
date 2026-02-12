// src/renderer/components/Guest/Form/GuestFormDialog.tsx

import React from 'react';
import { X, Save, User, Loader, AlertCircle } from 'lucide-react';
import { useGuestForm } from './hooks/useGuestForm';
import { dialogs } from '../../../../utils/dialogs';
import { GuestFormSkeleton } from './components/GuestFormSkeleton';
import { GuestTypeBadge } from '../View/components/GuestTypeBadge';
import { PersonalInfoSection } from './components/PersonalInfoSection';
import { ContactInfoSection } from './components/ContactInfoSection';
import { IdentificationSection } from './components/IdentificationSection';

interface GuestFormDialogProps {
  id?: number; // required for edit mode
  mode: 'add' | 'edit';
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (guest: any) => void;
}

export const GuestFormDialog: React.FC<GuestFormDialogProps> = ({
  id,
  mode,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const {
    formData,
    errors,
    loading,
    submitting,
    guest,
    handleChange,
    handleSubmit,
    isDirty,
  } = useGuestForm({
    id,
    mode,
    onSuccess,
    onClose,
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div
        className="w-full max-w-2xl rounded-lg shadow-2xl border max-h-[90vh] overflow-hidden"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--border-color)',
        }}
      >
        {/* Header */}
        <div
          className="p-4 border-b flex items-center justify-between"
          style={{
            borderColor: 'var(--border-color)',
            backgroundColor: 'var(--card-secondary-bg)',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                backgroundColor: 'rgba(212,175,55,0.1)',
                color: 'var(--primary-color)',
              }}
            >
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3
                className="text-base font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                {mode === 'add' ? 'Add New Guest' : 'Edit Guest'}
              </h3>
              <div
                className="text-xs flex items-center gap-2"
                style={{ color: 'var(--text-secondary)' }}
              >
                {mode === 'edit' && guest && (
                  <>
                    <span>ID: #{guest.id}</span>
                    <span>•</span>
                  </>
                )}
                <span>
                  {mode === 'add'
                    ? 'Create a new guest profile'
                    : 'Update guest information'}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={async () => {
              if (isDirty) {
                const confirmed = await dialogs.confirm({
                  title: `${mode === 'add' ? 'New' : 'Edit'} Guest - Close Form`,
                  message:
                    mode === 'add'
                      ? 'Are you sure you want to close the form? Unsaved changes will be lost.'
                      : 'Are you sure you want to close the form?',
                });
                if (!confirmed) return;
              }
              onClose();
            }}
            className="w-7 h-7 rounded flex items-center justify-center transition-colors hover:bg-gray-700"
            style={{ color: 'var(--text-secondary)' }}
            disabled={submitting}
          >
            <X className="w-3 h-3" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-130px)] p-6">
          {loading && <GuestFormSkeleton />}

          {!loading && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Edit mode summary badge */}
              {mode === 'edit' && guest && (
                <div
                  className="p-3 rounded-lg flex items-center justify-between"
                  style={{
                    backgroundColor: 'rgba(212,175,55,0.05)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <span style={{ color: 'var(--text-secondary)' }}>
                    Member since {new Date(guest.createdAt).toLocaleDateString()}
                  </span>
                  <GuestTypeBadge totalBookings={0} /> {/* We'll fetch actual count later */}
                </div>
              )}

              <PersonalInfoSection
                formData={formData}
                errors={errors}
                onChange={handleChange}
                disabled={submitting}
              />

              <ContactInfoSection
                formData={formData}
                errors={errors}
                onChange={handleChange}
                disabled={submitting}
              />

              <IdentificationSection
                formData={formData}
                errors={errors}
                onChange={handleChange}
                disabled={submitting}
              />

              {/* Hidden submit for enter key */}
              <button type="submit" className="hidden" />
            </form>
          )}
        </div>

        {/* Footer */}
        <div
          className="p-4 border-t flex items-center justify-between"
          style={{
            borderColor: 'var(--border-color)',
            backgroundColor: 'var(--card-secondary-bg)',
          }}
        >
          <div
            className="flex items-center gap-2 text-xs"
            style={{ color: 'var(--text-tertiary)' }}
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
                if (isDirty) {
                  const confirmed = await dialogs.confirm({
                    title: `${mode === 'add' ? 'New' : 'Edit'} Guest - Close Form`,
                    message:
                      mode === 'add'
                        ? 'Are you sure you want to close the form? Unsaved changes will be lost.'
                        : 'Are you sure you want to close the form?',
                  });
                  if (!confirmed) return;
                }
                onClose();
              }}
              disabled={submitting}
              className="px-3 py-1.5 rounded text-sm font-medium transition-colors disabled:opacity-50"
              style={{
                backgroundColor: 'transparent',
                border: '1px solid var(--border-color)',
                color: 'var(--text-secondary)',
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
                backgroundColor: 'var(--primary-color)',
                color: 'var(--secondary-color)',
              }}
            >
              {submitting ? (
                <>
                  <Loader className="w-3.5 h-3.5 animate-spin" />
                  {mode === 'add' ? 'Creating...' : 'Updating...'}
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  {mode === 'add' ? 'Create Guest' : 'Update Guest'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

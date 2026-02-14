// src/renderer/components/Booking/Form/components/FormFooter.tsx
import React from 'react';
import { Save, Loader, AlertCircle } from 'lucide-react';
import { dialogs } from '../../../utils/dialogs';

interface Props {
  mode: 'add' | 'edit';
  submitting: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  disabled?: boolean; // new prop to disable submit button
}

const FormFooter: React.FC<Props> = ({ mode, submitting, onClose, onSubmit, disabled }) => {
  const handleClose = async () => {
    if (
      await dialogs.confirm({
        title: `${mode === 'add' ? 'New' : 'Edit'} Booking - Close Form`,
        message:
          mode === 'add'
            ? 'Are you sure you want to close the form? Unsaved changes will be lost.'
            : 'Are you sure you want to close the form?',
      })
    ) {
      onClose();
    }
  };

  return (
    <div
      className="p-4 border-t flex items-center justify-between"
      style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--card-secondary-bg)' }}
    >
      <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
        <AlertCircle className="w-3.5 h-3.5" />
        <span>
          Fields marked <span className="text-red-400">*</span> are required
        </span>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleClose}
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
          onClick={onSubmit}
          disabled={submitting || disabled}
          className="px-3 py-1.5 rounded text-sm font-medium flex items-center gap-1.5 disabled:opacity-50 transition-colors"
          style={{ backgroundColor: 'var(--primary-color)', color: 'var(--secondary-color)' }}
        >
          {submitting ? (
            <>
              <Loader className="w-3.5 h-3.5 animate-spin" />
              {mode === 'add' ? 'Creating...' : 'Updating...'}
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              {mode === 'add' ? 'Create Booking' : 'Update Booking'}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default FormFooter;
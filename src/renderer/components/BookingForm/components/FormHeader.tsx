import React from 'react';
import { X, Hotel } from 'lucide-react';
import { dialogs } from '../../../utils/dialogs';

interface Props {
  mode: 'add' | 'edit';
  id?: number;
  onClose: () => void;
  submitting: boolean;
}

const FormHeader: React.FC<Props> = ({ mode, id, onClose, submitting }) => {
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
      className="p-4 border-b flex items-center justify-between"
      style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--card-secondary-bg)' }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: 'var(--primary-color)', color: 'var(--secondary-color)' }}
        >
          <Hotel className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            {mode === 'add' ? 'New Booking' : 'Edit Booking'}
          </h3>
          <div className="text-xs flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
            {mode === 'edit' && id && (
              <>
                <span>Booking #{id}</span>
                <span>•</span>
              </>
            )}
            <span>
              {mode === 'add' ? 'Create a new reservation' : 'Modify reservation details'}
            </span>
          </div>
        </div>
      </div>
      <button
        onClick={handleClose}
        className="w-7 h-7 rounded flex items-center justify-center transition-colors hover:bg-gray-700"
        style={{ color: 'var(--text-secondary)' }}
        disabled={submitting}
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
};

export default FormHeader;
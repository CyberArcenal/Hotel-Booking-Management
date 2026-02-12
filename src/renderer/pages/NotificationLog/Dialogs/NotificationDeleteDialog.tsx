import React from 'react';
import { Trash2 } from 'lucide-react';

interface NotificationDeleteDialogProps {
  id: number;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export const NotificationDeleteDialog: React.FC<NotificationDeleteDialogProps> = ({
  id,
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  const handleConfirm = async () => {
    await onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)]/20 w-full max-w-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-full bg-red-500/20 text-red-400">
            <Trash2 className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">Delete Notification</h3>
        </div>
        <p className="text-[var(--text-secondary)] mb-6">
          This action cannot be undone. Are you sure you want to delete notification #{id}?
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[var(--card-secondary-bg)] hover:bg-[var(--card-hover-bg)] text-[var(--text-primary)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
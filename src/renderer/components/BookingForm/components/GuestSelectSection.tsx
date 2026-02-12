// src/renderer/components/Booking/Form/sections/GuestSelectSection.tsx
import React from 'react';
import { User, AlertCircle } from 'lucide-react';
import type { Guest } from '../../../api/booking';
import GuestSelect from '../../Selects/Guest';

interface Props {
  guestId: number | null;
  selectedGuest?: Guest | null;
  onChange: (guestId: number | null, guest?: Guest) => void;
  error?: string;
  disabled?: boolean;
}

const GuestSelectSection: React.FC<Props> = ({
  guestId,
  selectedGuest,
  onChange,
  error,
  disabled,
}) => {

  console.log('GuestSelectSection render', { guestId, selectedGuest, error, disabled });
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <User className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
        <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          Guest
        </h4>
      </div>
      <GuestSelect
        value={guestId}
        onChange={onChange}
        disabled={disabled}
        placeholder="Select an existing guest"
        allowCreate={false}        // hindi muna natin pinapayagan ang creation sa loob ng booking form
        autoFocus={false}
      />
      {error && (
        <p className="mt-1 text-xs flex items-center gap-1 text-red-400">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
      <p className="mt-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
        Only existing guests can be selected. To add a new guest, go to Guest Management.
      </p>
    </div>
  );
};

export default GuestSelectSection;
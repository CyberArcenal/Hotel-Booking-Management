// src/renderer/components/Booking/View/sections/GuestInfoCard.tsx

import React from 'react';
import { User, Mail, Phone, MapPin, Hash } from 'lucide-react';
import type { Guest } from '../../../../../api/booking';

interface Props {
  guest: Guest;
}

export const GuestInfoCard: React.FC<Props> = ({ guest }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <User className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
        <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          Guest Information
        </h4>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InfoItem icon={User} label="Full name" value={guest.fullName} />
        <InfoItem icon={Mail} label="Email" value={guest.email} />
        <InfoItem icon={Phone} label="Phone" value={guest.phone} />
        {guest.address && <InfoItem icon={MapPin} label="Address" value={guest.address} />}
        {guest.idNumber && <InfoItem icon={Hash} label="ID / Passport" value={guest.idNumber} />}
      </div>
    </div>
  );
};

const InfoItem: React.FC<{ icon: any; label: string; value: string }> = ({
  icon: Icon,
  label,
  value,
}) => (
  <div className="flex items-start gap-2">
    <Icon className="w-3.5 h-3.5 mt-0.5" style={{ color: 'var(--text-tertiary)' }} />
    <div className="flex-1">
      <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
        {label}
      </p>
      <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
        {value}
      </p>
    </div>
  </div>
);
// src/renderer/components/Room/badges/RoomStatusBadge.tsx
import React from 'react';
import { CheckCircle, Clock, Wrench } from 'lucide-react';

interface Props {
  status: 'available' | 'occupied' | 'maintenance';
  className?: string;
  showIcon?: boolean;
}

export const RoomStatusBadge: React.FC<Props> = ({
  status,
  className = '',
  showIcon = true,
}) => {
  const config = {
    available: {
      label: 'Available',
      icon: CheckCircle,
      bg: 'rgba(74,222,128,0.2)',
      color: 'var(--status-available-room)',
    },
    occupied: {
      label: 'Occupied',
      icon: Clock,
      bg: 'rgba(255,170,51,0.2)',
      color: 'var(--status-occupied)',
    },
    maintenance: {
      label: 'Maintenance',
      icon: Wrench,
      bg: 'rgba(255,76,76,0.2)',
      color: 'var(--status-maintenance)',
    },
  }[status];

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}
      style={{ backgroundColor: config.bg, color: config.color }}
    >
      {showIcon && <Icon className="w-3.5 h-3.5" />}
      {config.label}
    </span>
  );
};
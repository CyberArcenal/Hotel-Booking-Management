import React from 'react';
import { 
  CalendarCheck, 
  Users, 
  Home, 
  DollarSign, 
  TrendingUp,
  type LucideIcon 
} from 'lucide-react';
import { type ExportType } from '../hooks/useExport';

interface ExportTypeCardProps {
  type: ExportType;
  title: string;
  description: string;
  icon: LucideIcon;
  isSelected: boolean;
  onClick: () => void;
}

const ExportTypeCard: React.FC<ExportTypeCardProps> = ({
  type,
  title,
  description,
  icon: Icon,
  isSelected,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-start p-4 rounded-lg border transition-all duration-200
        ${isSelected 
          ? 'bg-[var(--primary-color)]/10 border-[var(--primary-color)] text-[var(--primary-color)]' 
          : 'bg-[var(--card-bg)] border-[var(--border-color)]/20 hover:border-[var(--border-color)]/40 text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
        }`}
    >
      <div className={`p-2 rounded-lg ${isSelected ? 'bg-[var(--primary-color)]/20' : 'bg-[var(--card-secondary-bg)]'} mb-3`}>
        <Icon className={`w-5 h-5 ${isSelected ? 'text-[var(--primary-color)]' : 'text-[var(--text-tertiary)]'}`} />
      </div>
      <h3 className={`text-sm font-medium mb-1 ${isSelected ? 'text-[var(--primary-color)]' : 'text-[var(--text-primary)]'}`}>
        {title}
      </h3>
      <p className="text-xs text-[var(--text-tertiary)] text-left">{description}</p>
    </button>
  );
};

export const exportTypes: Array<{
  type: ExportType;
  title: string;
  description: string;
  icon: LucideIcon;
}> = [
  {
    type: 'bookings',
    title: 'Bookings Export',
    description: 'Export all bookings with filters by date, status, guest, room.',
    icon: CalendarCheck,
  },
  {
    type: 'guests',
    title: 'Guests Export',
    description: 'Export guest list with contact details, booking history, and loyalty status.',
    icon: Users,
  },
  {
    type: 'rooms',
    title: 'Rooms Export',
    description: 'Export room inventory, rates, and performance metrics.',
    icon: Home,
  },
  {
    type: 'financial',
    title: 'Financial Report',
    description: 'Revenue, average booking value, daily breakdown, and room type performance.',
    icon: DollarSign,
  },
  {
    type: 'occupancy',
    title: 'Occupancy Report',
    description: 'Daily occupancy rates, room utilization, and trend analysis.',
    icon: TrendingUp,
  },
];

export default ExportTypeCard;
// src/pages/Audit/components/AuditSearch.tsx
import React from 'react';
import { Search } from 'lucide-react';

interface AuditSearchProps {
  value: string;
  onChange: (query: string) => void;
  placeholder?: string;
}

const AuditSearch: React.FC<AuditSearchProps> = ({
  value,
  onChange,
  placeholder = 'Search by entity, user, action...',
}) => {
  return (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2 rounded-lg
                   bg-[var(--card-secondary-bg)] border border-[var(--border-color)]/20
                   text-[var(--text-primary)] placeholder-[var(--text-tertiary)]
                   focus:outline-none focus:border-[var(--primary-color)]/50 focus:ring-1 focus:ring-[var(--primary-color)]/50
                   transition-all duration-200"
      />
    </div>
  );
};

export default AuditSearch;
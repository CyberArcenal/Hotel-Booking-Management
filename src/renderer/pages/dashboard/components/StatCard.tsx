// src/renderer/components/Dashboard/StatCard.tsx
import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface Props {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: number;
  prefix?: string;
  suffix?: string;
  color?: 'gold' | 'green' | 'blue' | 'purple';
}

export const StatCard: React.FC<Props> = ({
  title,
  value,
  icon: Icon,
  trend,
  prefix = '',
  suffix = '',
  color = 'gold',
}) => {
  const colorMap = {
    gold: { bg: 'rgba(212,175,55,0.1)', iconBg: 'linear-gradient(135deg, #d4af37, #b8860b)', border: '#d4af37' },
    green: { bg: 'rgba(74,222,128,0.1)', iconBg: 'linear-gradient(135deg, #4ade80, #22c55e)', border: '#4ade80' },
    blue: { bg: 'rgba(59,130,246,0.1)', iconBg: 'linear-gradient(135deg, #3b82f6, #2563eb)', border: '#3b82f6' },
    purple: { bg: 'rgba(168,85,247,0.1)', iconBg: 'linear-gradient(135deg, #a855f7, #9333ea)', border: '#a855f7' },
  };

  const theme = colorMap[color];
  const formattedValue = typeof value === 'number' && !isNaN(value)
    ? value.toLocaleString()
    : value;

  return (
    <div
      className="compact-card group relative p-4 rounded-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
      style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--border-color)',
      }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium mb-0.5" style={{ color: 'var(--text-secondary)' }}>
            {title}
          </p>
          <p className="text-lg font-bold windows-title" style={{ color: 'var(--text-primary)' }}>
            {prefix}{formattedValue}{suffix}
          </p>
          {trend !== undefined && (
            <div className="flex items-center mt-1 text-2xs">
              {trend >= 0 ? (
                <ArrowUpRight className="w-3 h-3 mr-0.5 text-green-500" />
              ) : (
                <ArrowDownRight className="w-3 h-3 mr-0.5 text-red-500" />
              )}
              <span style={{ color: trend >= 0 ? '#4ade80' : '#ff4c4c', fontSize: '0.7rem' }}>
                {Math.abs(trend)}%
              </span>
            </div>
          )}
        </div>
        <div
          className="p-2 rounded-lg shadow-md"
          style={{
            background: theme.iconBg,
            color: 'white',
            boxShadow: `0 4px 8px -2px ${theme.border}40`,
          }}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
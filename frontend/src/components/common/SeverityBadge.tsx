import React from 'react';
import { SeverityLevel } from '../../types';

interface SeverityBadgeProps {
  severity: SeverityLevel;
  size?: 'sm' | 'md' | 'lg';
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity, size = 'md' }) => {
  const styles = {
    CRITICAL: 'bg-rose-950/80 text-rose-400 border-rose-500/50 rose-glow',
    HIGH: 'bg-amber-950/80 text-amber-400 border-amber-500/50',
    MEDIUM: 'bg-yellow-950/80 text-yellow-400 border-yellow-500/50',
    LOW: 'bg-blue-950/80 text-blue-400 border-blue-500/50',
    INFO: 'bg-emerald-950/80 text-emerald-400 border-emerald-500/50',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-semibold',
    lg: 'px-3 py-1.5 text-sm font-bold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border ${styles[severity] || styles.INFO} ${sizes[size]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${severity === 'CRITICAL' ? 'bg-rose-500 animate-ping' : 'bg-current'}`} />
      {severity}
    </span>
  );
};

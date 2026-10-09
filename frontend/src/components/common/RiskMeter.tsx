import React from 'react';

interface RiskMeterProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const RiskMeter: React.FC<RiskMeterProps> = ({ score, size = 'md', showLabel = true }) => {
  const getGradient = (s: number) => {
    if (s >= 75) return 'from-rose-500 to-red-600';
    if (s >= 50) return 'from-amber-500 to-orange-500';
    if (s >= 25) return 'from-yellow-400 to-amber-500';
    return 'from-emerald-400 to-cyan-500';
  };

  const getHeight = () => {
    if (size === 'sm') return 'h-1.5';
    if (size === 'lg') return 'h-3';
    return 'h-2';
  };

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center text-xs mb-1">
          <span className="text-slate-400">Risk Score</span>
          <span className="font-mono font-bold text-slate-200">{score}/100</span>
        </div>
      )}
      <div className={`w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800 ${getHeight()}`}>
        <div
          className={`h-full bg-gradient-to-r ${getGradient(score)} transition-all duration-500 rounded-full`}
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>
    </div>
  );
};

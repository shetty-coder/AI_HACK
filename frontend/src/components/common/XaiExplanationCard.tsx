import React from 'react';
import { XaiReport } from '../../types';
import { Brain, AlertCircle, CheckCircle, ShieldAlert, Cpu } from 'lucide-react';
import { SeverityBadge } from './SeverityBadge';

interface XaiExplanationCardProps {
  report: XaiReport;
}

export const XaiExplanationCard: React.FC<XaiExplanationCardProps> = ({ report }) => {
  return (
    <div className="glass-panel rounded-xl p-6 border border-cyan-500/20 space-y-6">
      <div className="flex justify-between items-start border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-sm font-semibold tracking-wider uppercase mb-1">
            <Brain className="w-4 h-4 text-cyan-400 animate-pulse" />
            Explainable AI (XAI) Model Attribution
          </div>
          <h3 className="text-lg font-bold text-slate-100">{report.target}</h3>
        </div>
        <div className="flex items-center gap-3">
          <SeverityBadge severity={report.severity} size="lg" />
          <div className="text-right">
            <div className="text-2xl font-black font-mono text-slate-100">{report.risk_score}</div>
            <div className="text-[10px] text-slate-400 uppercase">Risk Index</div>
          </div>
        </div>
      </div>

      {/* Feature Contributions Grid */}
      {report.feature_contributions && report.feature_contributions.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            Key Model Feature Influences
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {report.feature_contributions.map((fc, idx) => (
              <div
                key={idx}
                className="bg-slate-900/80 border border-slate-800 rounded-lg p-3 flex justify-between items-start"
              >
                <div>
                  <div className="text-sm font-medium text-slate-200">{fc.feature}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{fc.detail}</div>
                </div>
                <span
                  className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                    fc.impact === 'HIGH_RISK'
                      ? 'bg-rose-950 text-rose-400 border border-rose-800'
                      : fc.impact === 'MEDIUM_RISK'
                      ? 'bg-amber-950 text-amber-400 border border-amber-800'
                      : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  }`}
                >
                  {fc.weight}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reasoning & Evidence Split */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        <div className="bg-slate-900/60 rounded-lg p-4 border border-slate-800">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5" />
            Observed Threat Evidence
          </h4>
          <ul className="space-y-2 text-xs text-slate-300">
            {report.evidence_summary.map((ev, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-amber-500 font-bold">•</span>
                <span>{ev}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-slate-900/60 rounded-lg p-4 border border-slate-800">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-2 flex items-center gap-1.5">
            <Brain className="w-3.5 h-3.5" />
            Detector Logic Reasoning
          </h4>
          <ul className="space-y-2 text-xs text-slate-300">
            {report.model_reasoning.map((r, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">•</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Verification Checklist */}
      <div className="bg-cyan-950/20 border border-cyan-500/30 rounded-lg p-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan-300 mb-2 flex items-center gap-1.5">
          <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
          Recommended SOC Analyst Verification Steps
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-300">
          {report.verification_checklist.map((step, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-slate-900/70 p-2 rounded border border-slate-800">
              <span className="w-4 h-4 rounded-full bg-cyan-950 text-cyan-400 flex items-center justify-center font-bold text-[10px]">
                {idx + 1}
              </span>
              <span>{step}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

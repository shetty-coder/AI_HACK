import React, { useState } from 'react';
import { Play, Check, ChevronRight, Sparkles, X, Trophy } from 'lucide-react';

interface GuidedDemoBarProps {
  onExecuteStep: (stepNumber: number) => void;
  activeStep: number;
}

export const GuidedDemoBar: React.FC<GuidedDemoBarProps> = ({ onExecuteStep, activeStep }) => {
  const [isMinimized, setIsMinimized] = useState(false);

  const steps = [
    { num: 1, label: 'Scan Phishing Link', desc: 'Test URL Structural & Typosquatting ML' },
    { num: 2, label: 'Classify Scam SMS', desc: 'OTP & Financial Intent NLP Classifier' },
    { num: 3, label: 'Run Network Anomaly ML', desc: 'Isolation Forest Traffic CSV Analysis' },
    { num: 4, label: 'Inspect XAI Feature Influence', desc: 'Explainable AI Model Attribution' },
    { num: 5, label: 'Explore Threat Topology', desc: 'Interactive React Flow Node Correlation' },
    { num: 6, label: 'Execute Containment', desc: 'Simulate Host Isolation & Watchlist Block' },
    { num: 7, label: 'Export PDF Audit Report', desc: 'Download Compliance Incident Brief' },
    { num: 8, label: 'Consult AI Copilot', desc: 'Plain-English Incident Explanation' },
    { num: 9, label: 'Verify Posture Gauge Update', desc: 'Check Real-Time SOC Command Dashboard' },
  ];

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-4 left-6 z-40 px-4 py-2.5 rounded-full bg-gradient-to-r from-purple-900 to-cyan-900 border border-cyan-500/50 text-cyan-300 font-mono text-xs font-bold shadow-2xl flex items-center gap-2 hover:scale-105 transition-all"
      >
        <Trophy className="w-4 h-4 text-amber-400" />
        <span>Open Guided Hackathon Demo Bar ({activeStep}/9)</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40 max-w-5xl w-[92%] glass-panel-glow rounded-2xl p-4 border border-cyan-500/40 shadow-2xl backdrop-blur-xl space-y-3">
      <div className="flex justify-between items-center border-b border-slate-800/80 pb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs border border-amber-500/40">
            <Trophy className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-black font-mono uppercase tracking-wider text-slate-100 flex items-center gap-2">
              Guided Hackathon Demo Experience
              <span className="px-2 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30 text-[9px]">
                STEP {activeStep} OF 9
              </span>
            </h3>
          </div>
        </div>

        <button
          onClick={() => setIsMinimized(true)}
          className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800"
          title="Minimize Demo Bar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Step Buttons */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {steps.map((s) => {
          const isDone = activeStep > s.num;
          const isCurrent = activeStep === s.num;
          return (
            <button
              key={s.num}
              onClick={() => onExecuteStep(s.num)}
              className={`px-3 py-2 rounded-xl text-left transition-all shrink-0 font-mono text-xs border ${
                isCurrent
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold shadow-lg shadow-cyan-500/20 scale-105'
                  : isDone
                  ? 'bg-slate-900/90 text-emerald-400 border-emerald-500/40'
                  : 'bg-slate-950/80 text-slate-400 hover:text-slate-200 border-slate-800'
              }`}
            >
              <div className="flex items-center gap-1.5 text-[10px] uppercase">
                {isDone ? <Check className="w-3 h-3 text-emerald-400" /> : <span className="font-mono">#{s.num}</span>}
                <span className="truncate max-w-[120px]">{s.label}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { fetchIncidents } from '../services/api';
import { Incident } from '../types';
import { CopilotWidget } from '../components/copilot/CopilotWidget';
import { Bot, Sparkles, HelpCircle } from 'lucide-react';

export const CopilotPage: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncId, setSelectedIncId] = useState<string>('');

  useEffect(() => {
    fetchIncidents().then((list) => {
      setIncidents(list);
    });
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider mb-1">
          <Bot className="w-4 h-4" />
          MODULE I — AI SECURITY COPILOT
        </div>
        <h2 className="text-2xl font-black text-slate-100">AI SOC Analyst Assistant</h2>
        <p className="text-xs text-slate-400 mt-1">
          Ask questions about active SQLite incidents, investigation playbooks, MITRE ATT&CK techniques, or model reasoning.
        </p>
      </div>

      {/* Incident Context Selector */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-400">Target Incident Context:</span>
          <select
            value={selectedIncId}
            onChange={(e) => setSelectedIncId(e.target.value)}
            className="bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-4 py-2 text-xs font-mono text-cyan-400 outline-none w-72"
          >
            <option value="">Global SOC Mode (All Incidents)</option>
            {incidents.map((inc) => (
              <option key={inc.id} value={inc.id}>
                {inc.id} — [{inc.severity}] {inc.title.slice(0, 30)}...
              </option>
            ))}
          </select>
        </div>

        <span className="text-xs text-slate-500 font-mono hidden md:inline">
          Offline Local Rule & Pattern Template AI Engine
        </span>
      </div>

      {/* Copilot Chat UI */}
      <CopilotWidget selectedIncidentId={selectedIncId || undefined} />
    </div>
  );
};

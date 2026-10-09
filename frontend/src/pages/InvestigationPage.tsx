import React, { useState, useEffect } from 'react';
import { fetchIncidents, fetchIncidentById, updateIncidentStatus } from '../services/api';
import { Incident } from '../types';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { RiskMeter } from '../components/common/RiskMeter';
import { XaiExplanationCard } from '../components/common/XaiExplanationCard';
import { Search, FileDown, Save, ShieldAlert, Notebook, ExternalLink } from 'lucide-react';

interface InvestigationPageProps {
  selectedIncidentId?: string | null;
  onNavigateToGraph?: () => void;
}

export const InvestigationPage: React.FC<InvestigationPageProps> = ({ selectedIncidentId, onNavigateToGraph }) => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [activeId, setActiveId] = useState<string>(selectedIncidentId || '');
  const [currentInc, setCurrentInc] = useState<Incident | null>(null);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<string>('NEW');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchIncidents().then((list) => {
      setIncidents(list);
      if (!activeId && list.length > 0) {
        setActiveId(list[0].id);
      }
    });
  }, []);

  useEffect(() => {
    if (selectedIncidentId) {
      setActiveId(selectedIncidentId);
    }
  }, [selectedIncidentId]);

  useEffect(() => {
    if (activeId) {
      setLoading(true);
      fetchIncidentById(activeId)
        .then((inc) => {
          setCurrentInc(inc);
          setNotes(inc.analyst_notes || '');
          setStatus(inc.status || 'NEW');
        })
        .finally(() => setLoading(false));
    }
  }, [activeId]);

  const handleSaveNotes = async () => {
    if (!activeId) return;
    await updateIncidentStatus(activeId, status, notes);
    if (currentInc) {
      setCurrentInc({ ...currentInc, status: status as any, analyst_notes: notes });
    }
    alert('Analyst notebook and status saved successfully!');
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider mb-1">
          <Search className="w-4 h-4" />
          MODULE E & F — THREAT INVESTIGATION WORKSPACE
        </div>
        <h2 className="text-2xl font-black text-slate-100">Incident Deep-Dive & XAI Inspection</h2>
        <p className="text-xs text-slate-400 mt-1">
          Inspect stored SQLite findings, feature attribution, model reasoning, and analyst audit notebook.
        </p>
      </div>

      {/* Incident Selector Dropdown */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-xs font-mono text-slate-400 shrink-0">Select Incident ID:</span>
          <select
            value={activeId}
            onChange={(e) => setActiveId(e.target.value)}
            className="bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-4 py-2 text-xs font-mono text-cyan-400 outline-none w-full sm:w-80"
          >
            {incidents.map((inc) => (
              <option key={inc.id} value={inc.id}>
                {inc.id} — [{inc.severity}] {inc.title.slice(0, 35)}...
              </option>
            ))}
          </select>
        </div>

        {activeId && (
          <div className="flex items-center gap-2">
            <a
              href={`/api/reports/${activeId}/pdf`}
              download
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold font-mono flex items-center gap-1.5 transition-colors"
            >
              <FileDown className="w-3.5 h-3.5 text-cyan-400" />
              <span>Download PDF Audit Report</span>
            </a>
            {onNavigateToGraph && (
              <button
                onClick={onNavigateToGraph}
                className="px-4 py-2 rounded-xl bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 text-xs font-bold font-mono flex items-center gap-1.5 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>View in Threat Graph</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Incident Details */}
      {currentInc ? (
        <div className="space-y-6">
          {/* Top Banner */}
          <div className="glass-panel-glow rounded-2xl p-6 border border-cyan-500/30 space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-sm font-bold font-mono text-cyan-400">{currentInc.id}</span>
                  <SeverityBadge severity={currentInc.severity} size="md" />
                  <span className="text-xs text-slate-400 font-mono">Confidence: {Math.round(currentInc.confidence * 100)}%</span>
                </div>
                <h3 className="text-xl font-bold text-slate-100">{currentInc.title}</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">Category: {currentInc.category}</p>
              </div>

              <div className="w-full md:w-56">
                <RiskMeter score={currentInc.risk_score} size="lg" />
              </div>
            </div>
          </div>

          {/* XAI Explanation Component */}
          {currentInc.xai_data && (
            <XaiExplanationCard
              report={{
                target: currentInc.target_identifier || currentInc.title,
                risk_score: currentInc.risk_score,
                severity: currentInc.severity,
                confidence_percentage: Math.round(currentInc.confidence * 100),
                feature_contributions: (currentInc.xai_data as any).feature_contributions || [],
                evidence_summary: currentInc.indicators || [],
                model_reasoning: currentInc.reasoning || [],
                missing_evidence: (currentInc.xai_data as any).missing_evidence || ["Endpoint process tree verification"],
                verification_checklist: currentInc.recommended_steps || [],
                mitre_attack: (currentInc.xai_data as any).mitre_attack || []
              }}
            />
          )}

          {/* Analyst Notebook & Workflow Status */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h4 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono flex items-center gap-2">
                <Notebook className="w-4 h-4 text-cyan-400" />
                SOC Analyst Investigation Notebook & Workflow Status
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="text-xs font-mono text-slate-400 block mb-2">Incident Lifecycle Status:</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-100 outline-none"
                >
                  <option value="NEW">NEW (Unassigned)</option>
                  <option value="INVESTIGATING">INVESTIGATING (Triage)</option>
                  <option value="CONTAINED">CONTAINED (Watchlist Active)</option>
                  <option value="RESOLVED">RESOLVED (Closed)</option>
                </select>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-mono text-slate-400 block">SOC Analyst Notes:</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Record investigation findings, threat actor motives, or containment verification details..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl p-3 text-xs text-slate-100 outline-none leading-relaxed"
                />
                <button
                  onClick={handleSaveNotes}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Notebook & Status</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-panel p-12 rounded-2xl text-center text-slate-400 font-mono">
          No incidents available in database. Please run a scan or click 'Seed Synthetic Demo Incidents' on the homepage.
        </div>
      )}
    </div>
  );
};

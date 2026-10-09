import React, { useState, useEffect } from 'react';
import { fetchIncidents, updateIncidentStatus, executeSimulatedAction, fetchWatchlist } from '../services/api';
import { Incident, WatchlistItem } from '../types';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { ShieldAlert, ShieldCheck, Zap, Lock, RefreshCw, CheckCircle } from 'lucide-react';

export const IncidentResponsePage: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [selectedIncId, setSelectedIncId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [simMessage, setSimMessage] = useState<string>('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [incList, wlList] = await Promise.all([fetchIncidents(), fetchWatchlist()]);
      setIncidents(incList);
      setWatchlist(wlList);
      if (!selectedIncId && incList.length > 0) {
        setSelectedIncId(incList[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeInc = incidents.find((i) => i.id === selectedIncId);

  const handleSimAction = async (actionType: string) => {
    if (!selectedIncId) return;
    setSimMessage('Executing simulated containment action...');
    try {
      const res = await executeSimulatedAction(selectedIncId, actionType);
      setSimMessage(`${res.status}: ${res.message}`);
      loadData();
    } catch (err: any) {
      setSimMessage(`Error: ${err.message}`);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedIncId) return;
    await updateIncidentStatus(selectedIncId, newStatus);
    loadData();
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider mb-1">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            MODULE G — AUTOMATED GUIDED INCIDENT RESPONSE
          </div>
          <h2 className="text-2xl font-black text-slate-100">Guided Containment & Simulated SOC Response Actions</h2>
          <p className="text-xs text-slate-400 mt-1">
            Execute safe simulated host isolations, session revocations, and application watchlist blocks with full audit trail.
          </p>
        </div>

        <button
          onClick={loadData}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-slate-700 text-xs font-mono font-bold flex items-center gap-2 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Incident Queue</span>
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Incident Queue List (1 col) */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold text-slate-100 uppercase font-mono tracking-wider">
            Incident Response Queue ({incidents.length})
          </h3>
          <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
            {incidents.map((inc) => (
              <div
                key={inc.id}
                onClick={() => setSelectedIncId(inc.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  selectedIncId === inc.id
                    ? 'bg-cyan-950/60 border-cyan-500/50 shadow-lg shadow-cyan-500/10'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-mono font-bold text-xs text-cyan-400">{inc.id}</span>
                  <SeverityBadge severity={inc.severity} size="sm" />
                </div>
                <div className="text-xs font-bold text-slate-100 truncate">{inc.title}</div>
                <div className="flex justify-between items-center mt-2 text-[10px] font-mono text-slate-400">
                  <span>Risk: {inc.risk_score}/100</span>
                  <span className="text-slate-300 font-bold">{inc.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Incident Action Center (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {activeInc ? (
            <>
              {/* Header Info */}
              <div className="glass-panel-glow rounded-2xl p-6 border border-cyan-500/30 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-cyan-400 font-bold">{activeInc.id}</span>
                      <SeverityBadge severity={activeInc.severity} size="md" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-100">{activeInc.title}</h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">Target: `{activeInc.target_identifier}`</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black font-mono text-slate-100">{activeInc.risk_score}</span>
                    <span className="text-[10px] text-slate-400 block uppercase">Risk Score</span>
                  </div>
                </div>

                {/* Workflow Status Switcher */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400">Update Lifecycle Status:</span>
                  <div className="flex gap-2">
                    {['NEW', 'INVESTIGATING', 'CONTAINED', 'RESOLVED'].map((st) => (
                      <button
                        key={st}
                        onClick={() => handleStatusChange(st)}
                        className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold transition-colors ${
                          activeInc.status === st
                            ? 'bg-cyan-500 text-slate-950 shadow-md'
                            : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {simMessage && (
                <div className="p-3.5 rounded-xl bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 font-mono text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>{simMessage}</span>
                </div>
              )}

              {/* Simulated Action Triggers Grid */}
              <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
                <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Zap className="w-4 h-4" />
                  Simulated SOC Containment Actions [SIMULATION GUARDRAILS ACTIVE]
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => handleSimAction('BLOCK_URL')}
                    className="p-4 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/40 text-left space-y-1 transition-all group"
                  >
                    <div className="text-xs font-bold text-slate-100 group-hover:text-cyan-300">
                      Block Target URL / Domain in Watchlist
                    </div>
                    <p className="text-[11px] text-slate-400">Adds item to application local blocklist database.</p>
                  </button>

                  <button
                    onClick={() => handleSimAction('BLOCK_SENDER')}
                    className="p-4 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/40 text-left space-y-1 transition-all group"
                  >
                    <div className="text-xs font-bold text-slate-100 group-hover:text-cyan-300">
                      Block Email Sender / Phone Handle
                    </div>
                    <p className="text-[11px] text-slate-400">Adds sender address to SOC spam filter watchlist.</p>
                  </button>

                  <button
                    onClick={() => handleSimAction('ISOLATE_HOST')}
                    className="p-4 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-rose-500/40 text-left space-y-1 transition-all group"
                  >
                    <div className="text-xs font-bold text-slate-100 group-hover:text-rose-300">
                      Simulate Host EDR Isolation
                    </div>
                    <p className="text-[11px] text-slate-400">Simulates severing endpoint network connection.</p>
                  </button>

                  <button
                    onClick={() => handleSimAction('REVOKE_SESSION')}
                    className="p-4 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-purple-500/40 text-left space-y-1 transition-all group"
                  >
                    <div className="text-xs font-bold text-slate-100 group-hover:text-purple-300">
                      Simulate Session OAuth Revocation
                    </div>
                    <p className="text-[11px] text-slate-400">Simulates revoking active user SSO tokens.</p>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="glass-panel p-12 rounded-2xl text-center text-slate-400 font-mono">
              Select an incident from the queue to view containment actions.
            </div>
          )}
        </div>
      </div>

      {/* Active Watchlist Viewer */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Active Application Watchlist Database ({watchlist.length} blocked items)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-900/80 text-slate-400 uppercase border-b border-slate-800">
              <tr>
                <th className="p-3">Item / Target</th>
                <th className="p-3">Type</th>
                <th className="p-3">Reason</th>
                <th className="p-3">Status</th>
                <th className="p-3">Added Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {watchlist.map((w) => (
                <tr key={w.id} className="hover:bg-slate-900/60">
                  <td className="p-3 font-bold text-rose-400">{w.item}</td>
                  <td className="p-3 text-slate-300">{w.item_type}</td>
                  <td className="p-3 text-slate-400 font-sans">{w.reason}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800 text-[10px] font-bold">
                      {w.status} [SIMULATION]
                    </span>
                  </td>
                  <td className="p-3 text-slate-500">{w.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

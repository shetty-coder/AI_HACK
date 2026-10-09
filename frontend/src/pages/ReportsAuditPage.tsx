import React, { useState, useEffect } from 'react';
import { fetchIncidents, fetchAuditLogs } from '../services/api';
import { Incident, AuditLog } from '../types';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { FileSpreadsheet, FileDown, Code, History, RefreshCw } from 'lucide-react';

export const ReportsAuditPage: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [incList, logsList] = await Promise.all([fetchIncidents(), fetchAuditLogs(100)]);
      setIncidents(incList);
      setAuditLogs(logsList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider mb-1">
            <FileSpreadsheet className="w-4 h-4" />
            MODULE J — INCIDENT REPORTING & AUDIT LOGS
          </div>
          <h2 className="text-2xl font-black text-slate-100">Audit Reports & Append-Only Log History</h2>
          <p className="text-xs text-slate-400 mt-1">
            Export PDF/JSON compliance audit reports and review system event trails.
          </p>
        </div>

        <button
          onClick={loadData}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-slate-700 text-xs font-mono font-bold flex items-center gap-2 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh History</span>
        </button>
      </div>

      {/* Reports Generation Table */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono flex items-center gap-2">
          <FileDown className="w-4 h-4 text-cyan-400" />
          Downloadable Incident Audit Reports ({incidents.length} incidents)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-900/80 text-slate-400 uppercase border-b border-slate-800">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Title / Target</th>
                <th className="p-3">Severity</th>
                <th className="p-3">Risk</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Export Format</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {incidents.map((inc) => (
                <tr key={inc.id} className="hover:bg-slate-900/60">
                  <td className="p-3 font-bold text-cyan-400">{inc.id}</td>
                  <td className="p-3 text-slate-200 font-sans max-w-[260px] truncate">{inc.title}</td>
                  <td className="p-3">
                    <SeverityBadge severity={inc.severity} size="sm" />
                  </td>
                  <td className="p-3 font-bold text-slate-200">{inc.risk_score}/100</td>
                  <td className="p-3 text-slate-400">{inc.status}</td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-2">
                      <a
                        href={`/api/reports/${inc.id}/pdf`}
                        download
                        className="px-2.5 py-1 rounded bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 text-[11px] font-bold flex items-center gap-1 transition-colors"
                      >
                        <FileDown className="w-3 h-3" />
                        <span>PDF</span>
                      </a>
                      <a
                        href={`/api/reports/${inc.id}/json`}
                        download
                        className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-bold flex items-center gap-1 transition-colors"
                      >
                        <Code className="w-3 h-3" />
                        <span>JSON</span>
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Append-Only Audit Trail Table */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono flex items-center gap-2">
          <History className="w-4 h-4 text-purple-400" />
          System & Analyst Append-Only Audit Log ({auditLogs.length} events)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-900/80 text-slate-400 uppercase border-b border-slate-800">
              <tr>
                <th className="p-3">Timestamp (UTC)</th>
                <th className="p-3">Action</th>
                <th className="p-3">Actor</th>
                <th className="p-3">Target</th>
                <th className="p-3">Severity</th>
                <th className="p-3">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-900/60">
                  <td className="p-3 text-slate-500">{log.timestamp}</td>
                  <td className="p-3 font-bold text-cyan-400">{log.action}</td>
                  <td className="p-3 text-slate-300">{log.actor}</td>
                  <td className="p-3 text-slate-400 max-w-[140px] truncate">{log.target}</td>
                  <td className="p-3">
                    <SeverityBadge severity={log.severity} size="sm" />
                  </td>
                  <td className="p-3 text-slate-300 font-sans">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

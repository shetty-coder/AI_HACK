import React, { useState } from 'react';
import { analyzeNetworkCsv } from '../services/api';
import { AnalysisResult } from '../types';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { RiskMeter } from '../components/common/RiskMeter';
import { XaiExplanationCard } from '../components/common/XaiExplanationCard';
import { Network, Upload, FileSpreadsheet, ShieldAlert, CheckCircle, ExternalLink, Download } from 'lucide-react';

interface NetworkLabPageProps {
  onNavigateToIncident: (id: string) => void;
}

export const NetworkLabPage: React.FC<NetworkLabPageProps> = ({ onNavigateToIncident }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');

  const handleRunAnalysis = async (useSample: boolean = false) => {
    setLoading(true);
    setError('');
    try {
      const res = await analyzeNetworkCsv(useSample ? undefined : file || undefined, useSample);
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze network CSV');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsvReport = () => {
    if (!result || !result.records) return;
    const jsonStr = JSON.stringify(result.records, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CyberShield_Network_Report_${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider mb-1">
          <Network className="w-4 h-4" />
          MODULE D — AI NETWORK INTRUSION DETECTION
        </div>
        <h2 className="text-2xl font-black text-slate-100">Network Anomaly & Intrusion Detection Lab</h2>
        <p className="text-xs text-slate-400 mt-1">
          Applies Scikit-learn Isolation Forest unsupervised ML to detect SYN floods, port sweeps, C2 beaconing, and data exfiltration flows.
        </p>
      </div>

      {/* CSV Upload & Sample Controls */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-900 file:text-cyan-400 hover:file:bg-slate-800"
            />
            <button
              onClick={() => handleRunAnalysis(false)}
              disabled={loading || !file}
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs disabled:opacity-50 transition-colors shrink-0"
            >
              {loading ? 'Processing...' : 'Upload & Analyze CSV'}
            </button>
          </div>

          <div className="flex items-center gap-2 border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-4 w-full md:w-auto">
            <span className="text-xs text-slate-400 font-mono">Or use bundled dataset:</span>
            <button
              onClick={() => handleRunAnalysis(true)}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 text-purple-300 border border-purple-500/40 font-mono font-bold text-xs transition-colors"
            >
              Load Sample Dataset (sample_network_traffic.csv)
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-mono">
          {error}
        </div>
      )}

      {/* Analysis Output */}
      {result && (
        <div className="space-y-6">
          {/* Top Summary Banner */}
          <div className="glass-panel-glow rounded-2xl p-6 border border-cyan-500/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <SeverityBadge severity={result.severity} size="lg" />
                <span className="text-xs font-mono text-slate-400">Total Flows: {result.total_records}</span>
                {result.incident_id && (
                  <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800 text-[10px] font-mono font-bold">
                    CREATED {result.incident_id}
                  </span>
                )}
              </div>
              <h3 className="text-xl font-bold text-slate-100">{result.threat_category}</h3>
              <p className="text-xs text-slate-400 font-mono">
                Flagged <span className="text-rose-400 font-bold">{result.anomalous_records} anomalous records</span> out of {result.total_records} total flows.
              </p>
            </div>

            <div className="w-full md:w-64 space-y-2 shrink-0">
              <RiskMeter score={result.risk_score} size="lg" />
              <div className="flex gap-2">
                {result.incident_id && (
                  <button
                    onClick={() => onNavigateToIncident(result.incident_id!)}
                    className="flex-1 py-2 rounded-lg bg-rose-900/60 hover:bg-rose-800 text-rose-200 border border-rose-700 text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Incident</span>
                  </button>
                )}
                <button
                  onClick={handleExportCsvReport}
                  className="flex-1 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold flex items-center justify-center gap-1 transition-colors font-mono"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Report</span>
                </button>
              </div>
            </div>
          </div>

          {/* Suspicious Endpoint Badges */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-xs font-mono text-slate-400 uppercase">Suspicious Source IPs ({result.suspicious_src_ips?.length || 0})</span>
              <div className="flex flex-wrap gap-1.5">
                {result.suspicious_src_ips?.map((ip, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 text-[11px] font-mono">
                    {ip}
                  </span>
                ))}
              </div>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-xs font-mono text-slate-400 uppercase">Suspicious Destination IPs ({result.suspicious_dst_ips?.length || 0})</span>
              <div className="flex flex-wrap gap-1.5">
                {result.suspicious_dst_ips?.map((ip, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 text-[11px] font-mono">
                    {ip}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Flagged Flow Table */}
          {result.records && (
            <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
              <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider font-mono">
                Flagged Flow Record Inspection Table ({result.records.length} records)
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/80 text-slate-400 font-mono border-b border-slate-800">
                    <tr>
                      <th className="p-3">Flow ID</th>
                      <th className="p-3">Source Endpoint</th>
                      <th className="p-3">Destination Endpoint</th>
                      <th className="p-3">Proto</th>
                      <th className="p-3">Bytes/s</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Score</th>
                      <th className="p-3">Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {result.records.map((rec, idx) => (
                      <tr key={idx} className={rec.is_anomaly ? 'bg-rose-950/20 hover:bg-rose-950/40' : 'hover:bg-slate-900/60'}>
                        <td className="p-3 font-bold text-cyan-400">{rec.flow_id}</td>
                        <td className="p-3 text-slate-200">{rec.source_ip}:{rec.source_port}</td>
                        <td className="p-3 text-slate-200">{rec.destination_ip}:{rec.destination_port}</td>
                        <td className="p-3 text-slate-400">{rec.protocol}</td>
                        <td className="p-3 text-slate-300">{rec.flow_bytes_s.toLocaleString()}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${rec.is_anomaly ? 'bg-rose-950 text-rose-400 border border-rose-800' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'}`}>
                            {rec.label}
                          </span>
                        </td>
                        <td className="p-3 font-bold text-slate-200">{rec.anomaly_score}/100</td>
                        <td className="p-3 text-slate-400 font-sans text-[11px]">{rec.flagged_reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* XAI Engine Card */}
          <XaiExplanationCard report={result.xai_report} />
        </div>
      )}
    </div>
  );
};

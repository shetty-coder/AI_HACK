import React, { useState } from 'react';
import { analyzeUrl } from '../services/api';
import { AnalysisResult } from '../types';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { RiskMeter } from '../components/common/RiskMeter';
import { XaiExplanationCard } from '../components/common/XaiExplanationCard';
import { Link as LinkIcon, Search, ShieldCheck, ShieldAlert, Cpu, ExternalLink } from 'lucide-react';

interface UrlLabPageProps {
  onNavigateToIncident: (id: string) => void;
}

export const UrlLabPage: React.FC<UrlLabPageProps> = ({ onNavigateToIncident }) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');

  const sampleUrls = [
    { label: 'PayPal Typosquatting Phish', url: 'http://paypaI-security-update.com.account-verify-login.tk/signin' },
    { label: 'Raw IP Host Phishing', url: 'http://192.168.1.105:8080/g00gle-account-verification/login.php' },
    { label: 'URL Shortener Redirection', url: 'https://bit.ly/3x89KqL?redirect=http%3A%2F%2Fmalicious-credential-harvester.xyz' },
    { label: 'Punycode Homograph', url: 'http://xn--80ak6aa92e.com/admin/login.html' },
    { label: 'Legitimate Linux Kernel Github', url: 'https://github.com/torvalds/linux' }
  ];

  const handleScan = async (targetUrl?: string) => {
    const u = targetUrl || url;
    if (!u.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await analyzeUrl(u);
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze URL');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider mb-1">
          <LinkIcon className="w-4 h-4" />
          MODULE B — ADVANCED PHISHING & URL INTELLIGENCE
        </div>
        <h2 className="text-2xl font-black text-slate-100">URL Feature & Structural Analysis Lab</h2>
        <p className="text-xs text-slate-400 mt-1">
          Performs structural decomposition, typosquatting fuzzy brand matching, Punycode IDN detection, and Random Forest ML risk calculation.
        </p>
      </div>

      {/* Input Box & Sample Presets */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleScan()}
            placeholder="Enter URL to analyze (e.g. http://paypaI-login-verify.tk)..."
            className="flex-1 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-4 py-3 text-xs text-slate-100 font-mono outline-none"
          />
          <button
            onClick={() => handleScan()}
            disabled={loading || !url.trim()}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-all shrink-0"
          >
            <Search className="w-4 h-4" />
            <span>{loading ? 'Analyzing URL...' : 'Scan URL Features'}</span>
          </button>
        </div>

        {/* Presets */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-slate-400 font-mono text-[11px]">1-Click Demo Scans:</span>
          {sampleUrls.map((s, i) => (
            <button
              key={i}
              onClick={() => {
                setUrl(s.url);
                handleScan(s.url);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-cyan-950 text-slate-300 hover:text-cyan-400 border border-slate-800 hover:border-cyan-500/40 text-[11px] font-mono transition-colors"
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-mono">
          {error}
        </div>
      )}

      {/* Analysis Results Display */}
      {result && (
        <div className="space-y-6">
          {/* Top Result Banner */}
          <div className="glass-panel-glow rounded-2xl p-6 border border-cyan-500/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <SeverityBadge severity={result.severity} size="lg" />
                <span className="text-xs font-mono text-slate-400">Confidence: {intPct(result.confidence)}%</span>
                {result.incident_id && (
                  <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800 text-[10px] font-mono font-bold">
                    CREATED {result.incident_id}
                  </span>
                )}
              </div>
              <h3 className="text-xl font-bold text-slate-100 font-mono break-all">{result.target}</h3>
              <p className="text-xs text-cyan-400 font-semibold">{result.threat_category}</p>
            </div>

            <div className="w-full md:w-64 space-y-2 shrink-0">
              <RiskMeter score={result.risk_score} size="lg" />
              {result.incident_id && (
                <button
                  onClick={() => onNavigateToIncident(result.incident_id!)}
                  className="w-full py-2 rounded-lg bg-rose-900/60 hover:bg-rose-800 text-rose-200 border border-rose-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Inspect Incident {result.incident_id}</span>
                </button>
              )}
            </div>
          </div>

          {/* Reputation Results Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">VirusTotal API Lookup</span>
                <span className="text-cyan-400">{result.reputation_vt?.status}</span>
              </div>
              <p className="text-xs text-slate-300">
                {result.reputation_vt?.message || `Verdict: ${result.reputation_vt?.verdict || 'Clean'} (${result.reputation_vt?.malicious_count || 0} malicious engines)`}
              </p>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Google Safe Browsing API</span>
                <span className="text-cyan-400">{result.reputation_gsb?.status}</span>
              </div>
              <p className="text-xs text-slate-300">
                {result.reputation_gsb?.message || (result.reputation_gsb?.is_malicious ? 'Flagged Malicious Target' : 'No Threat Matches Found')}
              </p>
            </div>
          </div>

          {/* XAI Explanation Card */}
          <XaiExplanationCard report={result.xai_report} />
        </div>
      )}
    </div>
  );
};

function intPct(val: number) {
  return Math.round((val || 0.85) * 100);
}

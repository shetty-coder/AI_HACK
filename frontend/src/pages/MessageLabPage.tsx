import React, { useState } from 'react';
import { analyzeMessage, analyzeEml } from '../services/api';
import { AnalysisResult } from '../types';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { RiskMeter } from '../components/common/RiskMeter';
import { XaiExplanationCard } from '../components/common/XaiExplanationCard';
import { MessageSquareCode, Upload, Search, FileText, ExternalLink, ShieldCheck, Mail } from 'lucide-react';

interface MessageLabPageProps {
  onNavigateToIncident: (id: string) => void;
}

export const MessageLabPage: React.FC<MessageLabPageProps> = ({ onNavigateToIncident }) => {
  const [activeSubTab, setActiveSubTab] = useState<'text' | 'eml'>('text');
  const [textInput, setTextInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');

  const sampleMessages = [
    { label: 'HDFC Banking OTP Theft', text: 'URGENT: Your HDFC bank account 49102XX has been temporarily locked due to suspicious activity. Click http://hdfc-bank-verify-login.tk/security to update your KYC immediately. Do not share your OTP 892014 with anyone.' },
    { label: 'Lottery & UPI Fraud', text: 'Congratulations! You won $500,000 in International Lottery. Send processing fee of $150 via UPI to claim-reward@okicici immediately.' },
    { label: 'Fake Job Offer', text: 'Amazon India work from home job offer earning Rs 50,000/month! Pay registration fee of Rs 999 at http://amazn-jobs-recruitment.top to start.' },
    { label: 'Legitimate Work Email', text: 'Hi Tharun, please find attached the security audit schedule for Q4. Review the timeline and let me know if you have questions.' }
  ];

  const handleScanText = async (customText?: string) => {
    const txt = customText || textInput;
    if (!txt.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await analyzeMessage(txt);
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze text');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      const res = await analyzeEml(file);
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Failed to parse .eml file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider mb-1">
          <MessageSquareCode className="w-4 h-4" />
          MODULE C — AI SCAM MESSAGE & EMAIL ANALYZER
        </div>
        <h2 className="text-2xl font-black text-slate-100">Scam Text & EML Header Analysis Lab</h2>
        <p className="text-xs text-slate-400 mt-1">
          Classifies OTP theft, banking impersonation, job scams, and parses RFC822 `.eml` headers with SPF/DKIM verification indicators.
        </p>
      </div>

      {/* Sub Tabs Toggle */}
      <div className="flex gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveSubTab('text')}
          className={`px-4 py-2 rounded-lg text-xs font-bold font-mono transition-colors ${
            activeSubTab === 'text'
              ? 'bg-cyan-950 text-cyan-400 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Raw SMS / Text Message Scan
        </button>
        <button
          onClick={() => setActiveSubTab('eml')}
          className={`px-4 py-2 rounded-lg text-xs font-bold font-mono transition-colors ${
            activeSubTab === 'eml'
              ? 'bg-cyan-950 text-cyan-400 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Upload .EML Email File
        </button>
      </div>

      {/* Input Area */}
      {activeSubTab === 'text' ? (
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <textarea
            rows={4}
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Paste suspicious text message, email body, or WhatsApp scam prompt..."
            className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl p-4 text-xs text-slate-100 font-sans outline-none leading-relaxed"
          />

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="text-slate-400 font-mono text-[11px]">Samples:</span>
              {sampleMessages.map((s, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setTextInput(s.text);
                    handleScanText(s.text);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-cyan-950 text-slate-300 hover:text-cyan-400 border border-slate-800 text-[11px] font-mono transition-colors"
                >
                  {s.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => handleScanText()}
              disabled={loading || !textInput.trim()}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-all shrink-0"
            >
              <Search className="w-4 h-4" />
              <span>{loading ? 'Analyzing...' : 'Analyze Message'}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl p-8 border border-slate-800 space-y-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 text-cyan-400 flex items-center justify-center mx-auto">
            <Mail className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">Upload RFC822 `.eml` Email File</h3>
            <p className="text-xs text-slate-400 mt-1">Parses sender, recipient, subject, reply-to, and SPF/DKIM authentication headers.</p>
          </div>

          <div className="flex justify-center items-center gap-3 max-w-md mx-auto">
            <input
              type="file"
              accept=".eml"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-900 file:text-cyan-400 hover:file:bg-slate-800"
            />
            <button
              onClick={handleFileUpload}
              disabled={loading || !file}
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs disabled:opacity-50 transition-colors"
            >
              {loading ? 'Parsing...' : 'Analyze EML'}
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-mono">
          {error}
        </div>
      )}

      {/* Analysis Output */}
      {result && (
        <div className="space-y-6">
          {/* Top Result Banner */}
          <div className="glass-panel-glow rounded-2xl p-6 border border-cyan-500/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <SeverityBadge severity={result.severity} size="lg" />
                <span className="text-xs font-mono text-slate-400">Confidence: {Math.round(result.confidence * 100)}%</span>
                {result.incident_id && (
                  <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800 text-[10px] font-mono font-bold">
                    CREATED {result.incident_id}
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold text-slate-100">{result.threat_category}</h3>
              <p className="text-xs text-slate-300 italic max-w-2xl">{result.target}</p>
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

          {/* EML Headers if parsed */}
          {result.headers && (
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3 font-mono text-xs">
              <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Email Header Authentication Audit</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div><span className="text-slate-500">From:</span> <span className="text-slate-200">{result.headers.from}</span></div>
                <div><span className="text-slate-500">Reply-To:</span> <span className="text-slate-200">{result.headers.reply_to || 'N/A'}</span></div>
                <div><span className="text-slate-500">Subject:</span> <span className="text-slate-200">{result.headers.subject}</span></div>
                <div><span className="text-slate-500">Auth Results:</span> <span className="text-cyan-300">{result.headers.auth_results || 'Standard SPF/DKIM'}</span></div>
              </div>
              {result.disclaimer && (
                <p className="text-[11px] text-slate-400 italic bg-slate-900/80 p-2.5 rounded border border-slate-800">
                  {result.disclaimer}
                </p>
              )}
            </div>
          )}

          {/* Extracted Entities */}
          {result.entities && (
            <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-3 text-xs">
              <h4 className="font-bold text-slate-200 uppercase tracking-wider font-mono">Extracted Target Indicators</h4>
              <div className="flex flex-wrap gap-2">
                {result.entities.urls.map((u, i) => (
                  <span key={i} className="px-2.5 py-1 rounded bg-rose-950 text-rose-300 border border-rose-800 font-mono text-[11px]">
                    URL: {u}
                  </span>
                ))}
                {result.entities.upis.map((u, i) => (
                  <span key={i} className="px-2.5 py-1 rounded bg-amber-950 text-amber-300 border border-amber-800 font-mono text-[11px]">
                    UPI: {u}
                  </span>
                ))}
                {result.entities.phones.map((p, i) => (
                  <span key={i} className="px-2.5 py-1 rounded bg-purple-950 text-purple-300 border border-purple-800 font-mono text-[11px]">
                    PHONE: {p}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* XAI Explanation */}
          <XaiExplanationCard report={result.xai_report} />
        </div>
      )}
    </div>
  );
};

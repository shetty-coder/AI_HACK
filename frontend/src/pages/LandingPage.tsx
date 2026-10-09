import React, { useState } from 'react';
import {
  Shield,
  Zap,
  Brain,
  Network,
  Lock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Cpu,
  Search,
  Activity,
  Award,
  Layers,
  Bot
} from 'lucide-react';
import { analyzeUrl } from '../services/api';
import { AnalysisResult } from '../types';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { RiskMeter } from '../components/common/RiskMeter';

interface LandingPageProps {
  onNavigate: (page: string) => void;
  onSeedDemo: () => void;
  onNavigateToIncident?: (id: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onSeedDemo, onNavigateToIncident }) => {
  const [heroUrl, setHeroUrl] = useState('');
  const [heroLoading, setHeroLoading] = useState(false);
  const [heroResult, setHeroResult] = useState<AnalysisResult | null>(null);

  const handleQuickHeroScan = async () => {
    if (!heroUrl.trim()) return;
    setHeroLoading(true);
    try {
      const res = await analyzeUrl(heroUrl);
      setHeroResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setHeroLoading(false);
    }
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Banner Section */}
      <div className="relative rounded-3xl overflow-hidden glass-panel-glow p-8 md:p-12 border border-cyan-500/30 shadow-2xl">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-transparent rounded-full blur-3xl -z-10" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Value Prop */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-cyan-950 to-purple-950 border border-cyan-500/40 text-cyan-300 text-xs font-mono">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>NEXT-GEN AUTONOMOUS CYBERSECURITY PLATFORM</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-100 leading-tight">
              Intelligent Threat Detection, Explainable AI & Automated Response
            </h1>

            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              CyberShield AI X unifies URL structural intelligence, NLP scam message classification, `.eml` header verification, and Isolation Forest network anomaly detection into one unified SOC command center.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={() => onNavigate('dashboard')}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/25 flex items-center gap-2 transition-all hover:scale-105"
              >
                <span>Launch SOC Command Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onSeedDemo}
                className="px-6 py-3.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 text-purple-300 border border-purple-500/40 font-mono text-xs font-bold flex items-center gap-2 transition-all"
              >
                <Zap className="w-4 h-4 text-purple-400" />
                <span>Seed Synthetic Demo Incidents</span>
              </button>
            </div>

            {/* Feature Badges */}
            <div className="pt-4 grid grid-cols-3 gap-3 border-t border-slate-800/80 font-mono text-xs text-slate-400">
              <div>
                <div className="font-bold text-slate-200">100% Offline</div>
                <div className="text-[10px]">Zero Key Dependency</div>
              </div>
              <div>
                <div className="font-bold text-cyan-400">Explainable AI</div>
                <div className="text-[10px]">XAI Feature Attribution</div>
              </div>
              <div>
                <div className="font-bold text-purple-400">12 Modules</div>
                <div className="text-[10px]">End-to-End SOC Suite</div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Quick Scan Widget */}
          <div className="lg:col-span-5 glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold font-mono text-slate-100 uppercase tracking-wider">
                  Live Scanner Preview
                </h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400">LOCAL AI MODEL ACTIVE</span>
            </div>

            <p className="text-xs text-slate-400">Test URL structural features & Random Forest risk score immediately:</p>

            <div className="space-y-2">
              <input
                type="text"
                value={heroUrl}
                onChange={(e) => setHeroUrl(e.target.value)}
                placeholder="Paste URL (e.g. http://paypaI-security.tk)..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-mono outline-none"
              />
              <button
                onClick={handleQuickHeroScan}
                disabled={heroLoading || !heroUrl.trim()}
                className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{heroLoading ? 'Deconstructing URL...' : 'Quick Feature Scan'}</span>
              </button>
            </div>

            {heroResult && (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center">
                  <SeverityBadge severity={heroResult.severity} size="sm" />
                  <span className="font-bold text-slate-200">Risk: {heroResult.risk_score}/100</span>
                </div>
                <div className="text-cyan-400 font-bold">{heroResult.threat_category}</div>
                <ul className="space-y-1 text-[11px] text-slate-400 font-sans">
                  {heroResult.evidence.slice(0, 2).map((ev, i) => (
                    <li key={i} className="truncate">• {ev}</li>
                  ))}
                </ul>
                {heroResult.incident_id && onNavigateToIncident && (
                  <button
                    onClick={() => onNavigateToIncident(heroResult.incident_id!)}
                    className="w-full py-1.5 rounded bg-rose-950 text-rose-300 border border-rose-800 text-[10px] font-bold text-center block mt-2"
                  >
                    Inspect Auto-Created Incident {heroResult.incident_id}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Startup Value Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-950 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
            <Brain className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-100">Multi-Modal Machine Learning</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Combines Random Forest structural URL feature analysis, TF-IDF SGD scam message classification, and Isolation Forest network anomaly scoring.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-950 text-purple-400 flex items-center justify-center border border-purple-500/30">
            <Network className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-100">Threat Correlation Network</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Interactive topology visualizer built on React Flow mapping Incidents, IPs, Senders, URLs, and MITRE ATT&CK techniques.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-100">Guided Containment & Audit</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Execute simulated watchlist blocks and host isolations with complete audit history and downloadable PDF SOC reports.
          </p>
        </div>
      </div>

      {/* Operational Modules Showcase Grid */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-100 font-mono">10 Core Operational Security Modules</h2>
          <span className="text-xs text-cyan-400 font-mono">Click to navigate</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[
            { title: 'Multi-Modal Analyzer', desc: 'Unified Workspace', page: 'url-lab', icon: Search },
            { title: 'Phishing URL Intelligence', desc: 'Typosquatting & IP Hosts', page: 'url-lab', icon: Cpu },
            { title: 'Scam Message & EML Lab', desc: 'OTP Theft & Header Audit', page: 'message-lab', icon: Brain },
            { title: 'Network Intrusion Detector', desc: 'Isolation Forest Anomaly ML', page: 'network-lab', icon: Activity },
            { title: 'Explainable AI Engine', desc: 'Feature Influence & Logic', page: 'investigation', icon: Sparkles },
            { title: 'Threat Correlation Graph', desc: 'Interactive React Flow Graph', page: 'threat-graph', icon: Network },
            { title: 'Guided Incident Response', desc: 'Simulated Watchlist Actions', page: 'incident-response', icon: Lock },
            { title: 'SOC Operations Dashboard', desc: 'Posture Score & Recharts', page: 'dashboard', icon: Layers },
            { title: 'AI Security Copilot', desc: 'Contextual SOC Assistant', page: 'copilot', icon: Bot },
            { title: 'Reports & Audit History', desc: 'PDF/JSON Export & Logs', page: 'reports-audit', icon: Award },
          ].map((mod, idx) => {
            const Icon = mod.icon;
            return (
              <div
                key={idx}
                onClick={() => onNavigate(mod.page)}
                className="glass-panel p-4 rounded-xl border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-all hover:-translate-y-0.5 group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-cyan-400">MODULE {idx + 1}</span>
                  <Icon className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                </div>
                <h4 className="text-sm font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">{mod.title}</h4>
                <p className="text-[11px] text-slate-400 mt-1">{mod.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

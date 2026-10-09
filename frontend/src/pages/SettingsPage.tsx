import React, { useState, useEffect } from 'react';
import { fetchSettings, saveSettings, seedDemoData } from '../services/api';
import { Settings, Key, Database, Save, Zap, CheckCircle2, Palette } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [vtKey, setVtKey] = useState('');
  const [gsbKey, setGsbKey] = useState('');
  const [aiKey, setAiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings().then((data) => {
      setVtKey(data.VIRUSTOTAL_API_KEY || '');
      setGsbKey(data.GOOGLE_SAFEBROWSING_API_KEY || '');
      setAiKey(data.OPENAI_API_KEY || '');
    });
  }, []);

  const handleSave = async () => {
    setLoading(true);
    setMessage('');
    try {
      await saveSettings({
        VIRUSTOTAL_API_KEY: vtKey,
        GOOGLE_SAFEBROWSING_API_KEY: gsbKey,
        OPENAI_API_KEY: aiKey,
      });
      setMessage('API configurations updated successfully!');
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await seedDemoData();
      setMessage(`Successfully seeded ${res.count} synthetic demo incidents!`);
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider mb-1">
          <Settings className="w-4 h-4" />
          MODULE L — SETTINGS & API CONFIGURATION
        </div>
        <h2 className="text-2xl font-black text-slate-100">Application Settings & Integration Keys</h2>
        <p className="text-xs text-slate-400 mt-1">
          Configure optional external reputation services, LLM keys, and local SQLite database state.
        </p>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 font-mono text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* External API Keys Form */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
        <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono flex items-center gap-2 border-b border-slate-800 pb-3">
          <Key className="w-4 h-4 text-cyan-400" />
          Optional External API Key Integrations
        </h3>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-mono text-slate-300 block mb-1">VirusTotal v3 API Key:</label>
            <input
              type="password"
              value={vtKey}
              onChange={(e) => setVtKey(e.target.value)}
              placeholder="Paste VirusTotal API key (Optional for external domain reputation)..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-xs text-slate-100 font-mono outline-none"
            />
            <p className="text-[11px] text-slate-500 mt-1">If unconfigured, system operates in 100% offline local ML detection mode.</p>
          </div>

          <div>
            <label className="text-xs font-mono text-slate-300 block mb-1">Google Safe Browsing v4 API Key:</label>
            <input
              type="password"
              value={gsbKey}
              onChange={(e) => setGsbKey(e.target.value)}
              placeholder="Paste Google Safe Browsing API key (Optional)..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-xs text-slate-100 font-mono outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-mono text-slate-300 block mb-1">OpenAI / Gemini LLM API Key:</label>
            <input
              type="password"
              value={aiKey}
              onChange={(e) => setAiKey(e.target.value)}
              placeholder="Paste Generative AI key for Copilot (Optional fallback to local rule assistant)..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-xs text-slate-100 font-mono outline-none"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save API Configurations</span>
          </button>
        </div>
      </div>

      {/* Database & Demo Seed Data */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono flex items-center gap-2 border-b border-slate-800 pb-3">
          <Palette className="w-4 h-4 text-cyan-400" />
          Cyber Accent Color Theme & Visual Direction
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
          <button
            onClick={() => {
              document.documentElement.style.setProperty('--primary-cyan', '#06B6D4');
              setMessage('Theme set to Cyber Cyan');
            }}
            className="p-4 rounded-xl bg-slate-950 hover:bg-slate-900 border border-cyan-500/40 text-left space-y-1 transition-all"
          >
            <div className="flex items-center gap-2 font-bold text-cyan-400">
              <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400" />
              Cyber Cyan (Default)
            </div>
            <p className="text-[11px] text-slate-400">Dark Navy SOC theme with glowing cyan highlights.</p>
          </button>

          <button
            onClick={() => {
              document.documentElement.style.setProperty('--primary-cyan', '#10B981');
              setMessage('Theme set to Matrix Emerald Green');
            }}
            className="p-4 rounded-xl bg-slate-950 hover:bg-slate-900 border border-emerald-500/40 text-left space-y-1 transition-all"
          >
            <div className="flex items-center gap-2 font-bold text-emerald-400">
              <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
              Matrix Emerald Green
            </div>
            <p className="text-[11px] text-slate-400">High-contrast tactical green hacker aesthetic.</p>
          </button>

          <button
            onClick={() => {
              document.documentElement.style.setProperty('--primary-cyan', '#8B5CF6');
              setMessage('Theme set to Plasma Purple');
            }}
            className="p-4 rounded-xl bg-slate-950 hover:bg-slate-900 border border-purple-500/40 text-left space-y-1 transition-all"
          >
            <div className="flex items-center gap-2 font-bold text-purple-400">
              <span className="w-3 h-3 rounded-full bg-purple-400 shadow-sm shadow-purple-400" />
              Deep Plasma Purple
            </div>
            <p className="text-[11px] text-slate-400">Futuristic purple cyber threat intelligence mode.</p>
          </button>
        </div>
      </div>

      {/* Database & Demo Seed Data */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono flex items-center gap-2 border-b border-slate-800 pb-3">
          <Database className="w-4 h-4 text-purple-400" />
          SQLite Database Management & Demo Seeding
        </h3>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2">
          <div>
            <div className="text-xs font-bold text-slate-200">Seed Synthetic Incident Dataset</div>
            <p className="text-xs text-slate-400 mt-0.5">Populates local SQLite `cybershield.db` with sample URL, scam message, and network incidents.</p>
          </div>

          <button
            onClick={handleSeed}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 text-purple-300 border border-purple-500/40 font-mono font-bold text-xs flex items-center gap-2 transition-colors shrink-0"
          >
            <Zap className="w-4 h-4 text-purple-400" />
            <span>Seed Synthetic Incidents</span>
          </button>
        </div>
      </div>
    </div>
  );
};

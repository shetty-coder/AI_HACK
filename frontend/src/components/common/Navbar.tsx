import React, { useState } from 'react';
import { Shield, Radio, RefreshCw, Zap, Search, UserCheck, ShieldAlert } from 'lucide-react';
import { Incident } from '../../types';

interface NavbarProps {
  onRefresh?: () => void;
  openIncidentsCount?: number;
  incidents?: Incident[];
  onSelectIncident?: (id: string) => void;
  currentRole: string;
  onRoleChange: (role: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onRefresh,
  openIncidentsCount = 0,
  incidents = [],
  onSelectIncident,
  currentRole,
  onRoleChange,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  const filteredIncidents = searchQuery.trim()
    ? incidents.filter(
        (i) =>
          i.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          i.target_identifier.toLowerCase().includes(searchQuery.toLowerCase()) ||
          i.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <header className="h-16 border-b border-slate-800/80 bg-[#0B0F19]/90 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between gap-4">
      {/* Brand Logo & Name */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-cyan-400/30">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-black text-lg tracking-tight bg-gradient-to-r from-slate-100 via-slate-200 to-cyan-400 bg-clip-text text-transparent">
              CYBERSHIELD AI X
            </h1>
            <span className="px-2 py-0.5 text-[9px] font-bold font-mono uppercase bg-cyan-950/80 text-cyan-400 border border-cyan-500/40 rounded-full">
              PRO SOC PLATFORM
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-mono">Autonomous Threat Intelligence & XAI Response</p>
        </div>
      </div>

      {/* Global Incident Search */}
      <div className="relative flex-1 max-w-md hidden md:block">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchResults(true);
            }}
            onFocus={() => setShowSearchResults(true)}
            placeholder="Global Search: Incident ID (INC-XXXX), IP, Domain, or Category..."
            className="w-full bg-slate-950/90 border border-slate-800 focus:border-cyan-500 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 font-mono outline-none transition-all placeholder:text-slate-600"
          />
        </div>

        {/* Search Results Dropdown */}
        {showSearchResults && filteredIncidents.length > 0 && (
          <div className="absolute top-11 left-0 right-0 glass-panel rounded-xl border border-cyan-500/30 shadow-2xl p-2 max-h-72 overflow-y-auto z-50 space-y-1">
            <div className="text-[10px] font-mono text-cyan-400 font-bold px-2 py-1 uppercase">
              Matching Stored Incidents ({filteredIncidents.length})
            </div>
            {filteredIncidents.map((inc) => (
              <div
                key={inc.id}
                onClick={() => {
                  if (onSelectIncident) onSelectIncident(inc.id);
                  setShowSearchResults(false);
                  setSearchQuery('');
                }}
                className="p-2.5 rounded-lg hover:bg-cyan-950/60 cursor-pointer flex items-center justify-between text-xs font-mono transition-colors"
              >
                <div>
                  <span className="font-bold text-cyan-400">{inc.id}</span> —{' '}
                  <span className="text-slate-200">{inc.title.slice(0, 30)}...</span>
                  <div className="text-[10px] text-slate-500">{inc.category}</div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] bg-slate-900 text-slate-300 font-bold">
                  {inc.severity}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Role Switcher & Live Status */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Role Selector */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
          <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-500">Role:</span>
          <select
            value={currentRole}
            onChange={(e) => onRoleChange(e.target.value)}
            className="bg-transparent text-slate-200 font-bold outline-none cursor-pointer"
          >
            <option value="Tier-1 Analyst" className="bg-slate-950 text-slate-200">Tier-1 SOC Analyst</option>
            <option value="Threat Hunter" className="bg-slate-950 text-slate-200">Tier-2 Threat Hunter</option>
            <option value="CISO Executive" className="bg-slate-950 text-slate-200">CISO Executive</option>
          </select>
        </div>

        {/* Live Status */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
          <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
          <span>OFFLINE LOCAL AI</span>
        </div>

        {openIncidentsCount > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-400 text-xs font-bold font-mono">
            <Zap className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
            <span>{openIncidentsCount} OPEN</span>
          </div>
        )}

        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 border border-slate-800 transition-colors"
            title="Refresh System Metrics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
};

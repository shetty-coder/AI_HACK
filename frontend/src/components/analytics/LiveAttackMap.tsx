import React, { useState, useEffect } from 'react';
import { Globe, ShieldAlert, Radio, Pause, Play, Filter } from 'lucide-react';
import { SeverityBadge } from '../common/SeverityBadge';
import { SeverityLevel } from '../../types';

interface AttackEvent {
  id: string;
  timestamp: string;
  sourceCountry: string;
  sourceIp: string;
  targetCity: string;
  targetIp: string;
  attackType: string;
  severity: SeverityLevel;
  protocol: string;
}

const SAMPLE_ATTACK_TYPES = [
  'SYN Flood DoS Sweep',
  'Spearphishing Credential Harvester',
  'Punycode IDN Homograph Probe',
  'C2 Beaconing Flow',
  'SQLi Injection Exploit',
  'Ransomware Exfiltration Stream',
  'OTP Brute Force Sweep'
];

const GLOBAL_NODES = [
  { name: 'Bucharest, RO', lat: 44.4, lng: 26.1, x: 550, y: 160 },
  { name: 'Moscow, RU', lat: 55.7, lng: 37.6, x: 610, y: 120 },
  { name: 'Beijing, CN', lat: 39.9, lng: 116.4, x: 790, y: 170 },
  { name: 'Sao Paulo, BR', lat: -23.5, lng: -46.6, x: 340, y: 340 },
  { name: 'New York, US', lat: 40.7, lng: -74.0, x: 260, y: 170 },
  { name: 'Frankfurt, DE', lat: 50.1, lng: 8.6, x: 500, y: 150 },
  { name: 'Singapore, SG', lat: 1.3, lng: 103.8, x: 760, y: 260 },
  { name: 'Tokyo, JP', lat: 35.6, lng: 139.6, x: 840, y: 180 },
];

export const LiveAttackMap: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [attackFeed, setAttackFeed] = useState<AttackEvent[]>([
    {
      id: 'ATK-101',
      timestamp: new Date().toLocaleTimeString(),
      sourceCountry: 'Bucharest, RO',
      sourceIp: '185.220.101.5',
      targetCity: 'New York, US (SOC HQ)',
      targetIp: '10.0.0.5',
      attackType: 'Spearphishing Credential Harvester',
      severity: 'CRITICAL',
      protocol: 'HTTPS'
    },
    {
      id: 'ATK-102',
      timestamp: new Date().toLocaleTimeString(),
      sourceCountry: 'Beijing, CN',
      sourceIp: '103.255.44.12',
      targetCity: 'Frankfurt, DE',
      targetIp: '172.16.0.1',
      attackType: 'SYN Flood DoS Sweep',
      severity: 'HIGH',
      protocol: 'TCP'
    }
  ]);
  const [activePulse, setActivePulse] = useState<{ srcX: number; srcY: number; dstX: number; dstY: number } | null>(null);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      const srcNode = GLOBAL_NODES[Math.floor(Math.random() * 4)];
      const dstNode = GLOBAL_NODES[4 + Math.floor(Math.random() * 4)];
      const severities: SeverityLevel[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
      const sev = severities[Math.floor(Math.random() * severities.length)];
      const atkType = SAMPLE_ATTACK_TYPES[Math.floor(Math.random() * SAMPLE_ATTACK_TYPES.length)];

      const newEvent: AttackEvent = {
        id: `ATK-${Math.floor(100 + Math.random() * 900)}`,
        timestamp: new Date().toLocaleTimeString(),
        sourceCountry: srcNode.name,
        sourceIp: `${Math.floor(Math.random() * 200)}.${Math.floor(Math.random() * 255)}.10.5`,
        targetCity: dstNode.name,
        targetIp: `10.0.${Math.floor(Math.random() * 5)}.${Math.floor(Math.random() * 255)}`,
        attackType: atkType,
        severity: sev,
        protocol: Math.random() > 0.5 ? 'TCP' : 'HTTPS'
      };

      setAttackFeed((prev) => [newEvent, ...prev.slice(0, 14)]);
      setActivePulse({ srcX: srcNode.x, srcY: srcNode.y, dstX: dstNode.x, dstY: dstNode.y });
    }, 2800);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const filteredFeed = filterSeverity === 'ALL'
    ? attackFeed
    : attackFeed.filter((a) => a.severity === filterSeverity);

  return (
    <div className="glass-panel rounded-2xl p-6 border border-cyan-500/30 space-y-6 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider mb-1">
            <Globe className="w-4 h-4 animate-spin text-cyan-400" />
            LIVE TELEMETRY STREAM
          </div>
          <h3 className="text-xl font-black text-slate-100">Global Cyber Attack Map & Telemetry Vector</h3>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
            <Filter className="w-3 h-3 text-slate-400" />
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="bg-transparent text-cyan-400 font-bold outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-950 text-slate-200">All Severities</option>
              <option value="CRITICAL" className="bg-slate-950 text-rose-400">Critical Only</option>
              <option value="HIGH" className="bg-slate-950 text-amber-400">High Only</option>
            </select>
          </div>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 transition-colors ${
              isPlaying
                ? 'bg-rose-950 text-rose-300 border-rose-800'
                : 'bg-emerald-950 text-emerald-300 border-emerald-800'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'Pause Feed' : 'Resume Feed'}</span>
          </button>
        </div>
      </div>

      {/* SVG Map Canvas */}
      <div className="relative w-full h-[320px] bg-[#070A11] rounded-xl border border-slate-800/80 overflow-hidden flex items-center justify-center">
        <svg viewBox="0 0 1000 450" className="w-full h-full opacity-90">
          {/* Subtle World Map Grid Outlines */}
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1E293B" strokeWidth="0.5" />
          </pattern>
          <rect width="1000" height="450" fill="url(#grid)" />

          {/* Continents Outline Path (Stylized) */}
          <path
            d="M 150 120 Q 250 80 320 150 T 260 280 T 180 200 Z M 450 110 Q 550 90 620 150 T 580 250 T 480 180 Z M 700 130 Q 820 100 880 200 T 780 320 T 720 220 Z"
            fill="none"
            stroke="#1E293B"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />

          {/* Draw Map Nodes */}
          {GLOBAL_NODES.map((node, i) => (
            <g key={i}>
              <circle cx={node.x} cy={node.y} r="4" fill={i < 4 ? '#F43F5E' : '#06B6D4'} />
              <circle cx={node.x} cy={node.y} r="8" fill={i < 4 ? '#F43F5E' : '#06B6D4'} opacity="0.3" className="animate-ping" />
              <text x={node.x + 8} y={node.y + 4} fill="#94A3B8" fontSize="10" fontFamily="monospace">
                {node.name}
              </text>
            </g>
          ))}

          {/* Active Attack Trajectory Curved Line */}
          {activePulse && (
            <g>
              <path
                d={`M ${activePulse.srcX} ${activePulse.srcY} Q ${(activePulse.srcX + activePulse.dstX) / 2} ${(activePulse.srcY + activePulse.dstY) / 2 - 60} ${activePulse.dstX} ${activePulse.dstY}`}
                fill="none"
                stroke="#F43F5E"
                strokeWidth="2"
                strokeDasharray="6 4"
                className="animate-pulse"
              />
              <circle cx={activePulse.dstX} cy={activePulse.dstY} r="12" fill="#F43F5E" opacity="0.4" className="animate-ping" />
            </g>
          )}
        </svg>
      </div>

      {/* Live Telemetry Log Feed Table */}
      <div className="space-y-2 font-mono text-xs">
        <div className="flex justify-between items-center text-slate-400 text-[11px] uppercase border-b border-slate-800 pb-2">
          <span>Real-Time Attack Vectors ({filteredFeed.length} events)</span>
          <span className="text-cyan-400 flex items-center gap-1">
            <Radio className="w-3 h-3 animate-ping" /> Streaming Live
          </span>
        </div>

        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {filteredFeed.map((evt) => (
            <div
              key={evt.id}
              className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 hover:bg-slate-900/80 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-slate-500 font-bold">{evt.timestamp}</span>
                <span className="text-rose-400 font-bold">{evt.sourceCountry}</span>
                <span className="text-slate-400">➔</span>
                <span className="text-cyan-400 font-bold">{evt.targetCity}</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-slate-200 font-sans font-medium text-[11px]">{evt.attackType}</span>
                <SeverityBadge severity={evt.severity} size="sm" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

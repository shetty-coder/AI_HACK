import React from 'react';
import { SOCStats } from '../types';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { RiskMeter } from '../components/common/RiskMeter';
import { LiveAttackMap } from '../components/analytics/LiveAttackMap';
import {
  ShieldCheck,
  AlertTriangle,
  Zap,
  Activity,
  ListFilter,
  Eye,
  ArrowUpRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';

interface DashboardPageProps {
  stats: SOCStats | null;
  onNavigateToIncident: (id: string) => void;
  onRefresh: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ stats, onNavigateToIncident, onRefresh }) => {
  if (!stats) {
    return (
      <div className="flex items-center justify-center h-96 text-cyan-400 font-mono animate-pulse">
        Loading CyberShield SOC Dashboard statistics...
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Posture Header Banner */}
      <div className="glass-panel-glow rounded-2xl p-6 border border-cyan-500/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-cyan-950 text-cyan-400 border border-cyan-500/50 flex items-center justify-center font-mono font-black text-2xl shadow-lg shadow-cyan-500/20">
            {stats.posture_score}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest font-mono text-cyan-400 font-bold">Overall Security Posture</span>
              <span className="px-2 py-0.5 text-[10px] rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
                {stats.posture_status}
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-100 mt-0.5">SOC Operations Command Center</h2>
          </div>
        </div>

        <button
          onClick={onRefresh}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-mono text-cyan-400 border border-slate-700 transition-colors"
        >
          REFRESH SOC METRICS
        </button>
      </div>

      {/* Counter Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-xl border border-slate-800">
          <div className="flex justify-between items-center text-slate-400 text-xs mb-2 font-mono">
            <span>TOTAL ANALYZED EVENTS</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-black font-mono text-slate-100">{stats.total_events}</div>
        </div>

        <div className="glass-panel p-5 rounded-xl border border-slate-800">
          <div className="flex justify-between items-center text-slate-400 text-xs mb-2 font-mono">
            <span>OPEN INCIDENTS</span>
            <Zap className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-black font-mono text-rose-400">{stats.open_incidents}</div>
        </div>

        <div className="glass-panel p-5 rounded-xl border border-slate-800">
          <div className="flex justify-between items-center text-slate-400 text-xs mb-2 font-mono">
            <span>CRITICAL & HIGH THREATS</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black font-mono text-amber-400">{stats.critical_count + stats.high_count}</div>
        </div>

        <div className="glass-panel p-5 rounded-xl border border-slate-800">
          <div className="flex justify-between items-center text-slate-400 text-xs mb-2 font-mono">
            <span>ACTIVE WATCHLIST ITEMS</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black font-mono text-emerald-400">{stats.watchlist_count}</div>
        </div>
      </div>

      {/* Live Cyber Attack Map & Telemetry Vector */}
      <LiveAttackMap />

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Chart (2 cols) */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
              Threat Analytics Volume Trends (24h)
            </h3>
            <span className="text-[11px] font-mono text-cyan-400">URL / Scam / Network</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.trend_data}>
                <defs>
                  <linearGradient id="colorUrls" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorNetwork" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#F43F5E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '8px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="urls" stroke="#06B6D4" fillOpacity={1} fill="url(#colorUrls)" name="URL Scans" />
                <Area type="monotone" dataKey="network_anomalies" stroke="#F43F5E" fillOpacity={1} fill="url(#colorNetwork)" name="Network Anomalies" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Distribution Pie Chart */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
              Severity Distribution
            </h3>
          </div>
          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.severity_distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {stats.severity_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
            {stats.severity_distribution.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-400">{item.name}:</span>
                <span className="font-bold text-slate-200">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Alerts Feed Table */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono flex items-center gap-2">
            <ListFilter className="w-4 h-4 text-cyan-400" />
            Recent Security Incidents Feed
          </h3>
          <span className="text-xs text-slate-400 font-mono">SQLite Real-Time Feed</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase font-mono border-b border-slate-800">
              <tr>
                <th className="p-3">Incident ID</th>
                <th className="p-3">Title / Target</th>
                <th className="p-3">Category</th>
                <th className="p-3">Severity</th>
                <th className="p-3">Risk</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {stats.recent_incidents.map((inc) => (
                <tr key={inc.id} className="hover:bg-slate-900/60 transition-colors">
                  <td className="p-3 font-bold text-cyan-400">{inc.id}</td>
                  <td className="p-3 max-w-[220px] truncate text-slate-200 font-sans font-medium">{inc.title}</td>
                  <td className="p-3 text-slate-400">{inc.category}</td>
                  <td className="p-3">
                    <SeverityBadge severity={inc.severity} size="sm" />
                  </td>
                  <td className="p-3">
                    <span className="font-bold text-slate-200">{inc.risk_score}/100</span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        inc.status === 'NEW'
                          ? 'bg-rose-950 text-rose-400 border border-rose-800'
                          : inc.status === 'INVESTIGATING'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : inc.status === 'CONTAINED'
                          ? 'bg-blue-950 text-blue-400 border border-blue-800'
                          : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      }`}
                    >
                      {inc.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => onNavigateToIncident(inc.id)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-cyan-950 text-slate-300 hover:text-cyan-400 border border-slate-700 transition-colors text-[11px] font-sans font-semibold inline-flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Inspect</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

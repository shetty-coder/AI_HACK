import React from 'react';
import {
  Home,
  LayoutDashboard,
  Link,
  MessageSquareCode,
  Network,
  Search,
  Network as GraphIcon,
  ShieldAlert,
  Bot,
  FileSpreadsheet,
  GraduationCap,
  Settings,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openIncidentsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, openIncidentsCount = 0 }) => {
  const navItems = [
    { id: 'landing', label: 'Home / Overview', icon: Home },
    { id: 'dashboard', label: 'SOC Dashboard', icon: LayoutDashboard },
    { id: 'url-lab', label: 'URL Intelligence Lab', icon: Link },
    { id: 'message-lab', label: 'Scam & Email Lab', icon: MessageSquareCode },
    { id: 'network-lab', label: 'Network Intrusion Lab', icon: Network },
    { id: 'investigation', label: 'Threat Workspace', icon: Search },
    { id: 'threat-graph', label: 'Threat Correlation Graph', icon: GraphIcon },
    {
      id: 'incident-response',
      label: 'Incident Response Center',
      icon: ShieldAlert,
      badge: openIncidentsCount > 0 ? openIncidentsCount : undefined,
    },
    { id: 'copilot', label: 'AI Security Copilot', icon: Bot },
    { id: 'reports-audit', label: 'Reports & Audit History', icon: FileSpreadsheet },
    { id: 'education', label: 'Cyber Education & MITRE', icon: GraduationCap },
    { id: 'settings', label: 'Settings & Config', icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-[#0B0F19]/95 flex flex-col justify-between py-4 shrink-0 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto">
      <div className="px-3 space-y-1">
        <div className="px-3 py-2 text-[10px] font-extrabold uppercase tracking-widest text-slate-500 font-mono">
          OPERATIONAL MODULES
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-950/80 to-slate-900 text-cyan-400 border border-cyan-500/40 cyan-glow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-950 text-rose-400 border border-rose-800 font-mono">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer info */}
      <div className="px-4 pt-4 border-t border-slate-800 text-[11px] text-slate-500 font-mono space-y-1">
        <div>CyberShield AI X v1.0.0</div>
        <div className="text-[10px] text-slate-600">Built for Advanced SOC Analysis</div>
      </div>
    </aside>
  );
};

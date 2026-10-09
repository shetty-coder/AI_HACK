import React, { useState, useEffect } from 'react';
import { fetchThreatGraph } from '../services/api';
import { ThreatGraphData } from '../types';
import { ThreatGraph } from '../components/graph/ThreatGraph';
import { Network, RefreshCw, Layers } from 'lucide-react';

export const CorrelationGraphPage: React.FC = () => {
  const [graphData, setGraphData] = useState<ThreatGraphData | null>(null);
  const [loading, setLoading] = useState(false);

  const loadGraph = async () => {
    setLoading(true);
    try {
      const data = await fetchThreatGraph();
      setGraphData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGraph();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider mb-1">
            <Network className="w-4 h-4" />
            MODULE F — THREAT CORRELATION GRAPH
          </div>
          <h2 className="text-2xl font-black text-slate-100">Interactive Threat Topology & ATT&CK Network</h2>
          <p className="text-xs text-slate-400 mt-1">
            Correlates stored SQLite Incidents, Target Entities (URLs/IPs/Senders), and MITRE ATT&CK techniques in real-time.
          </p>
        </div>

        <button
          onClick={loadGraph}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-slate-700 text-xs font-mono font-bold flex items-center gap-2 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Graph Data</span>
        </button>
      </div>

      {/* Graph Metrics Bar */}
      {graphData && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
          <div className="glass-panel p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">Total Graph Nodes:</span>
            <span className="font-bold text-cyan-400 text-sm">{graphData.nodes?.length || 0}</span>
          </div>
          <div className="glass-panel p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">Mapped Incidents:</span>
            <span className="font-bold text-rose-400 text-sm">{graphData.total_incidents_mapped || 0}</span>
          </div>
          <div className="glass-panel p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">Relationship Edges:</span>
            <span className="font-bold text-purple-400 text-sm">{graphData.edges?.length || 0}</span>
          </div>
        </div>
      )}

      {/* React Flow Visualizer */}
      {graphData ? (
        <ThreatGraph data={graphData} />
      ) : (
        <div className="flex items-center justify-center h-[500px] glass-panel rounded-2xl text-cyan-400 font-mono animate-pulse">
          Constructing Threat Correlation Topology...
        </div>
      )}
    </div>
  );
};

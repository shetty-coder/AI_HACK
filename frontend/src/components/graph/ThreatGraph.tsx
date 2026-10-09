import React, { useMemo, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  Node,
  Edge,
  Position,
  Handle,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ThreatGraphData, ThreatNode } from '../../types';
import { Shield, AlertTriangle, Globe, Terminal, X } from 'lucide-react';
import { SeverityBadge } from '../common/SeverityBadge';

interface ThreatGraphProps {
  data: ThreatGraphData;
  onSelectNode?: (node: ThreatNode) => void;
}

// Custom Cyber Node Types
const CustomCyberNode = ({ data }: { data: any }) => {
  const getIcon = () => {
    if (data.type === 'hub') return <Shield className="w-5 h-5 text-cyan-400" />;
    if (data.type === 'incident') return <AlertTriangle className="w-4 h-4 text-rose-400" />;
    if (data.type === 'entity') return <Globe className="w-4 h-4 text-amber-400" />;
    return <Terminal className="w-4 h-4 text-purple-400" />;
  };

  const getBorder = () => {
    if (data.type === 'hub') return 'border-cyan-500 shadow-cyan-500/20';
    if (data.severity === 'CRITICAL') return 'border-rose-500 shadow-rose-500/20';
    if (data.severity === 'HIGH') return 'border-amber-500 shadow-amber-500/20';
    return 'border-slate-700';
  };

  return (
    <div className={`px-4 py-2.5 rounded-xl bg-slate-900/90 border-2 ${getBorder()} shadow-lg cursor-pointer min-w-[160px]`}>
      <Handle type="target" position={Position.Top} className="!bg-cyan-500" />
      <div className="flex items-center gap-2">
        {getIcon()}
        <div>
          <div className="text-xs font-bold text-slate-100 truncate max-w-[140px]">{data.label}</div>
          <div className="text-[10px] text-slate-400 uppercase font-mono">{data.type}</div>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-cyan-500" />
    </div>
  );
};

const nodeTypes = { cyberNode: CustomCyberNode };

export const ThreatGraph: React.FC<ThreatGraphProps> = ({ data }) => {
  const [selectedNode, setSelectedNode] = useState<ThreatNode | null>(null);

  // Map backend graph structure to React Flow nodes and edges
  const { nodes, edges } = useMemo(() => {
    const rfNodes: Node[] = (data.nodes || []).map((node, i) => {
      // Circle layout positioning
      const angle = (i / Math.max(1, data.nodes.length)) * 2 * Math.PI;
      const radius = node.type === 'hub' ? 0 : node.type === 'incident' ? 220 : 380;
      const x = 500 + radius * Math.cos(angle);
      const y = 350 + radius * Math.sin(angle);

      return {
        id: node.id,
        type: 'cyberNode',
        position: { x, y },
        data: { ...node },
      };
    });

    const rfEdges: Edge[] = (data.edges || []).map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label,
      animated: true,
      style: { stroke: '#06B6D4', strokeWidth: 1.5 },
      labelStyle: { fill: '#94A3B8', fontSize: 10, fontFamily: 'monospace' },
      labelBgStyle: { fill: '#0F172A', fillOpacity: 0.8 },
    }));

    return { nodes: rfNodes, edges: rfEdges };
  }, [data]);

  return (
    <div className="relative w-full h-[650px] bg-[#090D16] rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={(_, node) => setSelectedNode(node.data as unknown as ThreatNode)}
        fitView
      >
        <Background color="#1E293B" gap={24} />
        <Controls className="!bg-slate-900 !border-slate-800 !text-slate-300" />
      </ReactFlow>

      {/* Selected Node Details Side Panel */}
      {selectedNode && (
        <div className="absolute top-4 right-4 w-96 glass-panel rounded-xl p-5 border border-cyan-500/30 shadow-2xl z-50">
          <div className="flex justify-between items-start border-b border-slate-800 pb-3 mb-3">
            <div>
              <span className="text-[10px] uppercase font-mono text-cyan-400 font-bold">{selectedNode.type} NODE</span>
              <h4 className="text-base font-bold text-slate-100">{selectedNode.label}</h4>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3 text-xs">
            {selectedNode.severity && (
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Severity:</span>
                <SeverityBadge severity={selectedNode.severity} />
              </div>
            )}
            {selectedNode.data?.risk_score !== undefined && (
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Risk Score:</span>
                <span className="font-mono font-bold text-slate-200">{selectedNode.data.risk_score}/100</span>
              </div>
            )}
            {selectedNode.data?.category && (
              <div>
                <span className="text-slate-400">Threat Category:</span>
                <p className="text-slate-200 font-semibold mt-0.5">{selectedNode.data.category}</p>
              </div>
            )}
            {selectedNode.data?.full_identifier && (
              <div>
                <span className="text-slate-400">Target Identifier:</span>
                <p className="font-mono bg-slate-950 p-2 rounded text-cyan-300 mt-1 break-all">
                  {selectedNode.data.full_identifier}
                </p>
              </div>
            )}
            {selectedNode.data?.tactic && (
              <div>
                <span className="text-slate-400">MITRE Tactic:</span>
                <p className="text-purple-400 font-mono mt-0.5">{selectedNode.data.tactic} ({selectedNode.data.technique_id})</p>
              </div>
            )}
            {selectedNode.data?.indicators && selectedNode.data.indicators.length > 0 && (
              <div>
                <span className="text-slate-400">Correlated Indicators:</span>
                <ul className="mt-1 space-y-1 text-slate-300">
                  {selectedNode.data.indicators.slice(0, 3).map((ind: string, idx: number) => (
                    <li key={idx} className="bg-slate-950 p-1.5 rounded text-[11px]">• {ind}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

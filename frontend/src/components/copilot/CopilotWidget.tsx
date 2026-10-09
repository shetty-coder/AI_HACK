import React, { useState } from 'react';
import { queryCopilot } from '../../services/api';
import { Bot, Send, Sparkles, User, AlertCircle } from 'lucide-react';

interface CopilotWidgetProps {
  selectedIncidentId?: string;
}

export const CopilotWidget: React.FC<CopilotWidgetProps> = ({ selectedIncidentId }) => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string; actions?: string[] }>>([
    {
      sender: 'bot',
      text: selectedIncidentId
        ? `Hello Analyst! I am bound to incident **${selectedIncidentId}**. Ask me to explain findings or recommend a containment playbook.`
        : 'Hello SOC Analyst! I am your AI Security Copilot. Ask me questions about active threats, MITRE mappings, or investigation steps.',
    },
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async (textToSend?: string) => {
    const q = textToSend || query;
    if (!q.trim() || loading) return;

    setMessages((prev) => [...prev, { sender: 'user', text: q }]);
    if (!textToSend) setQuery('');
    setLoading(true);

    try {
      const res = await queryCopilot(q, selectedIncidentId);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: res.response,
          actions: res.suggested_actions,
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: 'Sorry, failed to process query via backend Copilot API.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const sampleQuestions = [
    "Explain this incident in plain English",
    "Suggest immediate containment steps",
    "What MITRE ATT&CK techniques matched?",
    "How does Isolation Forest detect anomalies?"
  ];

  return (
    <div className="glass-panel rounded-xl border border-cyan-500/20 flex flex-col h-[550px] overflow-hidden shadow-2xl">
      {/* Copilot Header */}
      <div className="px-5 py-3.5 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-500/40 flex items-center justify-center">
            <Bot className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              AI Security Copilot
              <span className="px-2 py-0.2 text-[9px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-500/30 rounded">
                {selectedIncidentId ? `CTX: ${selectedIncidentId}` : 'GLOBAL SOC MODE'}
              </span>
            </h3>
            <p className="text-[10px] text-slate-400">SOC Investigation Assistant</p>
          </div>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.sender === 'bot' && (
              <div className="w-7 h-7 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-500/40 flex items-center justify-center shrink-0 mt-1">
                <Bot className="w-3.5 h-3.5" />
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-xl p-3 text-xs leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-cyan-600 text-white font-medium rounded-tr-none'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none whitespace-pre-wrap'
              }`}
            >
              {m.text}

              {m.actions && m.actions.length > 0 && (
                <div className="mt-3 pt-2 border-t border-slate-800 space-y-1">
                  <div className="text-[10px] uppercase text-cyan-400 font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Recommended Copilot Playbook:
                  </div>
                  {m.actions.map((act, aIdx) => (
                    <div key={aIdx} className="bg-slate-950 p-1.5 rounded text-[11px] text-slate-300">
                      • {act}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {m.sender === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 mt-1">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-xs text-cyan-400 font-mono italic">
            <Bot className="w-4 h-4 animate-spin" />
            Copilot analyzing incident context...
          </div>
        )}
      </div>

      {/* Sample Question Pills */}
      <div className="px-3 py-2 border-t border-slate-800/80 bg-slate-950/40 flex gap-2 overflow-x-auto">
        {sampleQuestions.map((sq, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(sq)}
            className="px-2.5 py-1 text-[10px] rounded-full bg-slate-900 hover:bg-cyan-950 text-slate-300 hover:text-cyan-400 border border-slate-800 hover:border-cyan-500/40 shrink-0 transition-colors"
          >
            {sq}
          </button>
        ))}
      </div>

      {/* Input box */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/90 flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask Copilot a question about findings or remediation..."
          className="flex-1 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none"
        />
        <button
          onClick={() => handleSend()}
          disabled={loading || !query.trim()}
          className="px-3 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-1 disabled:opacity-50 transition-colors"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

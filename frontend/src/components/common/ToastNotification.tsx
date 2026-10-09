import React from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'info' | 'error';
}

interface ToastNotificationProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto p-4 rounded-xl glass-panel border shadow-2xl transition-all duration-300 transform translate-y-0 flex items-start gap-3 ${
            t.type === 'success'
              ? 'border-emerald-500/40 bg-emerald-950/80 text-emerald-100 shadow-emerald-500/10'
              : t.type === 'warning'
              ? 'border-amber-500/40 bg-amber-950/80 text-amber-100 shadow-amber-500/10'
              : t.type === 'error'
              ? 'border-rose-500/40 bg-rose-950/80 text-rose-100 shadow-rose-500/10'
              : 'border-cyan-500/40 bg-slate-900/90 text-cyan-100 shadow-cyan-500/10'
          }`}
        >
          {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
          {t.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}
          {t.type === 'error' && <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
          {t.type === 'info' && <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />}

          <div className="flex-1 text-xs">
            <h4 className="font-bold font-mono uppercase tracking-wider">{t.title}</h4>
            <p className="mt-0.5 text-slate-300 font-sans leading-relaxed">{t.message}</p>
          </div>

          <button
            onClick={() => onDismiss(t.id)}
            className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

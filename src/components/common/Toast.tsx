import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toast } = useApp();

  if (!toast) return null;

  const bgStyles = {
    success: 'bg-slate-900/95 text-white border-emerald-500/50 shadow-emerald-950/20',
    error: 'bg-rose-950/95 text-white border-rose-500/50 shadow-rose-950/20',
    info: 'bg-indigo-950/95 text-white border-indigo-500/50 shadow-indigo-950/20',
  }[toast.type];

  const Icon = {
    success: CheckCircle2,
    error: AlertCircle,
    info: Info,
  }[toast.type];

  const iconColors = {
    success: 'text-emerald-400',
    error: 'text-rose-400',
    info: 'text-indigo-400',
  }[toast.type];

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce duration-300 max-w-sm">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl border backdrop-blur-md shadow-2xl ${bgStyles}`}
      >
        <Icon className={`w-5 h-5 flex-shrink-0 ${iconColors}`} />
        <p className="text-sm font-medium">{toast.message}</p>
      </div>
    </div>
  );
};

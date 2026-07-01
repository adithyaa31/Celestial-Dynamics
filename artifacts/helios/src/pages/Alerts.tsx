import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGetAlerts, useGetActiveAlerts } from '@workspace/api-client-react';
import { ShieldAlert, Bell, AlertTriangle, Info, CheckCircle } from 'lucide-react';

const SEVERITY_CONFIG = {
  critical: { color: '#EF4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.4)', icon: AlertTriangle, label: 'CRITICAL' },
  high: { color: '#FF8C00', bg: 'rgba(255,140,0,0.1)', border: 'rgba(255,140,0,0.4)', icon: AlertTriangle, label: 'HIGH' },
  warning: { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', icon: Bell, label: 'WARNING' },
  info: { color: '#38BDF8', bg: 'rgba(56,189,248,0.1)', border: 'rgba(56,189,248,0.2)', icon: Info, label: 'INFO' },
};

function AlertCard({ alert, index }: { alert: any; index: number }) {
  const cfg = SEVERITY_CONFIG[alert.severity as keyof typeof SEVERITY_CONFIG] ?? SEVERITY_CONFIG.info;
  const Icon = cfg.icon;
  const isActive = alert.isActive;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.05 }}
      className="rounded-xl p-4 border transition-all hover:-translate-y-0.5"
      style={{ background: cfg.bg, borderColor: isActive ? cfg.color : cfg.border, boxShadow: isActive ? `0 0 20px ${cfg.color}30` : 'none' }}
    >
      <div className="flex items-start gap-4">
        <div className="relative mt-0.5">
          {isActive && (
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ background: cfg.color }}
              animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
          <Icon className="w-5 h-5 relative z-10" style={{ color: cfg.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-data text-xs tracking-widest" style={{ color: cfg.color }}>{cfg.label}</span>
            {alert.flareClass && (
              <span className="font-heading text-xs px-2 py-0.5 rounded" style={{ background: `${cfg.color}20`, color: cfg.color }}>
                {alert.flareClass}-CLASS
              </span>
            )}
            {isActive && (
              <motion.span className="font-data text-xs text-green-400"
                animate={{ opacity: [1, 0, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                LIVE
              </motion.span>
            )}
          </div>
          <p className="font-data text-sm text-slate-200 mt-1">{alert.title}</p>
          <p className="font-data text-xs text-slate-500 mt-1 leading-relaxed">{alert.description}</p>
          <div className="flex items-center gap-4 mt-2">
            <span className="font-data text-xs text-slate-600">{new Date(alert.timestamp).toUTCString().slice(0, 25)} UTC</span>
            {alert.confidence && (
              <span className="font-data text-xs text-slate-500">Confidence: {(alert.confidence * 100).toFixed(0)}%</span>
            )}
            {alert.countdown !== null && alert.countdown !== undefined && (
              <span className="font-data text-xs" style={{ color: cfg.color }}>
                ETA: {alert.countdown}min
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isActive
            ? <span className="font-data text-xs text-green-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />ACTIVE</span>
            : <span className="font-data text-xs text-slate-600">RESOLVED</span>
          }
        </div>
      </div>
    </motion.div>
  );
}

export default function Alerts() {
  const { data: allAlerts } = useGetAlerts({ params: { limit: 20 }, query: { refetchInterval: 15000 } });
  const { data: activeAlerts } = useGetActiveAlerts({ query: { refetchInterval: 15000 } });

  const active = activeAlerts ?? [];
  const history = (allAlerts ?? []).filter((a) => !a.isActive);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <ShieldAlert className="text-primary w-6 h-6" />
        <h1 className="text-2xl font-heading text-primary neon-text-cyan tracking-widest">ALERT CENTER</h1>
        <div className="flex items-center gap-2 ml-2">
          {active.length > 0 && (
            <motion.span
              className="font-data text-xs px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/40"
              animate={{ boxShadow: ['0 0 0px rgba(239,68,68,0)', '0 0 20px rgba(239,68,68,0.5)', '0 0 0px rgba(239,68,68,0)'] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {active.length} ACTIVE
            </motion.span>
          )}
        </div>
      </motion.div>

      {/* Active Alerts */}
      {active.length > 0 && (
        <div className="space-y-3">
          <p className="font-data text-xs text-slate-500 tracking-widest">ACTIVE ALERTS</p>
          <AnimatePresence>
            {active.map((alert, i) => <AlertCard key={alert.id} alert={alert} index={i} />)}
          </AnimatePresence>
        </div>
      )}

      {active.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="glass-panel rounded-xl p-8 border border-green-500/20 text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <p className="font-heading text-lg text-green-400">ALL CLEAR</p>
          <p className="font-data text-sm text-slate-500 mt-2">No active alerts. Solar conditions nominal.</p>
        </motion.div>
      )}

      {/* Alert History */}
      <div className="space-y-3">
        <p className="font-data text-xs text-slate-500 tracking-widest">ALERT HISTORY</p>
        <div className="space-y-2">
          {history.map((alert, i) => <AlertCard key={alert.id} alert={alert} index={i} />)}
        </div>
        {history.length === 0 && (
          <p className="font-data text-xs text-slate-600 text-center py-8">No resolved alerts in history.</p>
        )}
      </div>
    </div>
  );
}

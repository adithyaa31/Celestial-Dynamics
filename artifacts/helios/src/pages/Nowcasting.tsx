import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGetNowcast, useGetSolarEvents, useGetLatestSolar } from '@workspace/api-client-react';
import { Radio, Zap, AlertTriangle, CheckCircle } from 'lucide-react';

function RadarScan() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let angle = 0;
    const size = 200;
    canvas.width = size; canvas.height = size;
    const cx = size / 2, cy = size / 2, r = size / 2 - 10;
    const frame = () => {
      ctx.clearRect(0, 0, size, size);
      ctx.strokeStyle = 'rgba(0,229,255,0.2)';
      ctx.lineWidth = 1;
      for (let i = 1; i <= 4; i++) {
        ctx.beginPath();
        ctx.arc(cx, cy, (r / 4) * i, 0, Math.PI * 2);
        ctx.stroke();
      }
      for (let i = 0; i < 8; i++) {
        const a = (Math.PI * 2 / 8) * i;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
        ctx.stroke();
      }
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      const sweep = ctx.createLinearGradient(0, 0, r, 0);
      sweep.addColorStop(0, 'rgba(0,229,255,0.5)');
      sweep.addColorStop(1, 'rgba(0,229,255,0)');
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, r, -0.4, 0);
      ctx.fillStyle = sweep;
      ctx.fill();
      ctx.restore();
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
      ctx.strokeStyle = 'rgba(0,229,255,0.9)';
      ctx.lineWidth = 2;
      ctx.stroke();
      angle += 0.03;
      requestAnimationFrame(frame);
    };
    const raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={canvasRef} className="w-48 h-48" />;
}

function ConfidenceMeter({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between font-data text-xs text-slate-400">
        <span>{label}</span>
        <span style={{ color }}>{(value * 100).toFixed(1)}%</span>
      </div>
      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${value * 100}%` }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

const CLASS_COLORS: Record<string, string> = {
  X: '#EF4444', M: '#FF8C00', C: '#F59E0B', B: '#22C55E', A: '#38BDF8'
};
const CLASS_DESC: Record<string, string> = {
  X: 'EXTREME — Major radio blackouts. High radiation storm risk.',
  M: 'SIGNIFICANT — Moderate radio blackouts. Minor radiation storms.',
  C: 'MINOR — Brief radio blackouts. Low impact on Earth.',
  B: 'BACKGROUND — Very low activity. Normal operations.',
  A: 'QUIET — Background radiation. No significant activity.',
};

export default function Nowcasting() {
  const { data: nowcast, isLoading } = useGetNowcast({ query: { refetchInterval: 15000, queryKey: ['/api/solar/nowcast'] } });
  const { data: events } = useGetSolarEvents({ limit: 8 });
  const { data: latest } = useGetLatestSolar({ query: { refetchInterval: 15000, queryKey: ['/api/solar/latest'] } });

  const cls = nowcast?.detectedClass ?? 'A';
  const clsColor = CLASS_COLORS[cls] ?? '#38BDF8';

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <Radio className="text-primary w-6 h-6" />
        <h1 className="text-2xl font-heading text-primary neon-text-cyan tracking-widest">AI NOWCASTING</h1>
        <span className="font-data text-xs text-slate-500 ml-2">REAL-TIME DETECTION</span>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Detection */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="glass-panel rounded-xl p-6 border"
          style={{ borderColor: `${clsColor}40`, boxShadow: `0 0 40px ${clsColor}15` }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="font-data text-xs text-slate-500 tracking-widest">DETECTED FLARE CLASS</p>
              <div className="flex items-baseline gap-3 mt-2">
                <motion.span
                  className="text-7xl font-heading"
                  style={{ color: clsColor, textShadow: `0 0 30px ${clsColor}` }}
                  animate={{ textShadow: [`0 0 20px ${clsColor}80`, `0 0 50px ${clsColor}`, `0 0 20px ${clsColor}80`] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {isLoading ? '—' : cls}
                </motion.span>
                {nowcast && <span className="text-3xl font-heading text-slate-400">{(nowcast.peakFlux * 1e7).toFixed(1)}</span>}
              </div>
            </div>
            <div className="relative">
              <RadarScan />
              {nowcast?.isActive && (
                <motion.div
                  className="absolute top-2 right-2 w-3 h-3 rounded-full"
                  style={{ background: clsColor }}
                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
            </div>
          </div>

          <div className="space-y-3">
            <ConfidenceMeter value={nowcast?.confidence ?? 0} label="DETECTION CONFIDENCE" color={clsColor} />
            <ConfidenceMeter value={nowcast?.currentEnergy ? Math.min(nowcast.currentEnergy / 1e-5, 1) : 0.3} label="ENERGY LEVEL" color="#009DFF" />
          </div>

          <div className="mt-4 p-3 rounded-lg bg-slate-900/50 border border-slate-700">
            <p className="font-data text-xs text-slate-400 leading-relaxed">
              {nowcast?.explanation ?? 'Awaiting telemetry...'}
            </p>
          </div>
        </motion.div>

        {/* Source & Risk */}
        <div className="space-y-4">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="glass-panel rounded-xl p-5 border border-primary/20">
            <p className="font-data text-xs text-slate-500 tracking-widest mb-3">SOURCE INSTRUMENTS</p>
            {['SoLEXS', 'HEL1OS', 'Combined Fusion'].map((src, i) => (
              <div key={src} className="flex items-center justify-between py-2 border-b border-slate-200 last:border-0">
                <span className="font-data text-sm text-slate-600">{src}</span>
                <div className="flex items-center gap-2">
                  <motion.div className="w-2 h-2 rounded-full bg-green-500"
                    animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5 + i * 0.3, repeat: Infinity }} />
                  <span className="font-data text-xs text-green-500">ACTIVE</span>
                </div>
              </div>
            ))}
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
            className="glass-panel rounded-xl p-5 border border-primary/20">
            <p className="font-data text-xs text-slate-500 tracking-widest mb-3">RISK ASSESSMENT</p>
            <div className="flex items-center gap-4">
              {nowcast?.riskLevel === 'CRITICAL' || nowcast?.riskLevel === 'HIGH' ? (
                <AlertTriangle className="w-10 h-10 text-red-500" />
              ) : (
                <CheckCircle className="w-10 h-10 text-green-500" />
              )}
              <div>
                <p className="font-heading text-xl" style={{ color: clsColor }}>{nowcast?.riskLevel ?? 'MINIMAL'}</p>
                <p className="font-data text-xs text-slate-500 mt-1">{CLASS_DESC[cls]}</p>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
            className="glass-panel rounded-xl p-5 border border-primary/20">
            <p className="font-data text-xs text-slate-500 tracking-widest mb-3">CURRENT FLUX READINGS</p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'SOFT X-RAY', value: latest?.softXray, unit: 'W/m²', color: '#00E5FF' },
                { label: 'HARD X-RAY', value: latest?.hardXray, unit: 'W/m²', color: '#009DFF' },
              ].map((item) => (
                <div key={item.label} className="text-center p-3 rounded-lg bg-slate-900/50">
                  <p className="font-data text-xs text-slate-500">{item.label}</p>
                  <p className="font-heading text-sm mt-1" style={{ color: item.color }}>
                    {item.value ? item.value.toExponential(2) : '—'}
                  </p>
                  <p className="font-data text-xs text-slate-600">{item.unit}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Recent Events */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="glass-panel rounded-xl p-6 border border-primary/20">
        <p className="font-data text-xs text-slate-500 tracking-widest mb-4">RECENT FLARE EVENTS</p>
        <div className="space-y-2">
          {(events ?? []).slice(0, 6).map((evt, i) => (
            <motion.div key={evt.id}
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + i * 0.05 }}
              className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-900/30 border border-slate-800/50 hover:border-primary/30 transition-all">
              <div className="flex items-center gap-3">
                <span className="font-heading text-sm w-8" style={{ color: CLASS_COLORS[evt.flareClass[0]] || '#38BDF8' }}>
                  {evt.flareClass}
                </span>
                <span className="font-data text-xs text-slate-400">{new Date(evt.timeTag).toUTCString().slice(0, 25)}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-data text-xs text-slate-500">{(evt.confidence * 100).toFixed(0)}% conf</span>
                <span className="font-data text-xs" style={{ color: evt.status === 'active' ? '#EF4444' : evt.status === 'ongoing' ? '#FF8C00' : '#22C55E' }}>
                  {evt.status.toUpperCase()}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

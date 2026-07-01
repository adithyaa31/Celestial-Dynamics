import React from 'react';
import { motion } from 'framer-motion';
import { Cpu } from 'lucide-react';
import { useGetModelPerformance, useGetFeatureImportance } from '@workspace/api-client-react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';

function MetricRing({ value, label, color, size = 80 }: { value: number; label: string; color: string; size?: number }) {
  const r = (size / 2) - 8;
  const circ = 2 * Math.PI * r;
  const dash = circ * value;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
          <motion.circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke={color} strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: circ - dash }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            style={{ filter: `drop-shadow(0 0 6px ${color})` }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-heading text-sm" style={{ color }}>{(value * 100).toFixed(0)}%</span>
        </div>
      </div>
      <span className="font-data text-xs text-slate-500 text-center tracking-wider">{label}</span>
    </div>
  );
}

export default function Performance() {
  const { data: model } = useGetModelPerformance();

  const radarData = model ? [
    { metric: 'Accuracy', value: model.accuracy * 100 },
    { metric: 'Precision', value: model.precision * 100 },
    { metric: 'Recall', value: model.recall * 100 },
    { metric: 'F1 Score', value: model.f1Score * 100 },
    { metric: 'AUC-ROC', value: model.auc * 100 },
  ] : [];

  const flareLabels = ['A', 'B', 'C', 'M', 'X'];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <Cpu className="text-primary w-6 h-6" />
        <h1 className="text-2xl font-heading text-primary neon-text-cyan tracking-widest">MODEL PERFORMANCE</h1>
      </motion.div>

      {/* Key Metrics Rings */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="glass-panel rounded-xl p-6 border border-primary/20">
        <p className="font-data text-xs text-slate-500 tracking-widest mb-6">PERFORMANCE METRICS</p>
        <div className="flex flex-wrap justify-around gap-8">
          {model && <>
            <MetricRing value={model.accuracy} label="ACCURACY" color="#00E5FF" size={100} />
            <MetricRing value={model.precision} label="PRECISION" color="#009DFF" size={100} />
            <MetricRing value={model.recall} label="RECALL" color="#6D28D9" size={100} />
            <MetricRing value={model.f1Score} label="F1 SCORE" color="#38BDF8" size={100} />
            <MetricRing value={model.auc} label="AUC-ROC" color="#22C55E" size={100} />
            <MetricRing value={1 - model.falseAlarmRate} label="FAR SCORE" color="#FF8C00" size={100} />
          </>}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
          className="glass-panel rounded-xl p-5 border border-primary/20">
          <p className="font-data text-xs text-slate-500 tracking-widest mb-4">PERFORMANCE RADAR</p>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(0,229,255,0.1)" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'Space Grotesk' }} />
              <Radar name="HELIOS" dataKey="value" stroke="#00E5FF" fill="#00E5FF" fillOpacity={0.15} strokeWidth={2} />
              <Tooltip contentStyle={{ background: 'rgba(2,6,23,0.95)', border: '1px solid rgba(0,229,255,0.2)', borderRadius: '8px', fontFamily: 'Space Grotesk', fontSize: 12 }}
                formatter={(v: number) => [v.toFixed(1) + '%', '']} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Confusion Matrix */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
          className="glass-panel rounded-xl p-5 border border-primary/20">
          <p className="font-data text-xs text-slate-500 tracking-widest mb-4">CONFUSION MATRIX</p>
          {model && (
            <div>
              <div className="flex gap-1 mb-1 ml-8">
                {flareLabels.map((l) => (
                  <div key={l} className="flex-1 text-center font-data text-xs text-slate-500">{l}</div>
                ))}
              </div>
              {model.confusionMatrix.map((row, i) => {
                const rowSum = row.reduce((a: number, b: number) => a + b, 0);
                return (
                  <div key={i} className="flex items-center gap-1 mb-1">
                    <div className="w-6 text-right font-data text-xs text-slate-500 mr-2">{flareLabels[i]}</div>
                    {row.map((val: number, j: number) => {
                      const intensity = rowSum > 0 ? val / rowSum : 0;
                      const isCorrect = i === j;
                      return (
                        <motion.div key={j}
                          className="flex-1 h-10 rounded flex items-center justify-center font-heading text-xs transition-all hover:scale-105"
                          style={{
                            background: isCorrect ? `rgba(0,229,255,${intensity * 0.8 + 0.1})` : `rgba(239,68,68,${intensity * 0.6})`,
                            color: intensity > 0.4 ? '#020617' : isCorrect ? '#00E5FF' : '#EF444480',
                          }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: (i * 5 + j) * 0.02 }}
                        >
                          {val}
                        </motion.div>
                      );
                    })}
                  </div>
                );
              })}
              <p className="font-data text-xs text-slate-600 text-center mt-3">Predicted → | Actual ↓</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Model Info */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="glass-panel rounded-xl p-5 border border-primary/20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'MODEL NAME', value: model?.modelName ?? '—' },
            { label: 'VERSION', value: model?.version ?? '—' },
            { label: 'TRAINING SAMPLES', value: model ? model.trainingDataSize.toLocaleString() : '—' },
            { label: 'LAST TRAINED', value: model ? new Date(model.lastTrainedAt).toLocaleDateString() : '—' },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <p className="font-data text-xs text-slate-500 tracking-widest">{item.label}</p>
              <p className="font-heading text-sm text-primary mt-1">{item.value}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

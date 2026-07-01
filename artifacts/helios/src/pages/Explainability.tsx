import React from 'react';
import { motion } from 'framer-motion';
import { Eye } from 'lucide-react';
import { useGetFeatureImportance, useGetModelPerformance } from '@workspace/api-client-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const CATEGORY_COLORS: Record<string, string> = {
  Spectral: '#00E5FF', Temporal: '#009DFF', Statistical: '#6D28D9',
  Frequency: '#FF8C00', Energy: '#22C55E', Shape: '#38BDF8',
};

const GLASS_TOOLTIP = {
  contentStyle: { background: 'rgba(2,6,23,0.95)', border: '1px solid rgba(0,229,255,0.2)', borderRadius: '8px', fontFamily: 'Space Grotesk', fontSize: 12 },
  labelStyle: { color: '#94a3b8' }, itemStyle: { color: '#00E5FF' }
};

export default function Explainability() {
  const { data: features } = useGetFeatureImportance();
  const { data: model } = useGetModelPerformance();

  const topFeatures = (features ?? []).slice(0, 12);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <Eye className="text-primary w-6 h-6" />
        <h1 className="text-2xl font-heading text-primary neon-text-cyan tracking-widest">AI EXPLAINABILITY</h1>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Feature Importance Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="lg:col-span-2 glass-panel rounded-xl p-5 border border-primary/20">
          <p className="font-data text-xs text-slate-500 tracking-widest mb-4">FEATURE IMPORTANCE SCORES</p>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={topFeatures} layout="vertical" barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,229,255,0.05)" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#475569', fontSize: 10 }} tickLine={false} axisLine={false} domain={[0, 0.25]} />
              <YAxis type="category" dataKey="feature" tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'Space Grotesk' }} width={170} tickLine={false} />
              <Tooltip {...GLASS_TOOLTIP} formatter={(v: number) => [(v * 100).toFixed(1) + '%', 'Importance']} />
              <Bar dataKey="importance" radius={[0, 4, 4, 0]} isAnimationActive>
                {topFeatures.map((entry) => (
                  <Cell key={entry.feature} fill={CATEGORY_COLORS[entry.category] ?? '#00E5FF'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Category Legend */}
        <div className="space-y-4">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="glass-panel rounded-xl p-5 border border-primary/20">
            <p className="font-data text-xs text-slate-500 tracking-widest mb-3">FEATURE CATEGORIES</p>
            <div className="space-y-2">
              {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
                <div key={cat} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm" style={{ background: color }} />
                    <span className="font-data text-xs text-slate-400">{cat}</span>
                  </div>
                  <span className="font-data text-xs text-slate-600">
                    {topFeatures.filter((f) => f.category === cat).length} features
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
            className="glass-panel rounded-xl p-5 border border-primary/20">
            <p className="font-data text-xs text-slate-500 tracking-widest mb-3">MODEL SUMMARY</p>
            <div className="space-y-2">
              {[
                { label: 'Model', value: model?.modelName ?? '—' },
                { label: 'Version', value: model?.version ?? '—' },
                { label: 'Accuracy', value: model ? `${(model.accuracy * 100).toFixed(1)}%` : '—' },
                { label: 'F1 Score', value: model ? model.f1Score.toFixed(3) : '—' },
                { label: 'AUC-ROC', value: model ? model.auc.toFixed(3) : '—' },
                { label: 'Training Samples', value: model ? model.trainingDataSize.toLocaleString() : '—' },
              ].map((item) => (
                <div key={item.label} className="flex justify-between py-1 border-b border-slate-800/50 last:border-0">
                  <span className="font-data text-xs text-slate-500">{item.label}</span>
                  <span className="font-data text-xs text-primary">{item.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Decision explanation */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="glass-panel rounded-xl p-6 border border-primary/20">
        <p className="font-data text-xs text-slate-500 tracking-widest mb-4">DECISION EXPLANATION — CURRENT PREDICTION</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <p className="font-data text-sm text-slate-600 leading-relaxed">
              The model's current prediction is primarily driven by the <span className="text-primary">Soft X-Ray Peak Flux</span> measurement, which accounts for 23.4% of the decision weight. Combined with the <span className="text-cyan-400">Hard X-Ray Derivative</span> (rising trend indicator), the model assigns elevated probability to an upcoming M-class event.
            </p>
            <p className="font-data text-sm text-slate-500 leading-relaxed">
              The <span className="text-purple-400">Soft/Hard Ratio</span> is within normal range (0.015), suggesting the current activity is thermal plasma rather than non-thermal energetic particles — consistent with early-phase flare development.
            </p>
          </div>
          <div className="space-y-2">
            {topFeatures.slice(0, 5).map((f, i) => (
              <div key={f.feature} className="flex items-center gap-3">
                <span className="font-data text-xs text-slate-500 w-4">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="font-data text-xs text-slate-400">{f.feature}</span>
                    <span className="font-data text-xs" style={{ color: CATEGORY_COLORS[f.category] }}>
                      {(f.importance * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <motion.div className="h-full rounded-full"
                      style={{ background: CATEGORY_COLORS[f.category] }}
                      initial={{ width: 0 }}
                      animate={{ width: `${f.importance / 0.25 * 100}%` }}
                      transition={{ duration: 1, delay: 0.5 + i * 0.1 }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

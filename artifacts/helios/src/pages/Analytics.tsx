import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart2 } from 'lucide-react';
import { useGetDailyAnalytics, useGetClassDistribution, useGetHeatmapData } from '@workspace/api-client-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const GLASS_TOOLTIP = {
  contentStyle: { background: 'rgba(2,6,23,0.95)', border: '1px solid rgba(0,229,255,0.2)', borderRadius: '8px', fontFamily: 'Space Grotesk', fontSize: 12 },
  labelStyle: { color: '#94a3b8' }, itemStyle: { color: '#00E5FF' }
};

export default function Analytics() {
  const [period, setPeriod] = useState(30);
  const { data: daily } = useGetDailyAnalytics({ days: period });
  const { data: distribution } = useGetClassDistribution();
  const { data: heatmap } = useGetHeatmapData();

  const formattedDaily = (daily ?? []).slice(-30).map((d) => ({
    ...d,
    date: d.date.slice(5),
    maxFluxLog: d.maxFlux ? -Math.log10(d.maxFlux) : 0,
  }));

  const heatmapGrid = Array.from({ length: 7 }, (_, day) =>
    Array.from({ length: 24 }, (_, hour) => {
      const entry = (heatmap ?? []).find((h) => h.day === day && h.hour === hour);
      return entry?.value ?? 0;
    })
  );

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart2 className="text-primary w-6 h-6" />
          <h1 className="text-2xl font-heading text-primary neon-text-cyan tracking-widest">ANALYTICS</h1>
        </div>
        <div className="flex gap-2">
          {[7, 30, 90].map((d) => (
            <button key={d} onClick={() => setPeriod(d)}
              className={`font-data text-xs px-4 py-1.5 rounded-full border transition-all ${period === d ? 'border-primary bg-primary/20 text-primary' : 'border-slate-700 text-slate-500 hover:border-primary/40'}`}>
              {d}D
            </button>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Event Count */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass-panel rounded-xl p-5 border border-primary/20">
          <p className="font-data text-xs text-slate-500 tracking-widest mb-4">DAILY FLARE EVENTS</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={formattedDaily} barSize={6}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,229,255,0.05)" />
              <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 10, fontFamily: 'Space Grotesk' }} tickLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip {...GLASS_TOOLTIP} />
              <Bar dataKey="xClassCount" stackId="a" fill="#EF4444" name="X-class" radius={[2, 2, 0, 0]} />
              <Bar dataKey="mClassCount" stackId="a" fill="#FF8C00" name="M-class" />
              <Bar dataKey="cClassCount" stackId="a" fill="#F59E0B" name="C-class" />
              <Bar dataKey="bClassCount" stackId="a" fill="#22C55E" name="B-class" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Flare Class Distribution Pie */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass-panel rounded-xl p-5 border border-primary/20">
          <p className="font-data text-xs text-slate-500 tracking-widest mb-4">FLARE CLASS DISTRIBUTION</p>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="60%" height={200}>
              <PieChart>
                <Pie data={distribution ?? []} dataKey="count" nameKey="flareClass" cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3}
                  strokeWidth={0}>
                  {(distribution ?? []).map((entry) => (
                    <Cell key={entry.flareClass} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip {...GLASS_TOOLTIP} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 flex-1">
              {(distribution ?? []).map((entry) => (
                <div key={entry.flareClass} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm" style={{ background: entry.color }} />
                    <span className="font-data text-xs text-slate-400">{entry.flareClass}-Class</span>
                  </div>
                  <span className="font-data text-xs text-slate-600">{entry.percentage.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Max Flux Trend */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="glass-panel rounded-xl p-5 border border-primary/20">
          <p className="font-data text-xs text-slate-500 tracking-widest mb-4">PEAK FLUX TREND (LOG SCALE)</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={formattedDaily}>
              <defs>
                <linearGradient id="fluxGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00E5FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,229,255,0.05)" />
              <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 10, fontFamily: 'Space Grotesk' }} tickLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip {...GLASS_TOOLTIP} />
              <Area type="monotone" dataKey="maxFluxLog" stroke="#00E5FF" strokeWidth={2} fill="url(#fluxGrad)"
                isAnimationActive dot={false} name="-log₁₀(flux)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Activity Heatmap */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="glass-panel rounded-xl p-5 border border-primary/20">
          <p className="font-data text-xs text-slate-500 tracking-widest mb-4">SOLAR ACTIVITY HEATMAP (HOUR × DAY)</p>
          <div className="flex gap-1 items-start">
            <div className="flex flex-col gap-0.5 mt-5 mr-1">
              {days.map((d) => (
                <div key={d} className="h-5 flex items-center font-data text-xs text-slate-600 w-8">{d}</div>
              ))}
            </div>
            <div className="flex-1 overflow-x-auto">
              <div className="flex gap-0.5 mb-0.5">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="flex-1 font-data text-xs text-slate-700 text-center">{i * 2}</div>
                ))}
              </div>
              {heatmapGrid.map((row, dayIdx) => (
                <div key={dayIdx} className="flex gap-0.5 mb-0.5">
                  {row.map((val, hourIdx) => (
                    <motion.div key={hourIdx}
                      className="flex-1 h-5 rounded-sm"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: (dayIdx * 24 + hourIdx) * 0.001 }}
                      style={{ background: `rgba(0,229,255,${val * 0.8})` }}
                      title={`${days[dayIdx]} ${hourIdx}:00 — ${(val * 100).toFixed(0)}%`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

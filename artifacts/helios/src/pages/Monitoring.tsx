import React from 'react';
import { useGetSolarFlux } from '@workspace/api-client-react';
import { motion } from 'framer-motion';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function Monitoring() {
  const { data: fluxData, isLoading } = useGetSolarFlux({ limit: 100 });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full flex flex-col space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-heading tracking-widest text-white">LIVE TELEMETRY</h2>
        <div className="flex gap-2">
          <span className="glass-panel px-3 py-1 rounded text-xs font-data text-primary animate-pulse">
            LIVE FEED ACTIVE
          </span>
        </div>
      </div>

      <div className="flex-1 glass-panel rounded-xl p-6 flex flex-col relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 font-data text-xs text-slate-500 text-right">
          <div>SOFT X-RAY: 0.5-4.0 Å</div>
          <div>HARD X-RAY: 1.0-8.0 Å</div>
        </div>

        <h3 className="text-xl font-heading text-primary mb-6">X-RAY FLUX (GOES / ADITYA-L1)</h3>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center font-data text-primary animate-pulse">
            CALIBRATING SENSORS...
          </div>
        ) : (
          <div className="flex-1 min-h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={fluxData || []}>
                <defs>
                  <linearGradient id="colorSoft" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00E5FF" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorHard" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#009DFF" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#009DFF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis 
                  dataKey="timeTag" 
                  tickFormatter={(tick) => new Date(tick).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  stroke="rgba(255,255,255,0.5)"
                  tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12, fontFamily: 'Space Grotesk' }}
                />
                <YAxis 
                  scale="log" 
                  domain={['auto', 'auto']}
                  stroke="rgba(255,255,255,0.5)"
                  tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12, fontFamily: 'Space Grotesk' }}
                  tickFormatter={(tick) => tick.toExponential(1)}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(2, 6, 23, 0.9)', border: '1px solid rgba(0, 229, 255, 0.3)', borderRadius: '8px', fontFamily: 'Space Grotesk' }}
                  itemStyle={{ color: '#00E5FF' }}
                  labelFormatter={(label) => new Date(label).toLocaleString()}
                />
                <Area type="monotone" dataKey="softXray" stroke="#00E5FF" strokeWidth={2} fillOpacity={1} fill="url(#colorSoft)" isAnimationActive={false} />
                <Area type="monotone" dataKey="hardXray" stroke="#009DFF" strokeWidth={2} fillOpacity={1} fill="url(#colorHard)" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </motion.div>
  );
}

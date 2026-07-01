import React from 'react';
import { useGetSolarSummary, useGetLatestSolar, useGetSolarEvents } from '@workspace/api-client-react';
import { motion } from 'framer-motion';
import { Activity, ShieldAlert, Zap, Radio } from 'lucide-react';

export default function Dashboard() {
  const { data: summary } = useGetSolarSummary();
  const { data: latest } = useGetLatestSolar();
  const { data: events } = useGetSolarEvents({ limit: 5 });

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-heading tracking-widest text-white">MISSION OVERVIEW</h2>
        <div className="flex gap-2">
          <span className="glass-panel px-3 py-1 rounded text-xs font-data text-primary">
            ADITYA-L1
          </span>
          <span className="glass-panel px-3 py-1 rounded text-xs font-data text-secondary">
            GOES-16
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div variants={item} className="glass-panel p-6 rounded-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-100 transition-opacity text-primary">
            <Activity className="w-12 h-12" />
          </div>
          <p className="text-sm font-data text-slate-400 mb-2">CURRENT FLUX</p>
          <div className="text-4xl font-heading text-primary neon-text-cyan">
            {latest?.currentFlux.toExponential(2) || '0.00e-0'}
          </div>
          <p className="text-xs mt-2 text-slate-500 font-data">W/m²</p>
        </motion.div>

        <motion.div variants={item} className="glass-panel p-6 rounded-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-100 transition-opacity text-red-500">
            <Zap className="w-12 h-12" />
          </div>
          <p className="text-sm font-data text-slate-400 mb-2">FLARE CLASS</p>
          <div className="text-4xl font-heading text-red-500">
            {latest?.flareClass || 'A1.0'}
          </div>
          <p className="text-xs mt-2 text-slate-500 font-data">CURRENT ACTIVITY</p>
        </motion.div>

        <motion.div variants={item} className="glass-panel p-6 rounded-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-100 transition-opacity text-secondary">
            <Radio className="w-12 h-12" />
          </div>
          <p className="text-sm font-data text-slate-400 mb-2">PREDICTION ACCURACY</p>
          <div className="text-4xl font-heading text-secondary neon-text-blue">
            {(summary?.predictionAccuracy || 0) * 100}%
          </div>
          <p className="text-xs mt-2 text-slate-500 font-data">MODEL CONFIDENCE</p>
        </motion.div>

        <motion.div variants={item} className="glass-panel p-6 rounded-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-100 transition-opacity text-orange-500">
            <ShieldAlert className="w-12 h-12" />
          </div>
          <p className="text-sm font-data text-slate-400 mb-2">ACTIVE ALERTS</p>
          <div className="text-4xl font-heading text-orange-500">
            {summary?.activeAlerts || 0}
          </div>
          <p className="text-xs mt-2 text-slate-500 font-data">REQUIRE ATTENTION</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={item} className="glass-panel p-6 rounded-xl">
          <h3 className="text-xl font-heading text-primary mb-4 border-b border-primary/20 pb-2">RECENT EVENTS</h3>
          <div className="space-y-4">
            {events?.map((event) => (
              <div key={event.id} className="flex items-center justify-between p-3 bg-white/5 rounded border border-white/10 hover:border-primary/50 transition-colors">
                <div>
                  <div className="font-heading text-lg">{event.flareClass}</div>
                  <div className="text-xs font-data text-slate-400">{new Date(event.timeTag).toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className="font-data text-sm text-secondary">Peak: {event.peakFlux.toExponential(1)}</div>
                  <div className="text-xs font-data text-slate-500">Source: {event.source}</div>
                </div>
              </div>
            ))}
            {!events?.length && <div className="text-center p-4 text-slate-500 font-data">NO RECENT EVENTS</div>}
          </div>
        </motion.div>

        <motion.div variants={item} className="glass-panel p-6 rounded-xl">
          <h3 className="text-xl font-heading text-primary mb-4 border-b border-primary/20 pb-2">SYSTEM STATUS</h3>
          <div className="space-y-4 font-data">
            <div className="flex justify-between items-center">
              <span className="text-slate-300">TELEMETRY LINK</span>
              <span className="text-green-500">ONLINE</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-300">AI PREDICTION CORE</span>
              <span className="text-green-500">NOMINAL</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-300">DATABASE INTEGRITY</span>
              <span className="text-green-500">SYNCED</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-300">LAST UPDATE</span>
              <span className="text-primary">{latest?.lastUpdated ? new Date(latest.lastUpdated).toLocaleTimeString() : 'WAITING...'}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

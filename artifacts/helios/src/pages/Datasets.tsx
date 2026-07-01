import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Database, Upload, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useGetDatasets } from '@workspace/api-client-react';

const STATUS_CONFIG = {
  ready: { color: '#22C55E', icon: CheckCircle, label: 'READY' },
  processing: { color: '#F59E0B', icon: Clock, label: 'PROCESSING' },
  error: { color: '#EF4444', icon: AlertCircle, label: 'ERROR' },
};

export default function Datasets() {
  const { data: datasets } = useGetDatasets();
  const [dragging, setDragging] = useState(false);
  const [uploaded, setUploaded] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files);
    setUploaded((prev) => [...prev, ...files.map((f) => f.name)]);
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <Database className="text-primary w-6 h-6" />
        <h1 className="text-2xl font-heading text-primary neon-text-cyan tracking-widest">DATASET EXPLORER</h1>
      </motion.div>

      {/* Upload zone */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`relative rounded-xl border-2 border-dashed p-12 text-center cursor-pointer transition-all duration-300 ${
            dragging ? 'border-primary bg-primary/10 scale-[1.02]' : 'border-slate-700/60 hover:border-primary/50 hover:bg-primary/5'
          }`}
        >
          <motion.div animate={{ y: dragging ? -8 : 0 }} transition={{ type: 'spring' }}>
            <Upload className="w-12 h-12 mx-auto text-primary/60 mb-4" />
            <p className="font-heading text-lg text-slate-600 tracking-wider">DROP DATASET HERE</p>
            <p className="font-data text-sm text-slate-500 mt-2">Supports CSV · JSON · Excel · FITS</p>
            <p className="font-data text-xs text-slate-600 mt-4">Auto-detects SoLEXS · HEL1OS · GOES XRS formats</p>
          </motion.div>
          {dragging && (
            <motion.div className="absolute inset-0 rounded-xl border-2 border-primary"
              animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 0.8, repeat: Infinity }} />
          )}
          <input ref={fileRef} type="file" accept=".csv,.json,.xlsx,.fits" multiple className="hidden"
            onChange={(e) => {
              const files = Array.from(e.target.files ?? []);
              setUploaded((prev) => [...prev, ...files.map((f) => f.name)]);
            }} />
        </div>
        {uploaded.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 space-y-1">
            {uploaded.map((name) => (
              <div key={name} className="flex items-center gap-2 font-data text-xs text-green-400">
                <CheckCircle className="w-3 h-3" />{name} — queued for processing
              </div>
            ))}
          </motion.div>
        )}
      </motion.div>

      {/* ISRO Source Notice */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        className="glass-panel rounded-xl p-4 border border-yellow-500/20 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5 shrink-0" />
        <div>
          <p className="font-data text-sm text-yellow-400">ISRO Direct Import</p>
          <p className="font-data text-xs text-slate-500 mt-1 leading-relaxed">
            ISRO Aditya-L1 data may require authentication. If automatic download is unavailable, please upload datasets manually using the drop zone above. NOAA GOES XRS public data is available at <span className="text-primary">services.swpc.noaa.gov</span>.
          </p>
        </div>
      </motion.div>

      {/* Loaded Datasets */}
      <div className="space-y-3">
        <p className="font-data text-xs text-slate-500 tracking-widest">LOADED DATASETS</p>
        {(datasets ?? []).map((ds, i) => {
          const cfg = STATUS_CONFIG[ds.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.ready;
          const Icon = cfg.icon;
          return (
            <motion.div key={ds.id}
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
              className="glass-panel rounded-xl p-5 border border-primary/20 hover:border-primary/40 transition-all cursor-pointer group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
                    <Database className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-data text-sm text-slate-700 group-hover:text-primary transition-colors">{ds.name}</p>
                    <p className="font-data text-xs text-slate-500 mt-0.5">{ds.type} · {ds.channelInfo}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-right">
                  <div>
                    <p className="font-heading text-sm text-primary">{ds.recordCount.toLocaleString()}</p>
                    <p className="font-data text-xs text-slate-600">RECORDS</p>
                  </div>
                  <div>
                    <p className="font-data text-xs text-slate-400">{new Date(ds.uploadedAt).toLocaleDateString()}</p>
                    <p className="font-data text-xs text-slate-600">LOADED</p>
                  </div>
                  <div className="flex items-center gap-2" style={{ color: cfg.color }}>
                    <Icon className="w-4 h-4" />
                    <span className="font-data text-xs">{cfg.label}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

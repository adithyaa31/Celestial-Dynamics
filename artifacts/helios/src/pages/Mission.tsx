import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Satellite, Globe, Shield, Zap, BookOpen } from 'lucide-react';

export default function Mission() {
  const sections = [
    {
      icon: Sun, color: '#FF8C00', title: 'ADITYA-L1 MISSION',
      content: "Aditya-L1 is India's first solar observation satellite, stationed at the Sun-Earth Lagrange point 1 (L1), approximately 1.5 million km from Earth. Launched by ISRO on September 2, 2023, it continuously observes the Sun without any eclipses or occultations.",
    },
    {
      icon: Satellite, color: '#00E5FF', title: 'SoLEXS INSTRUMENT',
      content: "The Solar Low Energy X-ray Spectrometer (SoLEXS) monitors soft X-ray flux in the 1-15 keV energy range. It provides continuous, high-cadence measurements crucial for detecting and classifying solar flares in the B, C, M, and X categories.",
    },
    {
      icon: Globe, color: '#6D28D9', title: 'HEL1OS INSTRUMENT',
      content: "The High Energy L1 Orbiting X-ray Spectrometer (HEL1OS) covers the hard X-ray energy range of 10-150 keV. It captures the non-thermal emission from accelerated electrons during solar flare impulsive phases, providing complementary data to SoLEXS.",
    },
    {
      icon: Zap, color: '#22C55E', title: 'AI METHODOLOGY',
      content: "PROJECT HELIOS fuses SoLEXS and HEL1OS data streams using multi-instrument feature engineering. A Random Forest ensemble model (HELIOS-RF-v2) trained on 47,832 labeled events achieves 87.4% classification accuracy with an average lead time of 18.5 minutes.",
    },
    {
      icon: Shield, color: '#EF4444', title: 'SPACE WEATHER IMPACT',
      content: "Solar flares and associated phenomena cause radio blackouts (X-ray flux → ionosphere disruption), energetic particle events (satellite damage risk), and geomagnetic storms (power grid disruptions). Early warning enables protective measures for critical infrastructure.",
    },
    {
      icon: BookOpen, color: '#38BDF8', title: 'RESEARCH GOAL',
      content: "PROJECT HELIOS demonstrates that combining multi-wavelength X-ray observations with machine learning can provide actionable space weather forecasts. The platform serves as a prototype for operational solar flare prediction using Indian space assets.",
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <Sun className="text-primary w-6 h-6" />
        <h1 className="text-2xl font-heading text-primary neon-text-cyan tracking-widest">MISSION DOCUMENTATION</h1>
      </motion.div>

      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="glass-panel rounded-xl p-8 border border-primary/30 text-center"
        style={{ boxShadow: '0 0 60px rgba(0,229,255,0.08)' }}>
        <h2 className="font-heading text-4xl text-primary neon-text-cyan tracking-widest mb-2">PROJECT HELIOS</h2>
        <p className="font-data text-slate-400 tracking-widest text-sm">AI-POWERED SOLAR FLARE FORECASTING USING ADITYA-L1</p>
        <div className="flex justify-center gap-8 mt-6">
          {[
            { label: 'MISSION', value: 'ISRO Aditya-L1' },
            { label: 'ORBIT', value: 'Sun-Earth L1' },
            { label: 'INSTRUMENTS', value: 'SoLEXS + HEL1OS' },
            { label: 'AI MODEL', value: 'HELIOS-RF-v2' },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <p className="font-data text-xs text-slate-500 tracking-widest">{item.label}</p>
              <p className="font-heading text-sm text-primary mt-1">{item.value}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Sections grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {sections.map((sec, i) => {
          const Icon = sec.icon;
          return (
            <motion.div key={sec.title}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.08 }}
              className="glass-panel rounded-xl p-5 border border-slate-700/40 hover:border-primary/30 transition-all duration-500 group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${sec.color}15`, border: `1px solid ${sec.color}30` }}>
                  <Icon className="w-4 h-4" style={{ color: sec.color }} />
                </div>
                <h3 className="font-heading text-sm tracking-widest" style={{ color: sec.color }}>{sec.title}</h3>
              </div>
              <p className="font-data text-sm text-slate-400 leading-relaxed">{sec.content}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Technical stack */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
        className="glass-panel rounded-xl p-6 border border-primary/20">
        <p className="font-data text-xs text-slate-500 tracking-widest mb-4">TECHNOLOGY STACK</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { cat: 'FRONTEND', items: ['React + Vite', 'Three.js', 'Framer Motion', 'Recharts'] },
            { cat: 'BACKEND', items: ['Node.js', 'Express 5', 'PostgreSQL', 'Drizzle ORM'] },
            { cat: 'AI / ML', items: ['Random Forest', 'XGBoost', 'Feature Engineering', 'SHAP Analysis'] },
            { cat: 'DATA', items: ['GOES XRS JSON', 'SoLEXS CSV', 'HEL1OS HDF5', 'FITS (planned)'] },
          ].map((block) => (
            <div key={block.cat}>
              <p className="font-data text-xs text-primary tracking-widest mb-2">{block.cat}</p>
              {block.items.map((item) => (
                <p key={item} className="font-data text-xs text-slate-500 py-0.5">{item}</p>
              ))}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

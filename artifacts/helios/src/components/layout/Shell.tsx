import React from 'react';
import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { SpaceBackground } from './SpaceBackground';
import { useTheme } from '@/context/ThemeContext';
import {
  Activity, BarChart2, Cpu, Database, Eye,
  Home, LayoutDashboard, Moon, Radio, ShieldAlert, Sun
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: 'TERMINAL', icon: Home },
  { href: '/dashboard', label: 'MISSION CONTROL', icon: LayoutDashboard },
  { href: '/monitoring', label: 'LIVE TELEMETRY', icon: Activity },
  { href: '/forecasting', label: 'AI FORECAST', icon: Cpu },
  { href: '/nowcasting', label: 'NOWCAST', icon: Radio },
  { href: '/analytics', label: 'ANALYTICS', icon: BarChart2 },
  { href: '/datasets', label: 'DATASETS', icon: Database },
  { href: '/explainability', label: 'SHAP VISUALS', icon: Eye },
  { href: '/alerts', label: 'ALERTS', icon: ShieldAlert },
  { href: '/performance', label: 'MODEL PERF', icon: Activity },
  { href: '/mission', label: 'MISSION DOCS', icon: Sun },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { isDark, toggle } = useTheme();

  return (
    <div className={`min-h-screen flex flex-col overflow-hidden selection:bg-primary/20 ${isDark ? 'dark' : ''}`}>
      <SpaceBackground />
      <div className="scanlines" />

      {/* Header */}
      <header className={`h-16 border-b flex items-center justify-between px-6 z-40 sticky top-0 backdrop-blur-md transition-colors duration-500
        ${isDark
          ? 'border-primary/20 bg-black/40 shadow-[0_1px_0_rgba(0,229,255,0.08)]'
          : 'border-sky-200/70 bg-white/80 shadow-sm'
        }`}>
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-500
            ${isDark ? 'bg-primary/20 border border-primary/50' : 'bg-primary/10 border border-primary/40'}`}>
            <Sun className="w-5 h-5 text-primary animate-spin" style={{ animationDuration: '12s' }} />
          </div>
          <h1 className={`text-xl font-heading text-primary tracking-widest ${isDark ? 'neon-text-cyan' : ''}`}>
            HELIOS
          </h1>
        </div>

        <div className="flex items-center gap-5 font-data text-sm">
          <div className="flex items-center gap-2">
            <motion.span className="w-2 h-2 rounded-full bg-green-500 inline-block"
              animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.4, repeat: Infinity }} />
            <span className={`tracking-wider font-medium ${isDark ? 'text-green-400' : 'text-green-600'}`}>
              SYSTEM NOMINAL
            </span>
          </div>

          <div className={`tracking-widest ${isDark ? 'text-primary/70' : 'text-primary/60'}`}>
            UTC {new Date().toISOString().substring(11, 19)}
          </div>

          {/* Theme Toggle */}
          <motion.button
            onClick={toggle}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.93 }}
            className={`relative w-14 h-7 rounded-full border transition-all duration-500 flex items-center px-1 cursor-pointer
              ${isDark
                ? 'bg-primary/20 border-primary/50 shadow-[0_0_12px_rgba(0,229,255,0.25)]'
                : 'bg-slate-100 border-slate-300'
              }`}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {/* Track icons */}
            <Sun className="absolute left-1.5 w-3.5 h-3.5 text-amber-400 opacity-70" />
            <Moon className="absolute right-1.5 w-3.5 h-3.5 text-primary opacity-70" />
            {/* Thumb */}
            <motion.div
              className={`w-5 h-5 rounded-full z-10 flex items-center justify-center shadow-md transition-colors duration-500
                ${isDark ? 'bg-primary' : 'bg-white border border-slate-300'}`}
              animate={{ x: isDark ? 26 : 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              {isDark
                ? <Moon className="w-3 h-3 text-[#020617]" />
                : <Sun className="w-3 h-3 text-amber-500" />
              }
            </motion.div>
          </motion.button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={`w-64 border-r hidden md:flex flex-col z-30 transition-colors duration-500
          ${isDark
            ? 'border-primary/20 bg-black/30 backdrop-blur-sm'
            : 'border-sky-200/70 bg-white/70 backdrop-blur-sm shadow-sm'
          }`}>
          <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <div className={`flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer transition-all duration-200
                    font-data text-sm tracking-wider border
                    ${isActive
                      ? isDark
                        ? 'bg-primary/20 text-primary border-primary/50 shadow-[0_0_12px_rgba(0,229,255,0.15)]'
                        : 'bg-primary/10 text-primary border-primary/30 shadow-sm shadow-primary/10'
                      : isDark
                        ? 'text-slate-400 hover:text-primary hover:bg-primary/10 border-transparent'
                        : 'text-slate-500 hover:text-primary hover:bg-primary/6 border-transparent'
                    }`}>
                    <Icon className="w-4 h-4 shrink-0" />
                    {item.label}
                  </div>
                </Link>
              );
            })}
          </nav>
          <div className={`p-4 border-t transition-colors duration-500 ${isDark ? 'border-primary/20' : 'border-sky-200/60'}`}>
            <div className="text-xs font-data text-primary/50 tracking-widest text-center">
              ADITYA-L1 UPLINK SECURE
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 relative z-10">
          {children}
        </main>
      </div>
    </div>
  );
}

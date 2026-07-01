import React from 'react';
import { Link, useLocation } from 'wouter';
import { SpaceBackground } from './SpaceBackground';
import {
  Activity,
  BarChart2,
  Cpu,
  Database,
  Eye,
  Home,
  LayoutDashboard,
  Radio,
  ShieldAlert,
  Sun
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

  return (
    <div className="min-h-screen flex flex-col overflow-hidden selection:bg-primary/20">
      <SpaceBackground />
      <div className="scanlines" />

      {/* Top Header */}
      <header className="h-16 border-b border-sky-200/70 bg-white/80 backdrop-blur-md flex items-center justify-between px-6 z-40 sticky top-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/40 flex items-center justify-center">
            <Sun className="w-5 h-5 text-primary animate-spin" style={{ animationDuration: '12s' }} />
          </div>
          <h1 className="text-xl font-heading text-primary tracking-widest neon-text-cyan">
            HELIOS
          </h1>
        </div>

        <div className="flex items-center gap-6 font-data text-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-green-600 tracking-wider font-medium">SYSTEM NOMINAL</span>
          </div>
          <div className="text-primary/70 tracking-widest">
            UTC {new Date().toISOString().substring(11, 19)}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 border-r border-sky-200/70 bg-white/70 backdrop-blur-sm hidden md:flex flex-col z-30 shadow-sm">
          <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;

              return (
                <Link key={item.href} href={item.href}>
                  <div className={`
                    flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer transition-all duration-200
                    font-data text-sm tracking-wider
                    ${isActive
                      ? 'bg-primary/10 text-primary border border-primary/30 shadow-sm shadow-primary/10'
                      : 'text-slate-500 hover:text-primary hover:bg-primary/6 border border-transparent'}
                  `}>
                    <Icon className="w-4 h-4 shrink-0" />
                    {item.label}
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-sky-200/60">
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

import React, { useRef, useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { Link } from 'wouter';
import { useGetSolarSummary } from '@workspace/api-client-react';

/* ── Animated Sun ────────────────────────────────────────────────── */
function AnimatedSun() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext('2d')!;
    const S = 640; cv.width = cv.height = S;
    const C = S / 2;
    let frame = 0, raf: number;

    // Solar-wind particles
    const pts = Array.from({ length: 280 }, () => {
      const a = Math.random() * Math.PI * 2;
      const r = 108 + Math.random() * 12;
      return { angle: a, r, speed: 0.002 + Math.random() * 0.007, alpha: 0, life: Math.random() * 160, max: 100 + Math.random() * 120 };
    });

    // Coronal loops
    const loops = Array.from({ length: 14 }, (_, i) => ({
      sa: (Math.PI * 2 / 14) * i,
      spread: 0.3 + Math.random() * 0.6,
      height: 30 + Math.random() * 75,
      phase: Math.random() * Math.PI * 2,
      speed: 0.005 + Math.random() * 0.01,
      color: i % 4 === 0 ? '#FF4500' : i % 4 === 1 ? '#FF6D00' : i % 4 === 2 ? '#FF8C00' : '#FFAB40',
    }));

    // Orbiting data points on rings
    const orbitRings = [
      { r: 150, speed: 0.012, color: '#0284C7', dash: [12, 6], w: 1.8, dots: 3, label: 'SoLEXS' },
      { r: 185, speed: -0.007, color: '#F59E0B', dash: [6, 12], w: 1.2, dots: 2, label: 'HEL1OS' },
      { r: 228, speed: 0.005, color: '#7C3AED', dash: [18, 8], w: 1, dots: 1, label: 'AI' },
    ];

    const draw = () => {
      ctx.clearRect(0, 0, S, S);
      frame++;

      // Multi-layer outer glow halos
      [
        { r: 310, a: 0.025 }, { r: 268, a: 0.05 }, { r: 225, a: 0.08 },
        { r: 188, a: 0.11 }, { r: 160, a: 0.15 },
      ].forEach(({ r, a }) => {
        const pulse = 1 + 0.04 * Math.sin(frame * 0.025);
        const g = ctx.createRadialGradient(C, C, r * 0.25, C, C, r * pulse);
        g.addColorStop(0, `rgba(255,110,0,${a})`);
        g.addColorStop(0.6, `rgba(255,60,0,${a * 0.4})`);
        g.addColorStop(1, 'rgba(200,40,0,0)');
        ctx.beginPath(); ctx.arc(C, C, r * pulse, 0, Math.PI * 2);
        ctx.fillStyle = g; ctx.fill();
      });

      // Orbiting instrument rings with labelled data dots
      orbitRings.forEach(ring => {
        ctx.save(); ctx.translate(C, C);
        ctx.rotate(frame * ring.speed);

        // Dashed ring
        ctx.beginPath(); ctx.arc(0, 0, ring.r, 0, Math.PI * 2);
        ctx.strokeStyle = ring.color + '60'; ctx.lineWidth = ring.w;
        ctx.setLineDash(ring.dash); ctx.stroke(); ctx.setLineDash([]);

        // Glowing dots spread around ring
        for (let d = 0; d < ring.dots + 1; d++) {
          const ang = (Math.PI * 2 / (ring.dots + 1)) * d;
          const dx = Math.cos(ang) * ring.r, dy = Math.sin(ang) * ring.r;
          // Outer glow
          const grd = ctx.createRadialGradient(dx, dy, 0, dx, dy, 8);
          grd.addColorStop(0, ring.color); grd.addColorStop(1, ring.color + '00');
          ctx.beginPath(); ctx.arc(dx, dy, 8, 0, Math.PI * 2);
          ctx.fillStyle = grd; ctx.fill();
          // Core dot
          ctx.beginPath(); ctx.arc(dx, dy, 3, 0, Math.PI * 2);
          ctx.fillStyle = ring.color;
          ctx.shadowColor = ring.color; ctx.shadowBlur = 14;
          ctx.fill(); ctx.shadowBlur = 0;
        }
        ctx.restore();
      });

      // Coronal loops
      loops.forEach(l => {
        const pulse = Math.sin(frame * l.speed + l.phase);
        const sa = l.sa + frame * 0.003;
        const ea = sa + l.spread;
        const mid = (sa + ea) / 2;
        const h = l.height * (0.6 + 0.4 * Math.abs(pulse));
        const rb = 106;
        const x1 = C + Math.cos(sa) * rb, y1 = C + Math.sin(sa) * rb;
        const x2 = C + Math.cos(ea) * rb, y2 = C + Math.sin(ea) * rb;
        const hx = C + Math.cos(mid) * (rb + h), hy = C + Math.sin(mid) * (rb + h);

        // Loop with gradient stroke
        const lg = ctx.createLinearGradient(x1, y1, hx, hy);
        lg.addColorStop(0, l.color + '00');
        lg.addColorStop(0.5, l.color + 'CC');
        lg.addColorStop(1, l.color + '00');
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.quadraticCurveTo(hx, hy, x2, y2);
        ctx.strokeStyle = lg;
        ctx.lineWidth = 1.5 + 2.5 * Math.abs(pulse);
        ctx.stroke();
      });

      // Sun plasma surface
      ctx.save(); ctx.translate(C, C); ctx.rotate(frame * 0.004);
      const sg = ctx.createRadialGradient(0, 0, 0, 0, 0, 108);
      sg.addColorStop(0, '#FFFFFF');
      sg.addColorStop(0.08, '#FFFDE7');
      sg.addColorStop(0.25, '#FFE082');
      sg.addColorStop(0.5, '#FFB300');
      sg.addColorStop(0.72, '#FF6D00');
      sg.addColorStop(0.88, '#E64A19');
      sg.addColorStop(1, '#BF360C');
      ctx.beginPath();
      for (let a = 0; a <= Math.PI * 2 + 0.05; a += 0.035) {
        const d = 108 + Math.sin(a * 9 + frame * 0.05) * 6 + Math.sin(a * 17 + frame * 0.031) * 3.5;
        const x = Math.cos(a) * d, y = Math.sin(a) * d;
        a === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fillStyle = sg;
      ctx.shadowColor = '#FF8F00'; ctx.shadowBlur = 40;
      ctx.fill(); ctx.shadowBlur = 0;

      // Sunspot / granulation texture
      for (let i = 0; i < 8; i++) {
        const sa = (Math.PI * 2 / 8) * i + frame * 0.002;
        const sr = 55 + Math.sin(frame * 0.02 + i) * 20;
        const spot = ctx.createRadialGradient(Math.cos(sa) * sr, Math.sin(sa) * sr, 0, Math.cos(sa) * sr, Math.sin(sa) * sr, 14);
        spot.addColorStop(0, 'rgba(180,50,0,0.35)');
        spot.addColorStop(1, 'rgba(180,50,0,0)');
        ctx.beginPath(); ctx.arc(Math.cos(sa) * sr, Math.sin(sa) * sr, 14, 0, Math.PI * 2);
        ctx.fillStyle = spot; ctx.fill();
      }
      ctx.restore();

      // Particle solar wind
      pts.forEach(p => {
        p.life++;
        p.angle += p.speed;
        p.r += 0.22;
        p.alpha = Math.sin((p.life / p.max) * Math.PI);
        if (p.life >= p.max || p.r > 310) {
          p.r = 110 + Math.random() * 10;
          p.angle = Math.random() * Math.PI * 2;
          p.life = 0;
          p.max = 100 + Math.random() * 120;
          p.speed = 0.002 + Math.random() * 0.007;
        }
        const x = C + Math.cos(p.angle) * p.r;
        const y = C + Math.sin(p.angle) * p.r;
        const pSize = 0.8 + Math.random() * 1.8;
        ctx.beginPath(); ctx.arc(x, y, pSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,130,30,${p.alpha * 0.85})`; ctx.fill();
      });

      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return <canvas ref={ref} style={{ width: 640, height: 640 }} className="opacity-95" />;
}

/* ── Dense particle network ──────────────────────────────────────── */
function ParticleField() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext('2d')!;
    let W = cv.width = window.innerWidth, H = cv.height = window.innerHeight;
    let raf: number, f = 0;

    const pts = Array.from({ length: 100 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.45, vy: (Math.random() - 0.5) * 0.45,
      r: 1.2 + Math.random() * 2.2,
      hue: Math.random() > 0.5 ? 200 : 38,
      alpha: 0.12 + Math.random() * 0.28,
      phase: Math.random() * Math.PI * 2,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, W, H); f++;
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.phase += 0.014;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        const a = p.alpha * (0.5 + 0.5 * Math.sin(p.phase));

        // Glowing dot with radial gradient
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3);
        if (p.hue === 200) {
          g.addColorStop(0, `rgba(2,132,199,${a})`);
          g.addColorStop(1, `rgba(2,132,199,0)`);
        } else {
          g.addColorStop(0, `rgba(245,158,11,${a})`);
          g.addColorStop(1, `rgba(245,158,11,0)`);
        }
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
        ctx.fillStyle = g; ctx.fill();
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.hue === 200 ? `rgba(2,132,199,${a * 1.5})` : `rgba(245,158,11,${a * 1.5})`;
        ctx.fill();
      });

      // Connection lines
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 120) {
            const lineA = (1 - d / 120) * 0.09;
            ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(2,132,199,${lineA})`; ctx.lineWidth = 0.8; ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    const onResize = () => { W = cv.width = window.innerWidth; H = cv.height = window.innerHeight; };
    window.addEventListener('resize', onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); };
  }, []);
  return <canvas ref={ref} className="absolute inset-0 pointer-events-none" />;
}

/* ── Meteor streaks ──────────────────────────────────────────────── */
function Meteors() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext('2d')!;
    let W = cv.width = window.innerWidth, H = cv.height = window.innerHeight;
    let raf: number;
    type M = { x: number; y: number; len: number; speed: number; alpha: number; active: boolean; hue: number };
    const meteors: M[] = [];
    let nextM = 60;
    const spawn = () => meteors.push({
      x: 60 + Math.random() * (W * 0.75), y: -20,
      len: 120 + Math.random() * 120, speed: 8 + Math.random() * 8,
      alpha: 0.9, active: true, hue: Math.random() > 0.45 ? 200 : 38,
    });

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      nextM--; if (nextM <= 0) { spawn(); nextM = 100 + Math.floor(Math.random() * 160); }
      meteors.forEach(m => {
        if (!m.active) return;
        m.x += m.speed * 0.55; m.y += m.speed;
        m.alpha -= 0.011;
        if (m.alpha <= 0 || m.y > H) { m.active = false; return; }
        // Tail gradient
        const g = ctx.createLinearGradient(m.x, m.y, m.x - m.len * 0.5, m.y - m.len);
        const c = m.hue === 200;
        g.addColorStop(0, c ? `rgba(2,132,199,${m.alpha * 0.85})` : `rgba(245,158,11,${m.alpha * 0.85})`);
        g.addColorStop(0.5, c ? `rgba(2,132,199,${m.alpha * 0.25})` : `rgba(245,158,11,${m.alpha * 0.25})`);
        g.addColorStop(1, c ? 'rgba(2,132,199,0)' : 'rgba(245,158,11,0)');
        ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(m.x - m.len * 0.5, m.y - m.len);
        ctx.strokeStyle = g; ctx.lineWidth = 2.5; ctx.stroke();

        // Glowing head
        const head = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, 7);
        head.addColorStop(0, c ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,1)');
        head.addColorStop(0.3, c ? `rgba(2,132,199,${m.alpha})` : `rgba(245,158,11,${m.alpha})`);
        head.addColorStop(1, c ? 'rgba(2,132,199,0)' : 'rgba(245,158,11,0)');
        ctx.beginPath(); ctx.arc(m.x, m.y, 7, 0, Math.PI * 2);
        ctx.fillStyle = head; ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    const r = () => { W = cv.width = window.innerWidth; H = cv.height = window.innerHeight; };
    window.addEventListener('resize', r);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', r); };
  }, []);
  return <canvas ref={ref} className="absolute inset-0 pointer-events-none" />;
}

/* ── Animated counter ─────────────────────────────────────────────── */
function Counter({ to, suffix = '', dec = 0 }: { to: number; suffix?: string; dec?: number }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!to) return;
    const dur = 2400, step = to / (dur / 16);
    let cur = 0;
    const t = setInterval(() => {
      cur += step;
      if (cur >= to) { setV(to); clearInterval(t); } else setV(cur);
    }, 16);
    return () => clearInterval(t);
  }, [to]);
  return <>{dec ? v.toFixed(dec) : Math.floor(v)}{suffix}</>;
}

/* ── Typing text ──────────────────────────────────────────────────── */
function Typing({ text, delay = 0 }: { text: string; delay?: number }) {
  const [shown, setShown] = useState('');
  const [done, setDone] = useState(false);
  useEffect(() => {
    const t0 = setTimeout(() => {
      let i = 0;
      const t = setInterval(() => {
        i++; setShown(text.slice(0, i));
        if (i >= text.length) { setDone(true); clearInterval(t); }
      }, 30);
      return () => clearInterval(t);
    }, delay);
    return () => clearTimeout(t0);
  }, [text, delay]);
  return <>{shown}{!done && <motion.span className="text-primary" animate={{ opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity }}>|</motion.span>}</>;
}

/* ── Main page ────────────────────────────────────────────────────── */
export default function Home() {
  const mx = useMotionValue(-400), my = useMotionValue(-400);
  const sx = useSpring(mx, { stiffness: 200, damping: 26 });
  const sy = useSpring(my, { stiffness: 200, damping: 26 });
  const { data: summary } = useGetSolarSummary({ query: { refetchInterval: 60000 } });

  useEffect(() => {
    const h = (e: MouseEvent) => { mx.set(e.clientX - 200); my.set(e.clientY - 200); };
    window.addEventListener('mousemove', h);
    return () => window.removeEventListener('mousemove', h);
  }, []);

  const stats = [
    { label: 'PREDICTION ACCURACY', val: summary?.predictionAccuracy ?? 87.4, suf: '%', dec: 1 },
    { label: 'EVENTS DETECTED', val: summary?.totalEventsDetected ?? 15, suf: '', dec: 0 },
    { label: 'AVG LEAD TIME', val: summary?.averageLeadTime ?? 18.5, suf: 'min', dec: 1 },
    { label: 'ACTIVE ALERTS', val: summary?.activeAlerts ?? 2, suf: '', dec: 0 },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center">

      {/* Full-viewport animated particle network */}
      <ParticleField />
      <Meteors />

      {/* Soft pastel nebula blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div className="absolute w-[750px] h-[550px] rounded-full blur-3xl opacity-20"
          style={{ background: 'radial-gradient(ellipse, #BAE6FD, transparent)', top: '3%', left: '52%' }}
          animate={{ x: [0, 45, 0], y: [0, -30, 0] }} transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.div className="absolute w-[650px] h-[650px] rounded-full blur-3xl opacity-14"
          style={{ background: 'radial-gradient(ellipse, #FDE68A, transparent)', top: '42%', left: '-10%' }}
          animate={{ x: [0, 28, 0], y: [0, 38, 0] }} transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.div className="absolute w-[950px] h-[750px] rounded-full blur-3xl opacity-08"
          style={{ background: 'radial-gradient(ellipse, #DDD6FE, transparent)', top: '12%', left: '18%' }}
          animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 20, repeat: Infinity }} />
        <motion.div className="absolute w-[450px] h-[450px] rounded-full blur-2xl opacity-12"
          style={{ background: 'radial-gradient(ellipse, #FED7AA, transparent)', bottom: '8%', right: '8%' }}
          animate={{ scale: [1, 1.2, 1], rotate: [0, 25, 0] }} transition={{ duration: 15, repeat: Infinity }} />
      </div>

      {/* Animated grid */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(2,132,199,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(2,132,199,0.055) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

      {/* Mouse-follow glow */}
      <motion.div className="fixed pointer-events-none z-50 w-[400px] h-[400px] rounded-full"
        style={{
          x: sx, y: sy,
          background: 'radial-gradient(circle, rgba(2,132,199,0.12) 0%, rgba(245,158,11,0.05) 45%, transparent 70%)',
        }} />

      {/* Animated Sun — positioned above text */}
      <div className="absolute pointer-events-none" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -63%)', width: 640, height: 640 }}>
        {/* Expanding pulse rings behind the sun */}
        {[0, 1, 2, 3].map(i => (
          <motion.div key={i}
            className="absolute rounded-full border border-sky-300/25"
            style={{ inset: -i * 22 }}
            animate={{ scale: [1, 1 + (i + 1) * 0.15], opacity: [0.5, 0] }}
            transition={{ duration: 2.8 + i * 0.7, repeat: Infinity, delay: i * 0.55, ease: 'easeOut' }}
          />
        ))}
        <AnimatedSun />
      </div>

      {/* Hero copy */}
      <div className="relative z-10 flex flex-col items-center text-center" style={{ marginTop: '16rem' }}>
        <motion.div initial={{ opacity: 0, y: -28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.15 }}>
          <p className="font-data text-xs tracking-[0.55em] text-primary/60 mb-3 uppercase">ISRO Aditya-L1 Mission Intelligence</p>
          <h1 className="text-8xl md:text-[9rem] font-heading text-primary tracking-widest leading-none"
            style={{ textShadow: '0 0 30px rgba(2,132,199,0.22), 0 0 70px rgba(2,132,199,0.10)' }}>
            HELIOS
          </h1>
          <h2 className="text-xl md:text-2xl font-heading text-slate-400 tracking-[0.35em] mt-2">PROJECT</h2>
        </motion.div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
          className="font-data text-slate-500 tracking-wide mt-5 max-w-xl text-sm leading-relaxed px-6">
          <Typing text="Combining Soft X-Ray and Hard X-Ray Intelligence to Predict Solar Storms Before They Happen." delay={1100} />
        </motion.p>

        {/* CTA buttons */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.8 }}
          className="flex flex-wrap justify-center gap-3 mt-8">
          <Link href="/dashboard">
            <motion.div whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(2,132,199,0.32)' }} whileTap={{ scale: 0.97 }}
              className="glass-panel px-8 py-3 rounded-full font-heading text-sm text-primary cursor-pointer border border-primary/45 select-none transition-all duration-300">
              LAUNCH MISSION CONTROL
            </motion.div>
          </Link>
          <Link href="/forecasting">
            <motion.div whileHover={{ scale: 1.05, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }} whileTap={{ scale: 0.97 }}
              className="glass-panel px-8 py-3 rounded-full font-heading text-sm text-slate-600 cursor-pointer border border-slate-300/60 select-none">
              EXPLORE AI FORECAST
            </motion.div>
          </Link>
          <Link href="/mission">
            <motion.div whileHover={{ scale: 1.05, boxShadow: '0 0 28px rgba(245,158,11,0.25)' }} whileTap={{ scale: 0.97 }}
              className="glass-panel px-8 py-3 rounded-full font-heading text-sm text-amber-600 cursor-pointer border border-amber-400/45 select-none">
              ABOUT ADITYA-L1
            </motion.div>
          </Link>
        </motion.div>

        {/* Animated stat counters */}
        <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8 px-4">
          {stats.map((s, i) => (
            <motion.div key={s.label}
              whileHover={{ y: -6, boxShadow: '0 14px 44px rgba(2,132,199,0.20)' }}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.35 + i * 0.1 }}
              className="glass-panel px-5 py-4 rounded-xl text-center border border-primary/22 cursor-default transition-all duration-300">
              <div className="text-2xl font-heading text-primary"
                style={{ textShadow: '0 0 14px rgba(2,132,199,0.28)' }}>
                <Counter to={s.val} suffix={s.suf} dec={s.dec} />
              </div>
              <div className="text-xs font-data text-slate-400 tracking-widest mt-1">{s.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Bottom status bar */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3.2 }}
        className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-5 font-data text-xs text-slate-400 whitespace-nowrap">
        <span className="flex items-center gap-1.5">
          <motion.span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"
            animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.3, repeat: Infinity }} />
          ADITYA-L1 UPLINK ACTIVE
        </span>
        <span className="text-slate-300">·</span>
        <span>SoLEXS + HEL1OS ONLINE</span>
        <span className="text-slate-300">·</span>
        <span>MODEL v2.4.1</span>
      </motion.div>
    </div>
  );
}

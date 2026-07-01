import React from 'react';
import { useGetForecasts } from '@workspace/api-client-react';
import { motion } from 'framer-motion';
import { Target } from 'lucide-react';

export default function Forecasting() {
  const { data: forecasts, isLoading } = useGetForecasts();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-heading tracking-widest text-white">AI FORECASTING</h2>
        <div className="flex gap-2">
          <span className="glass-panel px-3 py-1 rounded text-xs font-data text-secondary animate-pulse">
            NEURAL NET ONLINE
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="glass-panel p-12 text-center rounded-xl font-data text-primary animate-pulse">
          PROCESSING PREDICTIONS...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {forecasts?.map((forecast, i) => (
            <motion.div 
              key={forecast.horizonMinutes}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="glass-panel rounded-xl p-6 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-100 transition-opacity text-primary">
                <Target className="w-8 h-8" />
              </div>
              
              <div className="text-sm font-data text-slate-400 mb-4">{forecast.horizonMinutes} MINUTE HORIZON</div>
              
              <div className="relative w-32 h-32 mx-auto mb-6">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
                  <motion.circle 
                    cx="50" cy="50" r="45" fill="none" 
                    stroke={forecast.probability > 75 ? '#EF4444' : forecast.probability > 40 ? '#FF8C00' : '#00E5FF'} 
                    strokeWidth="4" 
                    strokeDasharray="283"
                    initial={{ strokeDashoffset: 283 }}
                    animate={{ strokeDashoffset: 283 - (283 * forecast.probability) / 100 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-2xl font-heading text-white">{Math.round(forecast.probability)}%</div>
                  <div className="text-[10px] font-data text-slate-500">PROBABILITY</div>
                </div>
              </div>

              <div className="space-y-3 font-data text-sm">
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-slate-400">EXPECTED CLASS</span>
                  <span className={forecast.expectedClass.startsWith('X') ? 'text-red-500' : forecast.expectedClass.startsWith('M') ? 'text-orange-500' : 'text-primary'}>
                    {forecast.expectedClass}
                  </span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-slate-400">EST. PEAK</span>
                  <span className="text-white">{forecast.estimatedPeak}</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-slate-400">CONFIDENCE</span>
                  <span className="text-white">{forecast.confidence}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">TREND</span>
                  <span className={forecast.trend === 'increasing' ? 'text-red-500' : forecast.trend === 'decreasing' ? 'text-green-500' : 'text-primary'}>
                    {forecast.trend.toUpperCase()}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

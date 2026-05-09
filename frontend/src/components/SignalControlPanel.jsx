import { motion } from 'framer-motion'
import { RadioTower, TimerReset } from 'lucide-react'
import { statusColor } from '../utils/map'

export default function SignalControlPanel({ intersections, priorityEnabled }) {
  return (
    <motion.section
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="pointer-events-auto rounded-2xl border border-cyan-300/20 bg-slate-950/72 p-4 shadow-neon backdrop-blur-xl"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/60">Smart Signal Prediction</p>
          <h2 className="text-lg font-semibold text-white">Green Wave Control</h2>
        </div>
        <div className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
          {priorityEnabled ? 'Auto 200m Priority' : 'Manual Mode'}
        </div>
      </div>
      <p className="mb-4 text-sm leading-6 text-slate-400">
        Traffic signals will transition to GREEN automatically when the ambulance enters a 200m activation radius around a junction.
      </p>
      <div className="max-h-[38vh] space-y-2 overflow-y-auto pr-1">
        {(intersections || []).map((signal) => (
          <div key={signal.id} className="rounded-xl border border-white/10 bg-white/[0.055] p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ background: statusColor(signal.state), boxShadow: `0 0 20px ${statusColor(signal.state)}` }}
                />
                <div>
                  <p className="text-sm font-semibold text-white">{signal.name}</p>
                  <p className="text-xs text-slate-400">{signal.id} · {Math.round(signal.distance_to_ambulance_m)}m</p>
                </div>
              </div>
              <div className="text-right">
                <p className={signal.state === 'GREEN' ? 'text-sm font-bold text-emerald-200' : 'text-sm font-bold text-cyan-100'}>
                  {signal.state}
                </p>
                <p className="flex items-center justify-end gap-1 text-xs text-slate-400">
                  <TimerReset className="h-3 w-3" />
                  {signal.countdown}s
                </p>
              </div>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-800">
              <motion.div
                animate={{ width: `${Math.min(100, Math.max(8, 100 - signal.distance_to_ambulance_m / 7))}%` }}
                className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300"
              />
            </div>
          </div>
        ))}
      </div>
    </motion.section>
  )
}

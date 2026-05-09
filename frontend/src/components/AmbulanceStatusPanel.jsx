import { motion } from 'framer-motion'
import { Activity, CheckCircle2, MapPin, Signal, Timer } from 'lucide-react'

function trafficDescriptor(score) {
  if (score >= 75) return 'Heavy congestion'
  if (score >= 50) return 'Moderate traffic'
  if (score >= 25) return 'Light traffic'
  return 'Free-flowing corridor'
}

export default function AmbulanceStatusPanel({ ambulance, intersections, metrics }) {
  const nearestSignal = (intersections || []).reduce((best, signal) => {
    if (!signal || signal.distance_to_ambulance_m == null) return best
    if (!best || signal.distance_to_ambulance_m < best.distance_to_ambulance_m) return signal
    return best
  }, null)

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="pointer-events-auto rounded-2xl border border-cyan-300/20 bg-slate-950/72 p-4 shadow-neon backdrop-blur-xl"
    >
      <div className="mb-3 flex items-center gap-2">
        <Activity className="h-5 w-5 text-cyan-200" />
        <h2 className="text-lg font-semibold text-white">Ambulance Status</h2>
      </div>

      {!ambulance ? (
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-300">
          No active ambulance dispatch. Select a start and destination, then dispatch the emergency corridor.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-4 text-sm text-slate-200">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/70">Current position</p>
                <p className="mt-2 text-sm text-white">
                  {ambulance.lat.toFixed(4)}, {ambulance.lng.toFixed(4)}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-900/80 px-3 py-2 text-xs uppercase tracking-[0.24em] text-emerald-200">
                {Math.round((ambulance.progress || 0) * 100)}% along route
              </div>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              <div className="rounded-2xl bg-slate-950/90 px-3 py-3">
                <p className="text-[10px] uppercase tracking-[0.28em] text-slate-400">Speed</p>
                <p className="mt-2 text-lg font-semibold text-white">{ambulance.speed_kmph || 0} km/h</p>
              </div>
              <div className="rounded-2xl bg-slate-950/90 px-3 py-3">
                <p className="text-[10px] uppercase tracking-[0.28em] text-slate-400">Optimized ETA</p>
                <p className="mt-2 text-lg font-semibold text-white">{metrics.optimized_eta_min ?? 0} min</p>
              </div>
              <div className="rounded-2xl bg-slate-950/90 px-3 py-3">
                <p className="text-[10px] uppercase tracking-[0.28em] text-slate-400">Traffic level</p>
                <p className="mt-2 text-lg font-semibold text-white">{metrics.congestion_score ?? 0}%</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-200">
            <div className="flex items-center gap-2 text-cyan-200">
              <Signal className="h-4 w-4" />
              <p className="text-xs uppercase tracking-[0.24em]">Nearest signal</p>
            </div>
            {nearestSignal ? (
              <div className="mt-3 space-y-2">
                <p className="text-base font-semibold text-white">{nearestSignal.name}</p>
                <p className="text-sm text-slate-400">
                  Status: <span className="font-semibold text-white">{nearestSignal.state}</span>
                </p>
                <p className="text-sm text-slate-400">
                  Distance to ambulance: <span className="font-semibold text-white">{Math.round(nearestSignal.distance_to_ambulance_m)} m</span>
                </p>
                <p className="text-sm text-slate-400">
                  Next change: <span className="font-semibold text-white">{nearestSignal.countdown}s</span>
                </p>
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-400">No intersection data available yet.</p>
            )}
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-200">
            <div className="flex items-center gap-2 text-cyan-200">
              <Timer className="h-4 w-4" />
              <p className="text-xs uppercase tracking-[0.24em]">Arrival outlook</p>
            </div>
            <p className="mt-3 text-sm text-slate-400">
              {trafficDescriptor(metrics.congestion_score)} on the active corridor.
            </p>
            <div className="mt-3 flex items-center gap-2 rounded-2xl bg-slate-950/90 px-3 py-3">
              <CheckCircle2 className="h-4 w-4 text-emerald-300" />
              <p className="text-sm text-white">
                {metrics.route_confidence >= 70 ? 'Likely to arrive in estimated time.' : 'Monitoring corridor progress closely.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </motion.section>
  )
}

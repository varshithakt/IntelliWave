import { motion } from 'framer-motion'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Activity, Gauge, GitPullRequestArrow, Route, Timer, Waves, Zap } from 'lucide-react'
import { metricPop, stagger } from '../animations/variants'

const metricConfig = [
  ['Normal ETA', 'normal_eta_min', 'min', Timer],
  ['Optimized ETA', 'optimized_eta_min', 'min', Zap],
  ['ETA Reduction', 'eta_reduction_pct', '%', Waves],
  ['Active Signals', 'active_signals', '', Activity],
  ['Vehicles Rerouted', 'vehicles_rerouted', '', GitPullRequestArrow],
  ['Congestion', 'congestion_score', '/100', Gauge],
  ['AI Efficiency', 'ai_efficiency', '%', CpuIcon],
  ['Corridor Length', 'corridor_length_km', 'km', Route],
]

function CpuIcon(props) {
  return <Gauge {...props} />
}

export default function AnalyticsSidebar({ metrics, series }) {
  return (
    <motion.aside variants={stagger} initial="hidden" animate="show" className="pointer-events-auto space-y-3">
      <div className="rounded-2xl border border-cyan-300/20 bg-slate-950/72 p-4 shadow-neon backdrop-blur-xl">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/60">Realtime Analytics</p>
            <h2 className="text-lg font-semibold text-white">Emergency AI Telemetry</h2>
          </div>
          <span className="rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">
            {metrics.route_confidence || 0}% confidence
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {metricConfig.map(([label, key, suffix, Icon]) => (
            <motion.div key={key} variants={metricPop} className="rounded-xl border border-white/10 bg-white/[0.055] p-3">
              <div className="mb-2 flex items-center justify-between text-slate-400">
                <span className="text-[11px] uppercase tracking-[0.16em]">{label}</span>
                <Icon className="h-4 w-4 text-cyan-200" />
              </div>
              <p className="text-2xl font-semibold text-white">
                {metrics[key] ?? 0}
                <span className="ml-1 text-xs font-medium text-slate-400">{suffix}</span>
              </p>
            </motion.div>
          ))}
        </div>
      </div>
      <div className="h-52 rounded-2xl border border-cyan-300/20 bg-slate-950/72 p-4 shadow-neon backdrop-blur-xl">
        <p className="mb-2 text-xs uppercase tracking-[0.24em] text-cyan-200/60">Predictive Traffic Analysis</p>
        <ResponsiveContainer width="100%" height="84%">
          <AreaChart data={series}>
            <defs>
              <linearGradient id="efficiency" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.7} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="congestion" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.7} />
                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="tick" hide />
            <YAxis hide domain={[0, 100]} />
            <Tooltip contentStyle={{ background: '#020617', border: '1px solid rgba(34,211,238,.3)', color: '#fff' }} />
            <Area type="monotone" dataKey="efficiency" stroke="#22c55e" fill="url(#efficiency)" strokeWidth={2} />
            <Area type="monotone" dataKey="congestion" stroke="#22d3ee" fill="url(#congestion)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.aside>
  )
}

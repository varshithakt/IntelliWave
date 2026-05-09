import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Activity, ArrowUpRight, Smile } from 'lucide-react'

export default function TrafficWavePanel({ series, active }) {
  const current = series?.[series.length - 1] || { congestion: 24, efficiency: 68, eta: 0 }

  return (
    <section className="pointer-events-auto rounded-[32px] border border-cyan-300/20 bg-slate-950/90 p-5 shadow-neon backdrop-blur-xl">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.26em] text-cyan-200/70">Traffic Wave</p>
          <h2 className="text-2xl font-semibold text-white">Route Flow & Ambulance Pulse</h2>
        </div>
        <div className="flex items-center gap-3 rounded-3xl bg-slate-900/70 px-4 py-3 text-sm text-cyan-100 ring-1 ring-cyan-300/20">
          <Smile className="h-5 w-5 text-emerald-300" />
          {active ? 'Live corridor engaged' : 'Select dispatch route'}
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-[1fr_184px]">
        <div className="order-2 rounded-3xl border border-white/10 bg-white/[0.05] p-4 text-sm text-slate-300 sm:order-1">
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/70">Traffic Level</p>
          <p className="mt-3 text-4xl font-semibold text-white">{current.congestion}%</p>
          <p className="mt-2 text-sm text-slate-400">AI efficiency {current.efficiency}% · ETA {current.eta}m</p>
        </div>
        <div className="order-1 rounded-3xl border border-white/10 bg-white/[0.05] p-4 text-center text-sm text-slate-200 sm:order-2">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-cyan-300/10 text-cyan-200 shadow-[0_0_18px_rgba(34,211,238,0.16)]">🚑</span>
          <p className="mt-3 text-base font-semibold text-white">Ambulance preview</p>
          <p className="mt-2 text-slate-400">Tap dispatch to animate the corridor.</p>
        </div>
      </div>
      <div className="mt-5 h-64 rounded-3xl border border-white/10 bg-slate-950/80 p-3">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={series.length ? series : [{ tick: 0, congestion: 18, efficiency: 58, eta: 10 }]}> 
            <defs>
              <linearGradient id="congestionWave" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <XAxis dataKey="tick" hide />
            <YAxis hide domain={[0, 100]} />
            <Tooltip
              contentStyle={{ background: '#020617', border: '1px solid rgba(34,211,238,0.25)', color: '#fff' }}
            />
            <Area type="monotone" dataKey="congestion" stroke="#22d3ee" fill="url(#congestionWave)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-5 flex items-center justify-between rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-4 text-slate-300">
        <div className="flex items-center gap-3">
          <Activity className="h-5 w-5 text-cyan-200" />
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/70">Live Trend</p>
            <p className="text-sm text-white">Moving with the emergency corridor</p>
          </div>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-cyan-300/10 px-3 py-2 text-xs uppercase tracking-[0.24em] text-cyan-200">
          <ArrowUpRight className="h-4 w-4" />
          Traffic clearance mode
        </div>
      </div>
    </section>
  )
}

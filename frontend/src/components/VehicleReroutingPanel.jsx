import { motion } from 'framer-motion'
import { Car, GitBranch, MoveRight, Ambulance } from 'lucide-react'

export default function VehicleReroutingPanel({ vehicles, onTrackVehicle, trackedVehicleId, ambulances, onTrackAmbulance, trackedAmbulanceId }) {
  const stats = vehicles.reduce(
    (acc, vehicle) => {
      acc[vehicle.status] = (acc[vehicle.status] || 0) + 1
      return acc
    },
    { FLOWING: 0, ALERTED: 0, REROUTING: 0, CLEARED: 0 },
  )

  return (
    <motion.section
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.08 }}
      className="pointer-events-auto rounded-2xl border border-cyan-300/20 bg-slate-950/72 p-4 shadow-neon backdrop-blur-xl"
    >
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/60">Vehicle Rerouting System</p>
          <h2 className="text-lg font-semibold text-white">Lane Conflict Manager</h2>
        </div>
        <GitBranch className="h-5 w-5 text-cyan-200" />
      </div>
      <div className="grid grid-cols-4 gap-2">
        {Object.entries(stats).map(([label, value]) => (
          <div key={label} className="rounded-xl border border-white/10 bg-white/[0.055] p-2 text-center">
            <p className="text-lg font-semibold text-white">{value}</p>
            <p className="text-[10px] uppercase tracking-[0.12em] text-slate-400">{label}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 space-y-2">
        {vehicles.slice(0, 5).map((vehicle) => (
          <div key={vehicle.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.045] px-3 py-2">
            <div className="flex items-center gap-2 text-sm text-slate-200">
              <Car className="h-4 w-4 text-cyan-200" />
              <div>
                <div className="font-semibold text-white">{vehicle.id}</div>
                <div className="text-xs text-slate-400">{vehicle.status} · {Math.round(vehicle.lat * 100) / 100}, {Math.round(vehicle.lng * 100) / 100}</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onTrackVehicle(vehicle.id)}
              className={`rounded-full px-3 py-2 text-xs font-semibold uppercase transition ${trackedVehicleId === vehicle.id ? 'bg-emerald-400/20 text-emerald-200 border border-emerald-300/40' : 'bg-white/5 text-slate-200 hover:bg-white/10'}`}
            >
              {trackedVehicleId === vehicle.id ? 'Tracking' : 'Track'}
            </button>
          </div>
        ))}
      </div>
      {ambulances?.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/60">Ambulance Fleet</p>
          {ambulances.map((ambulance) => (
            <div key={ambulance.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.045] px-3 py-2">
              <div className="flex items-center gap-2 text-sm text-slate-200">
                <Ambulance className="h-4 w-4 text-red-400" />
                <div>
                  <div className="font-semibold text-white">{ambulance.id}</div>
                  <div className="text-xs text-slate-400">{Math.round(ambulance.progress * 100)}% · {Math.round(ambulance.lat * 100) / 100}, {Math.round(ambulance.lng * 100) / 100}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onTrackAmbulance(ambulance.id)}
                className={`rounded-full px-3 py-2 text-xs font-semibold uppercase transition ${trackedAmbulanceId === ambulance.id ? 'bg-red-400/20 text-red-200 border border-red-300/40' : 'bg-white/5 text-slate-200 hover:bg-white/10'}`}
              >
                {trackedAmbulanceId === ambulance.id ? 'Tracking' : 'Track'}
              </button>
            </div>
          ))}
        </div>
      )}
    </motion.section>
  )
}

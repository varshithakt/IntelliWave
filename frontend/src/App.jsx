import { useMemo, useState } from 'react'
import AIInsightsPanel from './components/AIInsightsPanel'
import AmbulanceFleetPanel, { createDefaultAmbulances, diseasePriority } from './components/AmbulanceFleetPanel'
import AmbulanceStatusPanel from './components/AmbulanceStatusPanel'
import AnalyticsSidebar from './components/AnalyticsSidebar'
import DispatchControl from './components/DispatchControl'
import LiveActivityFeed from './components/LiveActivityFeed'
import LiveCityMap from './components/LiveCityMap'
import Navbar from './components/Navbar'
import SignalControlPanel from './components/SignalControlPanel'
import VehicleReroutingPanel from './components/VehicleReroutingPanel'
import { useIntelliWaveSocket } from './hooks/useIntelliWaveSocket'
import { dispatchEmergency, requestReroute } from './services/api'

const destinationLocations = [
  { id: 'trauma-hub', label: 'Trauma Care Hub', lat: 12.9542, lng: 77.4908 },
  { id: 'super-hospital', label: 'Bengaluru Super Hospital', lat: 12.925, lng: 77.5869 },
  { id: 'city-gate', label: 'City Emergency Gate', lat: 12.9418, lng: 77.6151 },
  { id: 'apollo-hospital', label: 'Apollo Emergency Center', lat: 12.9612, lng: 77.6387 },
  { id: 'manipal-hospital', label: 'Manipal City Hospital', lat: 12.949, lng: 77.5238 },
]

export default function App() {
  const { connected, snapshot, setSnapshot, series, setSeries } = useIntelliWaveSocket()
  const [loading, setLoading] = useState(false)
  const [fleetAmbulances, setFleetAmbulances] = useState(createDefaultAmbulances)
  const [trackedAmbulanceId, setTrackedAmbulanceId] = useState('AMB-001')
  const [trackedVehicleId, setTrackedVehicleId] = useState(null)
  const [destinationPoint, setDestinationPoint] = useState(destinationLocations[2])

  const trackedAmbulance = fleetAmbulances.find((ambulance) => ambulance.id === trackedAmbulanceId) || fleetAmbulances[0]
  const priorityOrder = useMemo(
    () => [...fleetAmbulances].sort((a, b) => diseasePriority[b.disease] - diseasePriority[a.disease]),
    [fleetAmbulances],
  )
  const startPoint = useMemo(() => ({
    id: trackedAmbulance.id,
    label: `${trackedAmbulance.id} - ${trackedAmbulance.name}`,
    lat: trackedAmbulance.lat,
    lng: trackedAmbulance.lng,
  }), [trackedAmbulance])

  const mapSnapshot = useMemo(() => {
    const liveAmbulances = snapshot.ambulances || []
    const liveById = Object.fromEntries(liveAmbulances.map((ambulance) => [ambulance.id, ambulance]))
    const ambulances = fleetAmbulances.map((ambulance) => ({
      ...ambulance,
      progress: liveById[ambulance.id]?.progress ?? 0,
      route_index: liveById[ambulance.id]?.route_index ?? 0,
      speed_kmph: liveById[ambulance.id]?.speed_kmph ?? 0,
      eta_seconds: liveById[ambulance.id]?.eta_seconds ?? 0,
      lat: liveById[ambulance.id]?.lat ?? ambulance.lat,
      lng: liveById[ambulance.id]?.lng ?? ambulance.lng,
    }))
    return { ...snapshot, ambulances }
  }, [snapshot, fleetAmbulances])

  async function handleDispatch() {
    setLoading(true)
    try {
      const response = await dispatchEmergency({ start: startPoint, destination: destinationPoint })
      const liveAmbulance = response.ambulance ? { id: trackedAmbulance.id, ...response.ambulance } : null
      setSnapshot((current) => ({
        ...current,
        ...response,
        ambulances: liveAmbulance ? [liveAmbulance] : current.ambulances,
        events: [...(response.events || []), `${trackedAmbulance.id} dispatched from ${trackedAmbulance.name}`],
      }))
      if (response.metrics) {
        setSeries((current) => [
          ...current,
          {
            tick: current.length + 1,
            congestion: response.metrics.congestion_score,
            efficiency: response.metrics.ai_efficiency,
            eta: response.metrics.optimized_eta_min,
          },
        ].slice(-26))
      }
    } catch {
      setSnapshot((current) => ({
        ...current,
        events: [...(current.events || []), 'Dispatch failed - check backend status'],
      }))
    } finally {
      setLoading(false)
    }
  }

  async function handleReroute() {
    await requestReroute()
  }

  const activeAmbulance = mapSnapshot.ambulances.find((ambulance) => ambulance.id === trackedAmbulanceId)
  const active = Boolean(activeAmbulance && activeAmbulance.progress > 0 && activeAmbulance.progress < 1)

  return (
    <main className="min-h-screen bg-void text-white">
      <div className="mx-auto flex min-h-screen max-w-screen-2xl flex-col gap-4 p-4 lg:p-5">
        <Navbar connected={connected} dispatchId={snapshot.dispatch_id} />

        <section className="grid gap-4 lg:grid-cols-[380px_minmax(0,1fr)]">
          <div className="space-y-4">
            <AmbulanceFleetPanel
              ambulances={fleetAmbulances}
              setAmbulances={setFleetAmbulances}
              trackedAmbulanceId={trackedAmbulanceId}
              onTrackAmbulance={setTrackedAmbulanceId}
            />
            <DispatchControl
              onDispatch={handleDispatch}
              onReroute={handleReroute}
              loading={loading}
              active={active}
              startPoint={startPoint}
              destinationPoint={destinationPoint}
              setStartPoint={() => {}}
              setDestinationPoint={setDestinationPoint}
              startLocations={[startPoint]}
              destinationLocations={destinationLocations}
              activeDisease={trackedAmbulance.disease}
              priorityScore={diseasePriority[trackedAmbulance.disease]}
            />
          </div>

          <div className="min-h-[620px]">
            <LiveCityMap
              snapshot={mapSnapshot}
              startPoint={startPoint}
              destinationPoint={destinationPoint}
              trackedVehicleId={trackedVehicleId}
              trackedAmbulanceId={trackedAmbulanceId}
            />
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[360px_1fr_390px]">
          <AnalyticsSidebar metrics={snapshot.metrics} series={series} />
          <div className="space-y-4">
            <SignalControlPanel intersections={snapshot.intersections || []} priorityEnabled />
            <VehicleReroutingPanel
              vehicles={snapshot.vehicles || []}
              onTrackVehicle={setTrackedVehicleId}
              trackedVehicleId={trackedVehicleId}
              ambulances={mapSnapshot.ambulances}
              onTrackAmbulance={setTrackedAmbulanceId}
              trackedAmbulanceId={trackedAmbulanceId}
            />
          </div>
          <div className="space-y-4">
            <AIInsightsPanel metrics={snapshot.metrics} />
            <AmbulanceStatusPanel
              ambulance={activeAmbulance}
              intersections={snapshot.intersections || []}
              metrics={snapshot.metrics}
            />
            <LiveActivityFeed events={snapshot.events || []} />
          </div>
        </section>
      </div>
    </main>
  )
}

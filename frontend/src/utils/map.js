import L from 'leaflet'

export const bengaluruCenter = [12.9607, 77.6047]

export function toLatLng(point) {
  return [point.lat, point.lng]
}

export function routeBounds(route) {
  if (!route?.length) return L.latLngBounds([bengaluruCenter, bengaluruCenter])
  return L.latLngBounds(route.map(toLatLng)).pad(0.18)
}

export function divIcon(className, html, size = [34, 34]) {
  return L.divIcon({
    className,
    html,
    iconSize: size,
    iconAnchor: [size[0] / 2, size[1] / 2],
  })
}

export function statusColor(status) {
  if (status === 'GREEN' || status === 'CLEARED') return '#22c55e'
  if (status === 'PREDICTED' || status === 'REROUTING') return '#22d3ee'
  if (status === 'ALERTED') return '#facc15'
  return '#64748b'
}

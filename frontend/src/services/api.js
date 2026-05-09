export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
export const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws'

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  })
  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Request failed: ${response.status} ${response.statusText} - ${text}`)
  }
  return response.json()
}

export function dispatchEmergency(payload = {}) {
  return request('/dispatch', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function requestReroute() {
  return request('/reroute', { method: 'POST' })
}

export function getOptimization() {
  return request('/optimize')
}

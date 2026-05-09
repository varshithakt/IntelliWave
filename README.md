# IntelliWave AI

AI-Powered Emergency Green Corridor System for smart-city emergency traffic orchestration.

## What It Simulates

IntelliWave AI dispatches an ambulance through real Bengaluru roads, fetches an OSRM route, predicts congestion, synchronizes intersections, reroutes civilian vehicles, and streams the entire emergency corridor state over WebSockets to a cinematic digital twin dashboard.

## Stack

- Frontend: React, Vite, TailwindCSS, Framer Motion, React Leaflet, Socket.IO Client dependency, Recharts, Lucide React
- Backend: FastAPI, Python async services, WebSockets, OSRM routing integration, TomTom traffic integration structure via environment key
- Map: OpenStreetMap tiles with Leaflet rendering



IntelliWave AI is a futuristic smart-city emergency traffic orchestration platform designed to create dynamic AI-powered green corridors for ambulances using real-time traffic analysis, predictive signal coordination, and live route optimization.

The system uses real-world routing data from OpenStreetMap + OSRM to simulate intelligent traffic signal synchronization where intersections automatically turn green as an ambulance approaches within 200 meters. Nearby civilian vehicles are rerouted dynamically to clear congestion and reduce emergency response time.

Built with React, FastAPI, WebSockets, Leaflet, and AI-based traffic optimization logic, IntelliWave AI visualizes a realtime digital twin of urban traffic infrastructure through cinematic dashboards, animated maps, live congestion heatmaps, and intelligent emergency routing.

✨ Features
🚦 AI-powered smart signal coordination
🚑 Dynamic green corridor generation
🗺️ Real-world route optimization using OSRM
📡 Realtime ambulance tracking
🚗 Nearby vehicle rerouting simulation
📊 Live congestion analytics dashboard
⚡ WebSocket-powered realtime updates
🌐 Interactive smart-city digital twin map
🎨 Futuristic cyberpunk-inspired UI
📈 ETA prediction and optimization
🛠️ Tech Stack

Frontend:

React + Vite
TailwindCSS
Framer Motion
React Leaflet
Recharts

Backend:

FastAPI
Python
WebSockets
OSRM Routing API

Maps & Traffic:

OpenStreetMap
Leaflet
TomTom Traffic API Structure
🚀 Goal

To reduce ambulance response delays and improve emergency mobility through intelligent AI-driven traffic orchestration and predictive signal optimization.

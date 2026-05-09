# IntelliWave AI

AI-Powered Emergency Green Corridor System for smart-city emergency traffic orchestration.

## What It Simulates

IntelliWave AI dispatches an ambulance through real Bengaluru roads, fetches an OSRM route, predicts congestion, synchronizes intersections, reroutes civilian vehicles, and streams the entire emergency corridor state over WebSockets to a cinematic digital twin dashboard.

## Stack

- Frontend: React, Vite, TailwindCSS, Framer Motion, React Leaflet, Socket.IO Client dependency, Recharts, Lucide React
- Backend: FastAPI, Python async services, WebSockets, OSRM routing integration, TomTom traffic integration structure via environment key
- Map: OpenStreetMap tiles with Leaflet rendering

## Environment

Backend:

```bash
cd backend
copy .env.example .env
```

Frontend:

```bash
cd frontend
copy .env.example .env
```

Default values:

```env
OSRM_BASE_URL=https://router.project-osrm.org
TOMTOM_API_KEY=
SIMULATION_TICK_SECONDS=0.85
AMBULANCE_SPEED_KMPH=58
VITE_API_BASE_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000/ws
```

## Install

Backend:

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

Frontend:

```bash
cd frontend
npm install
```

## Run

Terminal 1:

```bash
cd backend
.venv\Scripts\activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Terminal 2:

```bash
cd frontend
npm run dev
```

Open:

```text
http://localhost:5173
```

## API

- `POST /dispatch` starts an emergency dispatch and returns route, intersections, vehicles, ambulance state, metrics, and events.
- `GET /traffic` returns congestion score and heatmap points.
- `GET /signals` returns live signal state.
- `GET /optimize` returns AI strategy metadata.
- `POST /reroute` broadcasts a manual rerouting directive.
- `WS /ws` streams realtime snapshots.

## Notes

The app uses public OSRM routing at `https://router.project-osrm.org`. If that route call fails, the backend uses a built-in Bengaluru fallback route so the digital twin remains demoable offline or under network limits.

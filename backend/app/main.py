from __future__ import annotations

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from app.models import DispatchRequest
from app.services.simulation import SimulationEngine
from app.websocket.manager import ConnectionManager

app = FastAPI(title="IntelliWave AI", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

manager = ConnectionManager()
engine = SimulationEngine(manager)


@app.get("/")
async def root() -> dict[str, str]:
    return {"name": "IntelliWave AI", "status": "online", "mode": "emergency-green-corridor"}


@app.post("/dispatch")
async def dispatch(request: DispatchRequest) -> dict:
    response = await engine.dispatch(request)
    return response.model_dump(mode="json")


@app.get("/traffic")
async def traffic() -> dict:
    return engine.traffic_payload()


@app.get("/signals")
async def signals() -> dict:
    return {"signals": [signal.model_dump(mode="json") for signal in engine.intersections]}


@app.get("/optimize")
async def optimize() -> dict:
    return engine.optimize_payload()


@app.post("/reroute")
async def reroute() -> dict:
    snapshot = await engine.manual_reroute()
    return {"status": "accepted", "message": "Vehicle rerouting directive broadcast", "snapshot": snapshot}


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket) -> None:
    await manager.connect(websocket)
    await websocket.send_json(engine.snapshot("snapshot"))
    try:
        while True:
            message = await websocket.receive_text()
            if message.lower() in {"dispatch", "start"}:
                await engine.dispatch(DispatchRequest())
            elif message.lower() == "ping":
                await websocket.send_json({"type": "pong"})
    except WebSocketDisconnect:
        manager.disconnect(websocket)

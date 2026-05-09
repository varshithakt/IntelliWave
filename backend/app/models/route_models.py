from pydantic import BaseModel
from typing import List, Tuple

Coordinate = Tuple[float, float]

class RouteStep(BaseModel):
    name: str
    maneuver: str
    distance: float
    duration: float

class RouteGeo(BaseModel):
    distance: float
    duration: float
    geometry: List[Coordinate]
    waypoints: List[Coordinate]
    steps: List[RouteStep]

class SignalState(BaseModel):
    id: str
    location: Coordinate
    status: str
    next_change: float
    active: bool
    distance_to_ambulance: float

class VehicleAgent(BaseModel):
    id: str
    position: Coordinate
    status: str
    route: List[Coordinate]
    rerouted: bool
    eta_offset: float

class AmbulanceState(BaseModel):
    location: Coordinate
    heading: float
    progress: float
    base_eta: float
    optimized_eta: float
    corridor_score: float

class AnalyticsSnapshot(BaseModel):
    normal_eta: float
    optimized_eta: float
    reduction_pct: float
    active_signals: int
    vehicles_rerouted: int
    congestion_score: int
    ai_efficiency: int
    corridor_length: float

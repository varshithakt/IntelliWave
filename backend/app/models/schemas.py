from enum import Enum
from typing import Literal

from pydantic import BaseModel, Field


class RoutePoint(BaseModel):
    lat: float
    lng: float


class DispatchRequest(BaseModel):
    start: RoutePoint | None = None
    destination: RoutePoint | None = None


class SignalState(str, Enum):
    standby = "STANDBY"
    predicted = "PREDICTED"
    green = "GREEN"
    cooling = "COOLING"


class Intersection(BaseModel):
    id: str
    name: str
    lat: float
    lng: float
    state: SignalState = SignalState.standby
    distance_to_ambulance_m: float = 99999
    countdown: int = 0
    activation_radius_m: int = 200
    sequence_index: int = 0
    confidence: float = 0.76


class VehicleAgent(BaseModel):
    id: str
    lat: float
    lng: float
    bearing: float
    speed: float
    status: Literal["FLOWING", "ALERTED", "REROUTING", "CLEARED"] = "FLOWING"
    route: list[RoutePoint] = Field(default_factory=list)
    reroute_progress: float = 0


class AmbulanceState(BaseModel):
    id: str
    lat: float
    lng: float
    progress: float = 0
    route_index: int = 0
    speed_kmph: float = 58
    eta_seconds: int = 0
    optimized_eta_seconds: int = 0
    normal_eta_seconds: int = 0


class Metrics(BaseModel):
    normal_eta_min: float = 0
    optimized_eta_min: float = 0
    eta_reduction_pct: float = 0
    active_signals: int = 0
    vehicles_rerouted: int = 0
    congestion_score: float = 0
    ai_efficiency: float = 0
    corridor_length_km: float = 0
    route_confidence: float = 0


class DispatchResponse(BaseModel):
    dispatch_id: str
    route: list[RoutePoint]
    intersections: list[Intersection]
    vehicles: list[VehicleAgent]
    ambulances: list[AmbulanceState]
    metrics: Metrics
    events: list[str]

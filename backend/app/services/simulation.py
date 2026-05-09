from __future__ import annotations

import asyncio
import os
import uuid
from datetime import datetime, timezone
from typing import Any

from app.models import AmbulanceState, DispatchRequest, DispatchResponse, Metrics, RoutePoint
from app.services.eta import EtaPredictionService
from app.services.geo import path_length_m, point_at_distance
from app.services.routing import RoutingService
from app.services.signals import SignalOptimizationService
from app.services.traffic import TrafficAnalysisService
from app.services.vehicles import VehicleReroutingService
from app.websocket.manager import ConnectionManager


class SimulationEngine:
    def __init__(self, manager: ConnectionManager) -> None:
        self.manager = manager
        self.routing = RoutingService()
        self.signals = SignalOptimizationService()
        self.traffic = TrafficAnalysisService()
        self.vehicles = VehicleReroutingService()
        self.eta = EtaPredictionService()
        self.tick_seconds = float(os.getenv("SIMULATION_TICK_SECONDS", "0.85"))
        self.speed_kmph = float(os.getenv("AMBULANCE_SPEED_KMPH", "58"))
        self.dispatch_id: str | None = None
        self.route: list[RoutePoint] = []
        self.distance_m = 0.0
        self.intersections = []
        self.vehicle_agents = []
        self.ambulances: list[AmbulanceState] = []
        self.metrics = Metrics()
        self.events: list[str] = []
        self._task: asyncio.Task[None] | None = None
        self._running = False

    async def dispatch(self, request: DispatchRequest) -> DispatchResponse:
        route_data = await self.routing.get_route(request.start, request.destination)
        self.route = route_data["points"]
        self.distance_m = route_data["distance_m"]
        self.dispatch_id = f"IW-{uuid.uuid4().hex[:8].upper()}"
        self.intersections = self.signals.generate_intersections(self.route)
        self.vehicle_agents = self.vehicles.seed_vehicles(self.route)
        first = self.route[0]
        normal, optimized = self.eta.estimate(self.distance_m, self.speed_kmph, 58, 0)
        self.ambulances = []
        for i in range(1, 4):  # Create 3 ambulances
            ambulance_id = f"AMB-{i:03d}"
            self.ambulances.append(AmbulanceState(
                id=ambulance_id,
                lat=first.lat,
                lng=first.lng,
                speed_kmph=self.speed_kmph,
                eta_seconds=optimized,
                optimized_eta_seconds=optimized,
                normal_eta_seconds=normal,
            ))
        self.events = [
            "Emergency dispatch authorized",
            f"Route source locked: {route_data['source'].upper()}",
            "AI priority engine calculating green wave",
        ]
        traffic_snapshot = self.traffic.score(self.route, self.vehicle_agents, 0)
        self.metrics = self.traffic.metrics(normal, optimized, self.route, 0, 0, traffic_snapshot.congestion_score)
        self._start_loop()
        payload = self.snapshot("dispatch")
        await self.manager.broadcast(payload)
        return DispatchResponse(
            dispatch_id=self.dispatch_id,
            route=self.route,
            intersections=self.intersections,
            vehicles=self.vehicle_agents,
            ambulances=self.ambulances,
            metrics=self.metrics,
            events=self.events[-8:],
        )

    def _start_loop(self) -> None:
        self._running = True
        if self._task and not self._task.done():
            self._task.cancel()
        self._task = asyncio.create_task(self._run())

    async def _run(self) -> None:
        tick = 0
        meters_per_tick = (self.speed_kmph / 3.6) * self.tick_seconds
        travelled = 0.0
        while self._running and self.route and travelled <= self.distance_m:
            tick += 1
            travelled = min(self.distance_m, travelled + meters_per_tick * (1.25 if tick > 5 else 0.72))
            point, route_index = point_at_distance(self.route, travelled)
            progress = travelled / max(self.distance_m, 1)
            self.intersections, signal_events = self.signals.update(self.intersections, point, progress)
            self.vehicle_agents, rerouted_now, vehicle_events = self.vehicles.update(self.vehicle_agents, point, self.route, tick)
            active_signals = sum(1 for signal in self.intersections if signal.state.value == "GREEN")
            traffic_snapshot = self.traffic.score(self.route, self.vehicle_agents, progress)
            remaining = max(0, self.distance_m - travelled)
            normal_eta, optimized_eta = self.eta.estimate(remaining, self.speed_kmph, traffic_snapshot.congestion_score, active_signals)
            for ambulance in self.ambulances:
                ambulance.lat = point.lat
                ambulance.lng = point.lng
                ambulance.progress = round(progress, 4)
                ambulance.route_index = route_index
                ambulance.speed_kmph = self.speed_kmph
                ambulance.eta_seconds = optimized_eta
                ambulance.optimized_eta_seconds = optimized_eta
                ambulance.normal_eta_seconds = normal_eta
            total_rerouted = sum(1 for vehicle in self.vehicle_agents if vehicle.status in {"REROUTING", "CLEARED"})
            self.metrics = self.traffic.metrics(
                normal_eta,
                optimized_eta,
                self.route,
                active_signals,
                total_rerouted,
                traffic_snapshot.congestion_score,
            )
            if tick % 3 == 0:
                self.events.append("Predictive signal timing recalibrated")
            self.events.extend(signal_events + vehicle_events)
            await self.manager.broadcast(self.snapshot("tick", heat_points=traffic_snapshot.heat_points))
            await asyncio.sleep(self.tick_seconds)
        for ambulance in self.ambulances:
            ambulance.progress = 1
        self.events.append("Ambulance reached destination. Corridor returning to normal control.")
        await self.manager.broadcast(self.snapshot("complete"))
        self._running = False

    async def manual_reroute(self) -> dict[str, Any]:
        ambulance = None
        if self.ambulances:
            active = self.ambulances[0]
            ambulance = RoutePoint(lat=active.lat, lng=active.lng)
        self.vehicle_agents, rerouted, events = self.vehicles.force_reroute(self.vehicle_agents, ambulance)
        self.events.extend(events)
        self.metrics.vehicles_rerouted = max(self.metrics.vehicles_rerouted, rerouted)
        snapshot = self.snapshot("manual_reroute")
        await self.manager.broadcast(snapshot)
        return snapshot

    def snapshot(self, event_type: str = "snapshot", **extra: Any) -> dict[str, Any]:
        return {
            "type": event_type,
            "dispatch_id": self.dispatch_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "route": [point.model_dump(mode="json") for point in self.route],
            "intersections": [signal.model_dump(mode="json") for signal in self.intersections],
            "vehicles": [vehicle.model_dump(mode="json") for vehicle in self.vehicle_agents],
            "ambulances": [ambulance.model_dump(mode="json") for ambulance in self.ambulances],
            "metrics": self.metrics.model_dump(mode="json"),
            "events": self.events[-18:],
            **extra,
        }

    def traffic_payload(self) -> dict[str, Any]:
        progress = self.ambulances[0].progress if self.ambulances else 0
        snapshot = self.traffic.score(self.route, self.vehicle_agents, progress) if self.route else None
        return {
            "congestion_score": snapshot.congestion_score if snapshot else 0,
            "density": snapshot.density if snapshot else 0,
            "heat_points": snapshot.heat_points if snapshot else [],
        }

    def optimize_payload(self) -> dict[str, Any]:
        return {
            "strategy": "proximity_green_wave",
            "priority_radius_m": 200,
            "prediction_window_m": 650,
            "route_confidence": self.metrics.route_confidence,
            "ai_efficiency": self.metrics.ai_efficiency,
            "recommendations": [
                "Hold cross traffic for ambulance-bearing approaches",
                "Propagate green state two intersections ahead",
                "Divert civilian vehicles away from active corridor",
            ],
        }

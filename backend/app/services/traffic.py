from __future__ import annotations

import math
from dataclasses import dataclass

from app.models import Metrics, RoutePoint, VehicleAgent
from app.services.geo import haversine_m, path_length_m


@dataclass
class TrafficSnapshot:
    congestion_score: float
    density: float
    heat_points: list[dict[str, float]]


class TrafficAnalysisService:
    def score(self, route: list[RoutePoint], vehicles: list[VehicleAgent], progress: float) -> TrafficSnapshot:
        route_len = max(path_length_m(route), 1)
        hot_zone = []
        density_hits = 0
        for idx, point in enumerate(route[:: max(1, len(route) // 28)]):
            wave = math.sin(progress * math.pi * 2 + idx * 0.61)
            intensity = 42 + 28 * (wave + 1) / 2
            nearby = sum(1 for vehicle in vehicles if haversine_m(point, RoutePoint(lat=vehicle.lat, lng=vehicle.lng)) < 380)
            density_hits += nearby
            hot_zone.append({"lat": point.lat, "lng": point.lng, "intensity": min(100, intensity + nearby * 7)})
        congestion = min(96, 36 + density_hits * 1.7 + (1 - progress) * 18 + route_len / 1000)
        return TrafficSnapshot(congestion_score=round(congestion, 1), density=density_hits / max(len(hot_zone), 1), heat_points=hot_zone)

    def metrics(
        self,
        normal_eta_s: int,
        optimized_eta_s: int,
        route: list[RoutePoint],
        active_signals: int,
        rerouted: int,
        congestion_score: float,
    ) -> Metrics:
        reduction = max(0, (normal_eta_s - optimized_eta_s) / max(normal_eta_s, 1) * 100)
        efficiency = min(99.3, 63 + reduction * 0.72 + active_signals * 2.8 + rerouted * 0.18)
        confidence = min(98.8, 78 + active_signals * 1.4 + max(0, 60 - congestion_score) * 0.12)
        return Metrics(
            normal_eta_min=round(normal_eta_s / 60, 1),
            optimized_eta_min=round(optimized_eta_s / 60, 1),
            eta_reduction_pct=round(reduction, 1),
            active_signals=active_signals,
            vehicles_rerouted=rerouted,
            congestion_score=round(congestion_score, 1),
            ai_efficiency=round(efficiency, 1),
            corridor_length_km=round(path_length_m(route) / 1000, 2),
            route_confidence=round(confidence, 1),
        )

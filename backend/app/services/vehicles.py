from __future__ import annotations

import math
import random

from app.models import RoutePoint, VehicleAgent
from app.services.geo import bearing_degrees, haversine_m


class VehicleReroutingService:
    def seed_vehicles(self, route: list[RoutePoint], count: int = 34) -> list[VehicleAgent]:
        random.seed(92)
        vehicles: list[VehicleAgent] = []
        if not route:
            return vehicles
        for idx in range(count):
            base = route[round((len(route) - 1) * random.random())]
            lateral = random.choice([-1, 1]) * random.uniform(0.0008, 0.0028)
            forward = random.uniform(-0.0012, 0.0012)
            start = RoutePoint(lat=base.lat + forward, lng=base.lng + lateral)
            end = RoutePoint(lat=start.lat + random.uniform(-0.003, 0.003), lng=start.lng + random.choice([-1, 1]) * random.uniform(0.003, 0.006))
            vehicles.append(
                VehicleAgent(
                    id=f"CAR-{idx + 1:03d}",
                    lat=start.lat,
                    lng=start.lng,
                    bearing=bearing_degrees(start, end),
                    speed=random.uniform(18, 46),
                    route=[start, end],
                )
            )
        return vehicles

    def update(self, vehicles: list[VehicleAgent], ambulance: RoutePoint, route: list[RoutePoint], tick: int) -> tuple[list[VehicleAgent], int, list[str]]:
        rerouted = 0
        events: list[str] = []
        for index, vehicle in enumerate(vehicles):
            current = RoutePoint(lat=vehicle.lat, lng=vehicle.lng)
            distance = haversine_m(current, ambulance)
            if distance < 460 and vehicle.status in {"FLOWING", "ALERTED"}:
                vehicle.status = "REROUTING"
                vehicle.reroute_progress = 0
                if index % 6 == 0:
                    events.append(f"{vehicle.id} received alternate lane directive")
            elif distance < 800 and vehicle.status == "FLOWING":
                vehicle.status = "ALERTED"
            if vehicle.status == "REROUTING":
                rerouted += 1
                vehicle.reroute_progress = min(1, vehicle.reroute_progress + 0.06)
                side = -1 if index % 2 else 1
                vehicle.lng += side * 0.00017
                vehicle.lat += math.sin((tick + index) / 5) * 0.000035
                if vehicle.reroute_progress >= 1:
                    vehicle.status = "CLEARED"
            elif vehicle.status == "ALERTED":
                vehicle.lat += math.sin((tick + index) / 8) * 0.000025
                vehicle.lng += math.cos((tick + index) / 7) * 0.000025
            else:
                vehicle.lat += math.sin((tick + index) / 9) * 0.00002
                vehicle.lng += math.cos((tick + index) / 11) * 0.00002
        if rerouted and tick % 5 == 0:
            events.append("Emergency corridor cleared across priority lane group")
        return vehicles, rerouted, events

    def force_reroute(self, vehicles: list[VehicleAgent], ambulance: RoutePoint | None) -> tuple[list[VehicleAgent], int, list[str]]:
        events: list[str] = []
        selected: list[tuple[float, int, VehicleAgent]] = []
        for index, vehicle in enumerate(vehicles):
            if vehicle.status == "CLEARED":
                continue
            current = RoutePoint(lat=vehicle.lat, lng=vehicle.lng)
            distance = haversine_m(current, ambulance) if ambulance else index * 25
            selected.append((distance, index, vehicle))

        for distance, index, vehicle in sorted(selected, key=lambda item: item[0])[:14]:
            side = -1 if index % 2 else 1
            current = RoutePoint(lat=vehicle.lat, lng=vehicle.lng)
            escape = RoutePoint(lat=vehicle.lat + math.sin(index + 1) * 0.0018, lng=vehicle.lng + side * 0.0042)
            vehicle.status = "REROUTING"
            vehicle.reroute_progress = 0.18
            vehicle.route = [current, escape]
            vehicle.bearing = bearing_degrees(current, escape)
            vehicle.speed = max(vehicle.speed, 32)
            if len(events) < 5:
                events.append(f"{vehicle.id} forced onto alternate clearance path")

        events.append("Manual reroute command executed: emergency lane clearing now visible")
        return vehicles, min(14, len(selected)), events

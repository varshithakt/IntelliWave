from __future__ import annotations

from app.models import Intersection, RoutePoint, SignalState
from app.services.geo import haversine_m


class SignalOptimizationService:
    def generate_intersections(self, route: list[RoutePoint]) -> list[Intersection]:
        if len(route) < 3:
            return []
        indexes = [round((len(route) - 1) * ratio) for ratio in (0.15, 0.28, 0.41, 0.55, 0.69, 0.82, 0.93)]
        names = [
            "Cubbon Grid",
            "Richmond Sync",
            "Trinity Priority",
            "Domlur Pulse",
            "Koramangala Gate",
            "Madiwala Relay",
            "Trauma Bay Access",
        ]
        intersections = []
        used: set[int] = set()
        for sequence, index in enumerate(indexes):
            clamped = min(max(index, 0), len(route) - 1)
            if clamped in used:
                continue
            used.add(clamped)
            point = route[clamped]
            intersections.append(
                Intersection(
                    id=f"SIG-{sequence + 1:02d}",
                    name=names[sequence],
                    lat=point.lat,
                    lng=point.lng,
                    sequence_index=sequence,
                    confidence=round(0.8 + sequence * 0.024, 2),
                )
            )
        return intersections

    def update(self, intersections: list[Intersection], ambulance: RoutePoint, route_progress: float) -> tuple[list[Intersection], list[str]]:
        events: list[str] = []
        for signal in intersections:
            distance = haversine_m(ambulance, RoutePoint(lat=signal.lat, lng=signal.lng))
            previous = signal.state
            signal.distance_to_ambulance_m = round(distance, 1)
            wave_front = signal.sequence_index / max(len(intersections), 1)
            if distance <= 200:
                signal.state = SignalState.green
                signal.countdown = max(7, int(24 - distance / 12))
            elif distance <= 650 or route_progress + 0.18 >= wave_front:
                signal.state = SignalState.predicted
                signal.countdown = max(4, int(distance / 26))
            elif previous == SignalState.green and distance > 260:
                signal.state = SignalState.cooling
                signal.countdown = 5
            else:
                signal.state = SignalState.standby
                signal.countdown = 0
            if signal.state != previous:
                events.append(f"{signal.name} switched to {signal.state.value}")
        return intersections, events

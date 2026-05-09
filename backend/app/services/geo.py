from __future__ import annotations

from math import atan2, cos, radians, sin, sqrt

from app.models import RoutePoint

EARTH_RADIUS_M = 6_371_000


def haversine_m(a: RoutePoint, b: RoutePoint) -> float:
    lat1 = radians(a.lat)
    lat2 = radians(b.lat)
    dlat = radians(b.lat - a.lat)
    dlng = radians(b.lng - a.lng)
    h = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlng / 2) ** 2
    return 2 * EARTH_RADIUS_M * atan2(sqrt(h), sqrt(1 - h))


def path_length_m(points: list[RoutePoint]) -> float:
    return sum(haversine_m(points[i], points[i + 1]) for i in range(len(points) - 1))


def interpolate(a: RoutePoint, b: RoutePoint, t: float) -> RoutePoint:
    clamped = max(0, min(1, t))
    return RoutePoint(lat=a.lat + (b.lat - a.lat) * clamped, lng=a.lng + (b.lng - a.lng) * clamped)


def bearing_degrees(a: RoutePoint, b: RoutePoint) -> float:
    lat1 = radians(a.lat)
    lat2 = radians(b.lat)
    dlng = radians(b.lng - a.lng)
    y = sin(dlng) * cos(lat2)
    x = cos(lat1) * sin(lat2) - sin(lat1) * cos(lat2) * cos(dlng)
    return (atan2(y, x) * 180 / 3.141592653589793 + 360) % 360


def point_at_distance(points: list[RoutePoint], distance_m: float) -> tuple[RoutePoint, int]:
    if not points:
        raise ValueError("Route requires at least one point")
    if len(points) == 1:
        return points[0], 0
    walked = 0.0
    for index in range(len(points) - 1):
        segment = haversine_m(points[index], points[index + 1])
        if walked + segment >= distance_m:
            local_t = (distance_m - walked) / max(segment, 1)
            return interpolate(points[index], points[index + 1], local_t), index
        walked += segment
    return points[-1], len(points) - 1

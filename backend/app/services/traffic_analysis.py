import math
import random
from app.models.route_models import RouteGeo

BASE_INTENSITY = [24, 35, 50, 68, 82, 95]

def score_congestion(route: dict | None) -> int:
    if not route:
        return 36
    density = len(route["geometry"]) / 6
    score = int(min(98, (route["distance"] / 600) + density + random.uniform(0, 10)))
    return max(18, score)

def build_congestion_heatmap(route: dict, ambulance: dict | None) -> list:
    if not route:
        return []
    points = []
    total = len(route["geometry"])
    for index, coord in enumerate(route["geometry"]):
        intensity = int(BASE_INTENSITY[index % len(BASE_INTENSITY)] + (index / total) * 30)
        if ambulance and index >= int(ambulance["progress"] * total) - 4:
            intensity += 18
        points.append({"position": coord, "value": min(100, intensity)})
    return points

def build_signal_map(route: dict) -> list:
    if not route:
        return []
    points = []
    step = max(4, len(route["geometry"]) // 8)
    for index in range(0, len(route["geometry"]), step):
        points.append(route["geometry"][index])
    return points

def distance(a: tuple[float, float], b: tuple[float, float]) -> float:
    dx = a[0] - b[0]
    dy = a[1] - b[1]
    return math.sqrt(dx * dx + dy * dy) * 111000

import httpx
from app.models.route_models import RouteGeo, RouteStep

OSRM_BASE = "https://router.project-osrm.org"

async def fetch_route(start: tuple[float, float], end: tuple[float, float]) -> dict:
    start_coord = f"{start[1]},{start[0]}"
    end_coord = f"{end[1]},{end[0]}"
    url = f"{OSRM_BASE}/route/v1/driving/{start_coord};{end_coord}?overview=full&geometries=geojson&steps=true"
    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.get(url)
        response.raise_for_status()
        payload = response.json()

    routes = payload.get("routes")
    if not routes:
        return {}

    route = routes[0]
    coords = [(lat, lon) for lon, lat in route["geometry"]["coordinates"]]
    steps = []
    for leg in route.get("legs", []):
        for step in leg.get("steps", []):
            steps.append(
                RouteStep(
                    name=step.get("name", "Unknown"),
                    maneuver=step.get("maneuver", {}).get("type", "move"),
                    distance=step.get("distance", 0.0),
                    duration=step.get("duration", 0.0),
                ).dict()
            )
    waypoints = coords[:: max(1, len(coords) // 12)]
    return RouteGeo(
        distance=route["distance"],
        duration=route["duration"],
        geometry=coords,
        waypoints=waypoints,
        steps=steps,
    ).dict()

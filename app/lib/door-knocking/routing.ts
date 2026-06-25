import type { Lead, RouteStop } from './types';
import { haversineDistanceFt } from './db';

// Nearest-neighbor TSP approximation (fast, good enough for < 50 stops)
export function optimizeRoute(origin: { lat: number; lng: number }, leads: Lead[]): RouteStop[] {
  if (!leads.length) return [];

  const remaining = [...leads];
  const ordered: Lead[] = [];
  let current = origin;

  while (remaining.length) {
    let closest = 0;
    let closestDist = haversineDistanceFt(current.lat, current.lng, remaining[0].lat, remaining[0].lng);

    for (let i = 1; i < remaining.length; i++) {
      const d = haversineDistanceFt(current.lat, current.lng, remaining[i].lat, remaining[i].lng);
      if (d < closestDist) {
        closestDist = d;
        closest = i;
      }
    }

    const next = remaining.splice(closest, 1)[0];
    ordered.push(next);
    current = { lat: next.lat, lng: next.lng };
  }

  return ordered.map((lead, i) => {
    const prevLat = i === 0 ? origin.lat : ordered[i - 1].lat;
    const prevLng = i === 0 ? origin.lng : ordered[i - 1].lng;
    const distanceFt = haversineDistanceFt(prevLat, prevLng, lead.lat, lead.lng);
    // average walking speed ~4 ft/s
    const estimatedWalkSeconds = Math.round(distanceFt / 4);
    return { lead, distanceFt, estimatedWalkSeconds, order: i + 1 };
  });
}

// Fetch actual turn-by-turn route from OSRM (public demo, free)
export async function fetchWalkingRoute(
  waypoints: Array<{ lat: number; lng: number }>
): Promise<{
  coordinates: [number, number][];
  totalDistanceFt: number;
  totalDurationSeconds: number;
} | null> {
  if (waypoints.length < 2) return null;

  const coords = waypoints.map((w) => `${w.lng},${w.lat}`).join(';');
  const url = `https://router.project-osrm.org/route/v1/foot/${coords}?overview=full&geometries=geojson`;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.routes?.length) return null;

    const route = data.routes[0];
    return {
      coordinates: route.geometry.coordinates.map(([lng, lat]: [number, number]) => [lat, lng]),
      totalDistanceFt: Math.round(route.distance * 3.28084),
      totalDurationSeconds: Math.round(route.duration),
    };
  } catch {
    return null;
  }
}

export function formatWalkTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

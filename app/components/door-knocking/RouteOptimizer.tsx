'use client';
import { useState } from 'react';
import type { Lead, RouteStop } from '@/app/lib/door-knocking/types';
import { optimizeRoute, fetchWalkingRoute, formatWalkTime } from '@/app/lib/door-knocking/routing';
import StatusBadge from './StatusBadge';

interface Props {
  leads: Lead[];
  originLat: number;
  originLng: number;
  onRouteGenerated?: (coords: [number, number][]) => void;
  onLeadSelect?: (lead: Lead) => void;
}

export default function RouteOptimizer({ leads, originLat, originLng, onRouteGenerated, onLeadSelect }: Props) {
  const [stops, setStops] = useState<RouteStop[]>([]);
  const [totalFt, setTotalFt] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function generateRoute() {
    if (!leads.length) return;
    setLoading(true);
    setError('');

    const optimized = optimizeRoute({ lat: originLat, lng: originLng }, leads);
    setStops(optimized);

    const total = optimized.reduce((s, r) => s + r.distanceFt, 0);
    const totalSecs = optimized.reduce((s, r) => s + r.estimatedWalkSeconds, 0);
    setTotalFt(total);
    setTotalTime(totalSecs);

    // Try to get real walking route from OSRM
    const waypoints = [
      { lat: originLat, lng: originLng },
      ...optimized.map((s) => ({ lat: s.lead.lat, lng: s.lead.lng })),
    ];

    try {
      const route = await fetchWalkingRoute(waypoints);
      if (route) {
        setTotalFt(route.totalDistanceFt);
        setTotalTime(route.totalDurationSeconds);
        onRouteGenerated?.(route.coordinates);
      } else {
        onRouteGenerated?.(waypoints.map((w) => [w.lat, w.lng]));
      }
    } catch {
      onRouteGenerated?.(waypoints.map((w) => [w.lat, w.lng]));
    }

    setLoading(false);
  }

  if (!leads.length) {
    return (
      <p className="text-gray-500 text-sm text-center py-4">No leads to route.</p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">{leads.length} stops</p>
          {stops.length > 0 && (
            <p className="text-xs text-gray-500">
              ~{Math.round(totalFt)} ft · {formatWalkTime(totalTime)} walk
            </p>
          )}
        </div>
        <button
          onClick={generateRoute}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors"
        >
          {loading ? 'Calculating…' : stops.length ? 'Recalculate' : 'Optimize Route'}
        </button>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      {stops.length > 0 && (
        <div className="space-y-2">
          {stops.map((stop, i) => (
            <button
              key={stop.lead.id ?? i}
              onClick={() => onLeadSelect?.(stop.lead)}
              className="w-full text-left rounded-xl p-3 border border-gray-700 bg-gray-800/50 hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-blue-900/60 border border-blue-700 flex items-center justify-center text-xs font-bold text-blue-300 shrink-0">
                  {stop.order}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">{stop.lead.address}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <StatusBadge status={stop.lead.status} size="sm" />
                    <span className="text-xs text-gray-500">
                      {Math.round(stop.distanceFt)} ft · {formatWalkTime(stop.estimatedWalkSeconds)}
                    </span>
                  </div>
                </div>
                <svg className="w-4 h-4 text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

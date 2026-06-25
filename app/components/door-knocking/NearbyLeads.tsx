'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getLeadsNear, haversineDistanceFt } from '@/app/lib/door-knocking/db';
import type { Lead, NearbyLead, RadiusOption } from '@/app/lib/door-knocking/types';
import { STATUS_LABELS, STATUS_COLORS, RADIUS_LABELS } from '@/app/lib/door-knocking/types';
import StatusBadge from './StatusBadge';

interface Props {
  lat: number;
  lng: number;
  excludeLeadId?: number;
  radius?: RadiusOption;
  onRadiusChange?: (r: RadiusOption) => void;
  showRadiusSelector?: boolean;
}

const RADIUS_OPTIONS: RadiusOption[] = [250, 500, 1320, 2640, 5280];

export default function NearbyLeads({
  lat,
  lng,
  excludeLeadId,
  radius = 500,
  onRadiusChange,
  showRadiusSelector = true,
}: Props) {
  const router = useRouter();
  const [nearby, setNearby] = useState<NearbyLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRadius, setSelectedRadius] = useState<RadiusOption>(radius);

  const load = useCallback(async () => {
    setLoading(true);
    const leads = await getLeadsNear(lat, lng, selectedRadius);
    const results: NearbyLead[] = leads
      .filter((l) => l.id !== excludeLeadId)
      .map((l) => {
        const distanceFt = haversineDistanceFt(lat, lng, l.lat, l.lng);
        return {
          lead: l,
          distanceFt,
          distanceMi: distanceFt / 5280,
        };
      })
      .sort((a, b) => a.distanceFt - b.distanceFt)
      .slice(0, 20);
    setNearby(results);
    setLoading(false);
  }, [lat, lng, selectedRadius, excludeLeadId]);

  useEffect(() => { load(); }, [load]);

  function handleRadiusChange(r: RadiusOption) {
    setSelectedRadius(r);
    onRadiusChange?.(r);
  }

  function formatDistance(ft: number): string {
    if (ft < 1000) return `${Math.round(ft)} ft`;
    return `${(ft / 5280).toFixed(2)} mi`;
  }

  return (
    <div className="space-y-3">
      {showRadiusSelector && (
        <div className="flex gap-2 flex-wrap">
          {RADIUS_OPTIONS.map((r) => (
            <button
              key={r}
              onClick={() => handleRadiusChange(r)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedRadius === r
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {RADIUS_LABELS[r]}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : nearby.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-4">
          No leads within {RADIUS_LABELS[selectedRadius]}.
        </p>
      ) : (
        <div className="space-y-2">
          {nearby.map(({ lead, distanceFt }) => (
            <button
              key={lead.id}
              onClick={() => router.push(`/door-knocking/lead/${lead.id}`)}
              className="w-full text-left rounded-xl p-3 border border-gray-700 bg-gray-800/50 hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <p className="text-sm text-white font-medium truncate">{lead.address}</p>
                <span className="text-xs text-gray-400 shrink-0">{formatDistance(distanceFt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={lead.status} size="sm" />
                {lead.lastVisitDate && (
                  <span className="text-xs text-gray-500">
                    Last: {new Date(lead.lastVisitDate).toLocaleDateString()}
                  </span>
                )}
              </div>
              {lead.notes && (
                <p className="text-xs text-gray-400 mt-1 truncate">{lead.notes}</p>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { getLeadsNear, haversineDistanceFt } from '@/app/lib/door-knocking/db';
import type { Lead, LeadStatus } from '@/app/lib/door-knocking/types';
import { STATUS_LABELS, STATUS_COLORS } from '@/app/lib/door-knocking/types';
import StatusBadge from './StatusBadge';

const LeafletMap = dynamic(
  () => import('./LeafletMap'),
  { ssr: false, loading: () => <div className="h-64 bg-gray-900 rounded-xl animate-pulse" /> }
);

type MileRadius = 1 | 2 | 5 | 10;
type SortMode = 'closest' | 'oldest_followup' | 'needs_visit' | 'appointment';
type ViewMode = 'list' | 'map';

const MILE_RADII: MileRadius[] = [1, 2, 5, 10];

interface NearbyResult {
  lead: Lead;
  distanceFt: number;
  distanceMi: number;
}

interface Props {
  lat: number;
  lng: number;
  excludeLeadId?: number;
  // legacy props kept for compatibility but ignored
  radius?: number;
  onRadiusChange?: (r: number) => void;
  showRadiusSelector?: boolean;
}

export default function NearbyLeads({ lat, lng, excludeLeadId }: Props) {
  const router = useRouter();
  const [radius, setRadius] = useState<MileRadius>(2);
  const [sortMode, setSortMode] = useState<SortMode>('closest');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [statusFilters, setStatusFilters] = useState<LeadStatus[]>([]);
  const [allNearby, setAllNearby] = useState<NearbyResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const loadNearby = useCallback(async () => {
    setLoading(true);
    const leads = await getLeadsNear(lat, lng, radius * 5280);
    const results: NearbyResult[] = leads
      .filter((l) => l.id !== excludeLeadId && !(l.lat === 0 && l.lng === 0))
      .map((l) => {
        const distanceFt = haversineDistanceFt(lat, lng, l.lat, l.lng);
        return { lead: l, distanceFt, distanceMi: distanceFt / 5280 };
      })
      .filter(({ distanceMi }) => distanceMi <= radius);
    setAllNearby(results);
    setLoading(false);
  }, [lat, lng, radius, excludeLeadId]);

  useEffect(() => { loadNearby(); }, [loadNearby]);

  const now = new Date();

  const filtered = allNearby.filter(
    ({ lead }) => !statusFilters.length || statusFilters.includes(lead.status)
  );

  const sorted = [...filtered].sort((a, b) => {
    switch (sortMode) {
      case 'closest':
        return a.distanceFt - b.distanceFt;
      case 'oldest_followup': {
        const aDate = a.lead.followUpDate || '9999-99-99';
        const bDate = b.lead.followUpDate || '9999-99-99';
        return aDate.localeCompare(bDate);
      }
      case 'needs_visit': {
        const aDate = a.lead.lastVisitDate || '0000-00-00';
        const bDate = b.lead.lastVisitDate || '0000-00-00';
        return aDate.localeCompare(bDate);
      }
      case 'appointment': {
        const aDate = a.lead.followUpDate || '9999-99-99';
        const bDate = b.lead.followUpDate || '9999-99-99';
        return aDate.localeCompare(bDate);
      }
      default:
        return a.distanceFt - b.distanceFt;
    }
  });

  const followUpCount = allNearby.filter(
    ({ lead }) => lead.status === 'follow_up' || lead.status === 'no_answer'
  ).length;
  const hotCount = allNearby.filter(
    ({ lead }) => lead.status === 'interested' || lead.status === 'appointment_set'
  ).length;
  const newCount = allNearby.filter(
    ({ lead }) => lead.status === 'new' && lead.visitCount === 0
  ).length;

  function toggleStatus(s: LeadStatus) {
    setStatusFilters((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  }

  function formatDist(ft: number): string {
    if (ft < 1000) return `${Math.round(ft)} ft`;
    return `${(ft / 5280).toFixed(2)} mi`;
  }

  function navigateTo(address: string) {
    window.open(`https://maps.google.com/?q=${encodeURIComponent(address)}`, '_blank');
  }

  const statusCounts: Partial<Record<LeadStatus, number>> = {};
  allNearby.forEach(({ lead }) => {
    statusCounts[lead.status] = (statusCounts[lead.status] ?? 0) + 1;
  });

  return (
    <div className="space-y-3">
      {/* Radius + View toggle */}
      <div className="flex items-center gap-2">
        <div className="flex gap-1.5 flex-1">
          {MILE_RADII.map((r) => (
            <button
              key={r}
              onClick={() => { setRadius(r); setSelectedLead(null); }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors ${
                radius === r
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {r}mi
            </button>
          ))}
        </div>
        <div className="flex bg-gray-800 rounded-xl p-1 shrink-0">
          {(['list', 'map'] as ViewMode[]).map((v) => (
            <button
              key={v}
              onClick={() => setViewMode(v)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                viewMode === v ? 'bg-gray-600 text-white' : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              {v === 'list' ? '≡ List' : '🗺 Map'}
            </button>
          ))}
        </div>
      </div>

      {/* Count + smart suggestions */}
      {!loading && (
        <>
          <p className="text-sm text-gray-400">
            <span className="text-white font-bold">{filtered.length}</span>
            {statusFilters.length > 0 ? ' filtered' : ''} leads within {radius} mile{radius !== 1 ? 's' : ''}
            {allNearby.length !== filtered.length && (
              <span className="text-gray-600"> ({allNearby.length} total)</span>
            )}
          </p>

          {allNearby.length > 0 && (followUpCount > 0 || hotCount > 0 || newCount > 0) && (
            <div className="rounded-xl bg-blue-950/30 border border-blue-800/30 p-3 space-y-1.5">
              {followUpCount > 0 && (
                <button
                  onClick={() => setStatusFilters(['follow_up', 'no_answer'])}
                  className="w-full text-left text-xs text-blue-300 hover:text-blue-200 transition-colors"
                >
                  📅 <span className="font-bold">{followUpCount}</span> follow-up opportunit{followUpCount !== 1 ? 'ies' : 'y'} nearby — tap to filter
                </button>
              )}
              {hotCount > 0 && (
                <button
                  onClick={() => setStatusFilters(['interested', 'appointment_set'])}
                  className="w-full text-left text-xs text-green-300 hover:text-green-200 transition-colors"
                >
                  🔥 <span className="font-bold">{hotCount}</span> hot lead{hotCount !== 1 ? 's' : ''} nearby — tap to filter
                </button>
              )}
              {newCount > 0 && (
                <button
                  onClick={() => setStatusFilters(['new'])}
                  className="w-full text-left text-xs text-yellow-300 hover:text-yellow-200 transition-colors"
                >
                  🆕 <span className="font-bold">{newCount}</span> never-contacted nearby — tap to filter
                </button>
              )}
            </div>
          )}
        </>
      )}

      {/* Status filters */}
      {allNearby.length > 0 && (
        <div className="flex gap-1.5 flex-wrap">
          {(Object.keys(STATUS_LABELS) as LeadStatus[]).map((s) => {
            const count = statusCounts[s];
            if (!count) return null;
            const active = statusFilters.includes(s);
            const color = STATUS_COLORS[s];
            return (
              <button
                key={s}
                onClick={() => toggleStatus(s)}
                className="px-2.5 py-1 rounded-full text-xs font-medium transition-all"
                style={{
                  background: active ? color + '30' : 'transparent',
                  color: active ? color : '#6b7280',
                  border: `1px solid ${active ? color + '55' : '#374151'}`,
                }}
              >
                {STATUS_LABELS[s]} ({count})
              </button>
            );
          })}
          {statusFilters.length > 0 && (
            <button
              onClick={() => setStatusFilters([])}
              className="px-2.5 py-1 rounded-full text-xs text-gray-500 border border-gray-700 hover:text-gray-300 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* Sort options */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {([
          ['closest', 'Closest'],
          ['oldest_followup', 'Oldest Follow-Up'],
          ['needs_visit', 'Needs Visit'],
          ['appointment', 'Appointment Date'],
        ] as [SortMode, string][]).map(([mode, label]) => (
          <button
            key={mode}
            onClick={() => setSortMode(mode)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition-colors ${
              sortMode === mode
                ? 'bg-gray-600 text-white'
                : 'bg-gray-800/80 text-gray-500 hover:bg-gray-700 hover:text-gray-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Map View */}
      {viewMode === 'map' && (
        <div className="space-y-2">
          <LeafletMap
            leads={filtered.map(({ lead }) => lead)}
            userLat={lat}
            userLng={lng}
            selectedLeadId={selectedLead?.id}
            onLeadClick={setSelectedLead}
            height="280px"
          />
          {selectedLead && (
            <div className="rounded-xl bg-gray-800 border border-gray-700 p-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white leading-tight">{selectedLead.address}</p>
                  {selectedLead.ownerName && (
                    <p className="text-xs text-gray-400">{selectedLead.ownerName}</p>
                  )}
                </div>
                <StatusBadge status={selectedLead.status} size="sm" />
              </div>
              {selectedLead.followUpDate && (
                <p className="text-xs text-yellow-400">
                  📅 {new Date(selectedLead.followUpDate).toLocaleString('en-US', {
                    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
                  })}
                </p>
              )}
              {selectedLead.notes && (
                <p className="text-xs text-gray-400 italic line-clamp-2">&ldquo;{selectedLead.notes}&rdquo;</p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => router.push(`/door-knocking/lead/${selectedLead.id}`)}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-colors"
                >
                  Open Lead
                </button>
                <button
                  onClick={() => navigateTo(selectedLead.address)}
                  className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl text-xs transition-colors"
                  title="Navigate"
                >
                  🧭
                </button>
                {selectedLead.phone && (
                  <a
                    href={`tel:${selectedLead.phone}`}
                    className="px-3 py-2 bg-green-900/40 border border-green-700/40 text-green-300 rounded-xl text-xs"
                    title="Call"
                  >
                    📞
                  </a>
                )}
                {selectedLead.phone && (
                  <a
                    href={`sms:${selectedLead.phone}`}
                    className="px-3 py-2 bg-blue-900/40 border border-blue-700/40 text-blue-300 rounded-xl text-xs"
                    title="Text"
                  >
                    💬
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-gray-800 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-3xl mb-2">📍</p>
              <p className="text-gray-500 text-sm">
                No leads within {radius} mile{radius !== 1 ? 's' : ''}
                {statusFilters.length > 0 ? ' matching your filters' : ''}.
              </p>
              {statusFilters.length > 0 && (
                <button
                  onClick={() => setStatusFilters([])}
                  className="mt-2 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {sorted.map(({ lead, distanceFt }) => {
                const isExpanded = expandedId === lead.id;
                const overdueFollowUp = lead.followUpDate && new Date(lead.followUpDate) < now;
                return (
                  <div
                    key={lead.id}
                    className="rounded-2xl border border-gray-700/80 bg-gray-800/30 overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : (lead.id ?? null))}
                      className="w-full text-left p-3.5 hover:bg-gray-800/50 transition-colors"
                    >
                      <div className="flex items-start gap-2 mb-1.5">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white font-semibold leading-tight truncate">
                            {lead.address}
                          </p>
                          {lead.ownerName && (
                            <p className="text-xs text-gray-400 truncate">{lead.ownerName}</p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className="text-xs text-gray-400 font-medium">
                            {formatDist(distanceFt)}
                          </span>
                          <StatusBadge status={lead.status} size="sm" />
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        {lead.lastVisitDate && (
                          <span className="text-xs text-gray-500">
                            Last:{' '}
                            {new Date(lead.lastVisitDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        )}
                        <span className="text-xs text-gray-500">
                          {lead.visitCount} knock{lead.visitCount !== 1 ? 's' : ''}
                        </span>
                        {lead.followUpDate && (
                          <span
                            className={`text-xs ${
                              overdueFollowUp ? 'text-red-400' : 'text-yellow-400'
                            }`}
                          >
                            {overdueFollowUp ? '⚠️' : '📅'}{' '}
                            {new Date(lead.followUpDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        )}
                      </div>
                      {lead.notes && (
                        <p className="text-xs text-gray-500 mt-1.5 line-clamp-1 italic">
                          &ldquo;{lead.notes}&rdquo;
                        </p>
                      )}
                    </button>

                    {isExpanded && (
                      <div className="border-t border-gray-700/50 p-3 bg-gray-900/40 space-y-2.5">
                        {(lead.firstName || lead.lastName) && (
                          <p className="text-xs text-gray-300">
                            {lead.firstName} {lead.lastName}
                            {lead.phone && (
                              <span className="text-gray-500"> · {lead.phone}</span>
                            )}
                          </p>
                        )}
                        {lead.followUpDate && (
                          <p
                            className={`text-xs ${
                              overdueFollowUp ? 'text-red-300' : 'text-yellow-300'
                            }`}
                          >
                            📅{' '}
                            {new Date(lead.followUpDate).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                            {overdueFollowUp && ' (overdue)'}
                          </p>
                        )}
                        {lead.notes && (
                          <p className="text-xs text-gray-400 italic">&ldquo;{lead.notes}&rdquo;</p>
                        )}
                        <div className="grid grid-cols-4 gap-1.5">
                          <button
                            onClick={() => router.push(`/door-knocking/lead/${lead.id}`)}
                            className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-blue-900/30 border border-blue-700/30 text-blue-300 text-[11px] font-medium hover:bg-blue-900/50 transition-colors active:scale-95"
                          >
                            <span className="text-lg">📋</span>
                            Open
                          </button>
                          {lead.phone ? (
                            <a
                              href={`tel:${lead.phone}`}
                              className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-green-900/30 border border-green-700/30 text-green-300 text-[11px] font-medium hover:bg-green-900/50 transition-colors active:scale-95"
                            >
                              <span className="text-lg">📞</span>
                              Call
                            </a>
                          ) : (
                            <div className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-gray-800/50 text-gray-600 text-[11px]">
                              <span className="text-lg">📞</span>
                              Call
                            </div>
                          )}
                          {lead.phone ? (
                            <a
                              href={`sms:${lead.phone}`}
                              className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-purple-900/30 border border-purple-700/30 text-purple-300 text-[11px] font-medium hover:bg-purple-900/50 transition-colors active:scale-95"
                            >
                              <span className="text-lg">💬</span>
                              Text
                            </a>
                          ) : (
                            <div className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-gray-800/50 text-gray-600 text-[11px]">
                              <span className="text-lg">💬</span>
                              Text
                            </div>
                          )}
                          <button
                            onClick={() => navigateTo(lead.address)}
                            className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-orange-900/30 border border-orange-700/30 text-orange-300 text-[11px] font-medium hover:bg-orange-900/50 transition-colors active:scale-95"
                          >
                            <span className="text-lg">🧭</span>
                            Nav
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

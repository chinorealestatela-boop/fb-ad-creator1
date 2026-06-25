'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { getAllLeads } from '@/app/lib/door-knocking/db';
import { watchLocation } from '@/app/lib/door-knocking/gps';
import type { Lead, LeadStatus, GpsCoordinates, RadiusOption } from '@/app/lib/door-knocking/types';
import { STATUS_LABELS, STATUS_COLORS, RADIUS_LABELS } from '@/app/lib/door-knocking/types';
import RouteOptimizer from '@/app/components/door-knocking/RouteOptimizer';
import StatusBadge from '@/app/components/door-knocking/StatusBadge';

const LeafletMap = dynamic(
  () => import('@/app/components/door-knocking/LeafletMap'),
  { ssr: false, loading: () => <div className="h-full bg-gray-900 rounded-xl animate-pulse" /> }
);

const ALL_STATUSES: LeadStatus[] = [
  'new', 'no_answer', 'follow_up', 'interested',
  'appointment_set', 'not_interested', 'listing_signed',
];

const RADIUS_OPTIONS: RadiusOption[] = [250, 500, 1320, 2640, 5280];

type SidePanel = 'filters' | 'route' | 'lead' | null;

export default function MapPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [gps, setGps] = useState<GpsCoordinates | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [sidePanel, setSidePanel] = useState<SidePanel>(null);
  const [statusFilter, setStatusFilter] = useState<LeadStatus[]>([]);
  const [radius, setRadius] = useState<RadiusOption | null>(null);
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  const [showRoute, setShowRoute] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllLeads().then((l) => {
      setLeads(l);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const stop = watchLocation(
      (coords) => setGps(coords),
      () => {}
    );
    return stop;
  }, []);

  function toggleStatusFilter(s: LeadStatus) {
    setStatusFilter((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  }

  const leadsInView = leads.filter((l) => {
    if (statusFilter.length && !statusFilter.includes(l.status)) return false;
    return true;
  });

  const routeLeads = radius && gps
    ? leads.filter((l) => {
      const d = Math.sqrt((l.lat - gps.lat) ** 2 + (l.lng - gps.lng) ** 2) * 364000;
      return d <= radius;
    })
    : leadsInView;

  return (
    <div className="h-screen flex flex-col bg-gray-950">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-gray-900 border-b border-gray-800 shrink-0">
        <Link href="/door-knocking" className="text-gray-400 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="font-bold text-white flex-1">Knocked Houses Map</h1>
        <span className="text-xs text-gray-400">{leadsInView.length} leads</span>
        <button
          onClick={() => setSidePanel(sidePanel === 'filters' ? null : 'filters')}
          className={`p-2 rounded-xl transition-colors ${sidePanel === 'filters' ? 'bg-blue-700 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
          </svg>
        </button>
        <button
          onClick={() => setSidePanel(sidePanel === 'route' ? null : 'route')}
          className={`p-2 rounded-xl transition-colors ${sidePanel === 'route' ? 'bg-blue-700 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
        >
          🗺️
        </button>
      </div>

      {/* Filters Panel */}
      {sidePanel === 'filters' && (
        <div className="bg-gray-900 border-b border-gray-800 p-4 shrink-0">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-3">Status Filter</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {ALL_STATUSES.map((s) => {
              const active = statusFilter.includes(s);
              const color = STATUS_COLORS[s];
              return (
                <button
                  key={s}
                  onClick={() => toggleStatusFilter(s)}
                  className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                  style={{
                    background: active ? color + '33' : 'transparent',
                    color: active ? color : '#9ca3af',
                    border: `1px solid ${active ? color + '66' : '#374151'}`,
                  }}
                >
                  <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: color }} />
                  {STATUS_LABELS[s]}
                </button>
              );
            })}
            {statusFilter.length > 0 && (
              <button onClick={() => setStatusFilter([])} className="px-3 py-1 rounded-full text-xs text-gray-500 border border-gray-700 hover:text-white">
                Clear
              </button>
            )}
          </div>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-3">Radius</p>
          <div className="flex gap-2 flex-wrap">
            {RADIUS_OPTIONS.map((r) => (
              <button
                key={r}
                onClick={() => setRadius(radius === r ? null : r)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${radius === r ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
              >
                {RADIUS_LABELS[r]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Route Panel */}
      {sidePanel === 'route' && gps && (
        <div className="bg-gray-900 border-b border-gray-800 p-4 max-h-64 overflow-y-auto shrink-0">
          <RouteOptimizer
            leads={routeLeads}
            originLat={gps.lat}
            originLng={gps.lng}
            onRouteGenerated={(coords) => {
              setRouteCoords(coords);
              setShowRoute(true);
              setSidePanel(null);
            }}
            onLeadSelect={(lead) => {
              setSelectedLead(lead);
              setSidePanel('lead');
            }}
          />
        </div>
      )}

      {/* Map */}
      <div className="flex-1 relative min-h-0">
        {loading ? (
          <div className="h-full bg-gray-900 flex items-center justify-center">
            <p className="text-gray-400">Loading map…</p>
          </div>
        ) : (
          <LeafletMap
            leads={leads}
            userLat={gps?.lat}
            userLng={gps?.lng}
            selectedLeadId={selectedLead?.id}
            onLeadClick={(lead) => {
              setSelectedLead(lead);
              setSidePanel('lead');
            }}
            statusFilter={statusFilter.length ? statusFilter : undefined}
            radiusFilter={radius ?? undefined}
            showRoute={showRoute}
            routeCoordinates={routeCoords}
            height="100%"
          />
        )}
      </div>

      {/* Legend */}
      <div className="bg-gray-900/90 backdrop-blur border-t border-gray-800 px-4 py-2 shrink-0">
        <div className="flex gap-3 overflow-x-auto scrollbar-none">
          {ALL_STATUSES.map((s) => {
            const count = leads.filter((l) => l.status === s).length;
            if (!count) return null;
            return (
              <div key={s} className="flex items-center gap-1.5 shrink-0">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[s] }} />
                <span className="text-xs text-gray-400">{STATUS_LABELS[s]} ({count})</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lead Detail Bottom Sheet */}
      {sidePanel === 'lead' && selectedLead && (
        <div className="absolute bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 rounded-t-2xl p-4 max-h-72 overflow-y-auto z-[1000]">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white text-sm">{selectedLead.address}</p>
              {selectedLead.ownerName && (
                <p className="text-xs text-gray-400 mt-0.5">Owner: {selectedLead.ownerName}</p>
              )}
            </div>
            <button onClick={() => setSidePanel(null)} className="text-gray-500 hover:text-white ml-2 shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <StatusBadge status={selectedLead.status} />
          {selectedLead.notes && <p className="text-sm text-gray-300 mt-2">{selectedLead.notes}</p>}
          <div className="flex gap-2 mt-3 text-xs text-gray-500">
            {selectedLead.lastVisitDate && <span>Last: {new Date(selectedLead.lastVisitDate).toLocaleDateString()}</span>}
            {selectedLead.phone && <span>📞 {selectedLead.phone}</span>}
          </div>
          <Link
            href={`/door-knocking/lead/${selectedLead.id}`}
            className="block mt-3 text-center py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-colors"
          >
            Open Lead
          </Link>
        </div>
      )}
    </div>
  );
}

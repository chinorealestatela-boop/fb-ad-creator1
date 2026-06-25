'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { watchLocation, accuracyLabel } from '@/app/lib/door-knocking/gps';
import { getLeadsNear, saveLead, recordVisit, addActivity, haversineDistanceFt } from '@/app/lib/door-knocking/db';
import { fetchPropertyOwnerInfo } from '@/app/lib/door-knocking/property';
import type { GpsCoordinates, Lead, LeadStatus, PropertyOwnerInfo } from '@/app/lib/door-knocking/types';
import { STATUS_COLORS } from '@/app/lib/door-knocking/types';
import StatusBadge from './StatusBadge';
import PropertyOwnerInfoCard from './PropertyOwnerInfo';

const DETECTION_RADIUS_FT = 50; // auto-snap to nearest lead within 50 ft

export default function DoorKnockingMode() {
  const router = useRouter();
  const [active, setActive] = useState(false);
  const [gps, setGps] = useState<GpsCoordinates | null>(null);
  const [gpsError, setGpsError] = useState('');
  const [address, setAddress] = useState('');
  const [currentLead, setCurrentLead] = useState<Lead | null>(null);
  const [nearbyLeads, setNearbyLeads] = useState<Lead[]>([]);
  const [ownerInfo, setOwnerInfo] = useState<PropertyOwnerInfo | null>(null);
  const [status, setStatus] = useState<LeadStatus>('no_answer');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const stopWatchRef = useRef<(() => void) | null>(null);
  const lastGeocodedRef = useRef<{ lat: number; lng: number } | null>(null);

  const geocodeAndLoad = useCallback(async (lat: number, lng: number) => {
    const lastGeo = lastGeocodedRef.current;
    if (lastGeo) {
      const ft = haversineDistanceFt(lastGeo.lat, lastGeo.lng, lat, lng);
      if (ft < 30) return; // Don't re-geocode if haven't moved 30ft
    }
    lastGeocodedRef.current = { lat, lng };

    setGeocoding(true);
    try {
      const res = await fetch(`/api/door-knocking/geocode?lat=${lat}&lng=${lng}`);
      const data = await res.json();
      const addr = data.address || '';
      setAddress(addr);

      // Check for nearby existing leads
      const nearby = await getLeadsNear(lat, lng, 500);
      setNearbyLeads(nearby);

      // Auto-snap to a very close lead
      const snapped = nearby.find((l) => haversineDistanceFt(lat, lng, l.lat, l.lng) <= DETECTION_RADIUS_FT);
      if (snapped) {
        setCurrentLead(snapped);
        setStatus(snapped.status);
        setNotes(snapped.notes || '');
      } else {
        setCurrentLead(null);
        setStatus('no_answer');
        setNotes('');
      }

      // Load owner info
      if (addr) {
        setOwnerInfo({ currentOwnerName: '', previousOwners: [], loading: true });
        fetchPropertyOwnerInfo(addr, lat, lng)
          .then(setOwnerInfo)
          .catch(() => setOwnerInfo({ currentOwnerName: 'Unavailable', previousOwners: [], loading: false }));
      }
    } catch {
      // ignore
    }
    setGeocoding(false);
  }, []);

  useEffect(() => {
    if (!active) {
      stopWatchRef.current?.();
      stopWatchRef.current = null;
      return;
    }

    const stop = watchLocation(
      (coords) => {
        setGps(coords);
        setGpsError('');
        geocodeAndLoad(coords.lat, coords.lng);
      },
      (err) => setGpsError(err)
    );
    stopWatchRef.current = stop;

    return () => {
      stop();
      stopWatchRef.current = null;
    };
  }, [active, geocodeAndLoad]);

  async function handleQuickSave() {
    if (!gps || !address) return;
    setSaving(true);
    const now = Date.now();

    let leadId: number;

    if (currentLead?.id) {
      leadId = currentLead.id;
      await saveLead({
        ...currentLead,
        status,
        notes: notes || currentLead.notes || '',
        lastVisitDate: new Date().toISOString().split('T')[0],
        visitCount: currentLead.visitCount + 1,
        updatedAt: now,
      });
    } else {
      leadId = await saveLead({
        address,
        lat: gps.lat,
        lng: gps.lng,
        status,
        notes,
        visitCount: 1,
        lastVisitDate: new Date().toISOString().split('T')[0],
        ownerName: ownerInfo?.currentOwnerName,
        deedYear: ownerInfo?.currentDeedYear,
        previousOwners: ownerInfo?.previousOwners ?? [],
        createdAt: now,
        updatedAt: now,
        synced: false,
      });
    }

    await recordVisit({
      leadId,
      timestamp: now,
      lat: gps.lat,
      lng: gps.lng,
      notes,
      statusAfter: status,
    });

    if (notes) {
      await addActivity({ leadId, type: 'note', timestamp: now, data: { note: notes } });
    }

    setNotes('');
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (!active) {
    return (
      <button
        onClick={() => setActive(true)}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold text-lg shadow-xl transition-all active:scale-95"
      >
        🚪 Start Door Knocking Mode
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-blue-700/40 bg-blue-950/20 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-sm font-semibold text-green-400">Door Knocking Active</span>
        </div>
        <button
          onClick={() => setActive(false)}
          className="text-xs text-gray-500 hover:text-gray-300 px-2 py-1 rounded-lg hover:bg-gray-800 transition-colors"
        >
          Stop
        </button>
      </div>

      {/* GPS status */}
      {gps && (
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span className="text-blue-400">📍</span>
          {accuracyLabel(gps.accuracy)} accuracy (±{Math.round(gps.accuracy / 0.3048)} ft)
          {geocoding && <span className="text-yellow-400 ml-1">Getting address…</span>}
        </div>
      )}
      {gpsError && <p className="text-sm text-red-400">{gpsError}</p>}

      {/* Current address */}
      {address && (
        <div className="rounded-xl bg-gray-800/80 border border-gray-700 p-3">
          <p className="text-xs text-gray-400 mb-1">Current Property</p>
          <p className="text-white font-semibold text-base">{address}</p>
          {currentLead ? (
            <p className="text-xs text-blue-400 mt-1">Previously visited • {currentLead.visitCount} knock{currentLead.visitCount !== 1 ? 's' : ''}</p>
          ) : (
            <p className="text-xs text-green-400 mt-1">New Property</p>
          )}
        </div>
      )}

      {/* Owner info */}
      {ownerInfo && <PropertyOwnerInfoCard info={ownerInfo} />}

      {/* Quick status */}
      <div>
        <p className="text-xs text-gray-400 mb-2">Quick Status</p>
        <StatusBadge status={status} interactive onChange={setStatus} />
      </div>

      {/* Quick notes */}
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Tap to add notes…"
        rows={2}
        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
      />

      {/* Save */}
      <button
        onClick={handleQuickSave}
        disabled={saving || !address}
        className={`w-full py-3.5 rounded-xl font-bold text-base transition-all ${
          saved
            ? 'bg-green-600 text-white'
            : 'bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white'
        }`}
      >
        {saving ? 'Saving…' : saved ? '✓ Saved!' : '💾 Save This Knock'}
      </button>

      {/* Nearby leads */}
      {nearbyLeads.length > 0 && (
        <div>
          <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wider">
            {nearbyLeads.length} Nearby Lead{nearbyLeads.length !== 1 ? 's' : ''}
          </p>
          <div className="space-y-2">
            {nearbyLeads.slice(0, 5).map((lead) => {
              const dist = gps
                ? haversineDistanceFt(gps.lat, gps.lng, lead.lat, lead.lng)
                : 0;
              const color = STATUS_COLORS[lead.status];
              return (
                <button
                  key={lead.id}
                  onClick={() => router.push(`/door-knocking/lead/${lead.id}`)}
                  className="w-full text-left rounded-xl p-3 bg-gray-800/60 border border-gray-700 hover:bg-gray-800 flex items-center gap-3 transition-colors"
                >
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{lead.address}</p>
                    <p className="text-xs text-gray-400">{Math.round(dist)} ft away</p>
                  </div>
                  <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

'use client';
import { useEffect, useRef, useState } from 'react';
import type { Lead, LeadStatus, RadiusOption } from '@/app/lib/door-knocking/types';
import { STATUS_COLORS, STATUS_LABELS, RADIUS_LABELS } from '@/app/lib/door-knocking/types';
import { haversineDistanceFt } from '@/app/lib/door-knocking/db';

interface Props {
  leads: Lead[];
  userLat?: number;
  userLng?: number;
  selectedLeadId?: number;
  onLeadClick?: (lead: Lead) => void;
  radiusFilter?: RadiusOption;
  statusFilter?: LeadStatus[];
  showRoute?: boolean;
  routeCoordinates?: [number, number][];
  height?: string;
}

let L: typeof import('leaflet') | null = null;

export default function LeafletMap({
  leads,
  userLat,
  userLng,
  selectedLeadId,
  onLeadClick,
  radiusFilter,
  statusFilter,
  showRoute,
  routeCoordinates,
  height = '100%',
}: Props) {
  const mapRef = useRef<import('leaflet').Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<import('leaflet').Layer[]>([]);
  const routeLayerRef = useRef<import('leaflet').Polyline | null>(null);
  const userMarkerRef = useRef<import('leaflet').CircleMarker | null>(null);
  const radiusCircleRef = useRef<import('leaflet').Circle | null>(null);
  const [ready, setReady] = useState(false);

  // Dynamically load Leaflet (not SSR safe)
  useEffect(() => {
    if (L) { setReady(true); return; }
    import('leaflet').then((mod) => {
      L = mod.default ?? mod;
      // Load CSS
      if (!document.querySelector('#leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }
      setReady(true);
    });
  }, []);

  // Initialize map
  useEffect(() => {
    if (!ready || !containerRef.current || mapRef.current || !L) return;

    const centerLat = userLat ?? leads[0]?.lat ?? 34.0195;
    const centerLng = userLng ?? leads[0]?.lng ?? -118.4912;

    mapRef.current = L.map(containerRef.current, {
      center: [centerLat, centerLng],
      zoom: 16,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(mapRef.current);

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [ready]);

  // Update user location marker
  useEffect(() => {
    if (!mapRef.current || !L || userLat === undefined || userLng === undefined) return;
    userMarkerRef.current?.remove();
    userMarkerRef.current = L.circleMarker([userLat, userLng], {
      radius: 8,
      fillColor: '#3b82f6',
      color: '#fff',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.9,
    }).addTo(mapRef.current);

    // Radius circle
    if (radiusFilter) {
      radiusCircleRef.current?.remove();
      const radiusM = radiusFilter * 0.3048;
      radiusCircleRef.current = L.circle([userLat, userLng], {
        radius: radiusM,
        color: '#3b82f6',
        fillColor: '#3b82f6',
        fillOpacity: 0.05,
        weight: 1,
        dashArray: '4 4',
      }).addTo(mapRef.current);
    } else {
      radiusCircleRef.current?.remove();
      radiusCircleRef.current = null;
    }
  }, [userLat, userLng, radiusFilter, ready]);

  // Update lead markers
  useEffect(() => {
    if (!mapRef.current || !L) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const filtered = leads.filter((l) => {
      if (statusFilter?.length && !statusFilter.includes(l.status)) return false;
      if (radiusFilter && userLat !== undefined && userLng !== undefined) {
        return haversineDistanceFt(userLat, userLng, l.lat, l.lng) <= radiusFilter;
      }
      return true;
    });

    filtered.forEach((lead) => {
      if (!L || !mapRef.current) return;
      const color = STATUS_COLORS[lead.status];
      const isSelected = lead.id === selectedLeadId;

      const icon = L.divIcon({
        className: '',
        html: `<div style="
          width:${isSelected ? 22 : 16}px;
          height:${isSelected ? 22 : 16}px;
          background:${color};
          border:2px solid ${isSelected ? '#fff' : 'rgba(255,255,255,0.6)'};
          border-radius:50%;
          box-shadow:0 1px 4px rgba(0,0,0,0.4);
          cursor:pointer;
          transition:all 0.1s;
        "></div>`,
        iconSize: [isSelected ? 22 : 16, isSelected ? 22 : 16],
        iconAnchor: [isSelected ? 11 : 8, isSelected ? 11 : 8],
      });

      const marker = L.marker([lead.lat, lead.lng], { icon });

      const lastVisit = lead.lastVisitDate
        ? new Date(lead.lastVisitDate).toLocaleDateString()
        : 'Never';

      const popupHtml = `
        <div style="font-family:sans-serif;min-width:200px;padding:2px">
          <p style="font-weight:700;font-size:13px;margin:0 0 4px">${lead.address}</p>
          <p style="color:${color};font-size:11px;font-weight:600;margin:0 0 4px">${STATUS_LABELS[lead.status]}</p>
          ${lead.ownerName ? `<p style="font-size:12px;margin:0 0 2px">Owner: ${lead.ownerName}</p>` : ''}
          <p style="font-size:12px;color:#555;margin:0 0 2px">Last Visit: ${lastVisit}</p>
          ${lead.followUpDate ? `<p style="font-size:12px;color:#555;margin:0 0 2px">Follow-up: ${new Date(lead.followUpDate).toLocaleDateString()}</p>` : ''}
          ${lead.notes ? `<p style="font-size:12px;margin:4px 0 0;border-top:1px solid #eee;padding-top:4px">${lead.notes}</p>` : ''}
          ${lead.phone ? `<p style="font-size:12px;margin:2px 0 0">📞 ${lead.phone}</p>` : ''}
        </div>
      `;

      marker.bindPopup(popupHtml, { maxWidth: 260 });
      marker.on('click', () => {
        onLeadClick?.(lead);
      });

      marker.addTo(mapRef.current!);
      markersRef.current.push(marker);
    });
  }, [leads, selectedLeadId, statusFilter, radiusFilter, userLat, userLng, ready, onLeadClick]);

  // Route polyline
  useEffect(() => {
    if (!mapRef.current || !L) return;
    routeLayerRef.current?.remove();
    routeLayerRef.current = null;
    if (showRoute && routeCoordinates?.length) {
      routeLayerRef.current = L.polyline(routeCoordinates, {
        color: '#3b82f6',
        weight: 4,
        opacity: 0.8,
        dashArray: undefined,
      }).addTo(mapRef.current);
      mapRef.current.fitBounds(routeLayerRef.current.getBounds(), { padding: [40, 40] });
    }
  }, [showRoute, routeCoordinates, ready]);

  // Center on user or selected lead
  useEffect(() => {
    if (!mapRef.current) return;
    if (selectedLeadId) {
      const lead = leads.find((l) => l.id === selectedLeadId);
      if (lead) mapRef.current.setView([lead.lat, lead.lng], 17);
    } else if (userLat !== undefined && userLng !== undefined) {
      mapRef.current.setView([userLat, userLng], 16);
    }
  }, [selectedLeadId, userLat, userLng, leads]);

  return (
    <div
      ref={containerRef}
      style={{ height, width: '100%', background: '#1a1a2e' }}
      className="rounded-xl overflow-hidden"
    />
  );
}

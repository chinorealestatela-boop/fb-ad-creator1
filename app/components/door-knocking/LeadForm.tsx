'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { saveLead, recordVisit, addActivity } from '@/app/lib/door-knocking/db';
import { fetchPropertyOwnerInfo } from '@/app/lib/door-knocking/property';
import type { Lead, LeadStatus, GpsCoordinates, PropertyOwnerInfo } from '@/app/lib/door-knocking/types';
import GpsLocationButton from './GpsLocationButton';
import StatusBadge from './StatusBadge';
import PropertyOwnerInfoCard from './PropertyOwnerInfo';

interface Props {
  initial?: Partial<Lead>;
  gpsCoords?: GpsCoordinates;
  mode?: 'create' | 'edit';
  onSaved?: (lead: Lead & { id: number }) => void;
}

const DEFAULT_LEAD: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'synced'> = {
  address: '',
  lat: 0,
  lng: 0,
  status: 'new',
  visitCount: 0,
  notes: '',
  phone: '',
  email: '',
  firstName: '',
  lastName: '',
  followUpDate: '',
};

export default function LeadForm({ initial, gpsCoords, mode = 'create', onSaved }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({ ...DEFAULT_LEAD, ...initial });
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    gpsCoords ? { lat: gpsCoords.lat, lng: gpsCoords.lng } : null
  );
  const [ownerInfo, setOwnerInfo] = useState<PropertyOwnerInfo | null>(null);
  const [saving, setSaving] = useState(false);
  const [addressConfirmed, setAddressConfirmed] = useState(false);
  const [notes, setNotes] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);

  // Auto-load owner info when address is confirmed
  useEffect(() => {
    if (!addressConfirmed || !form.address) return;

    setOwnerInfo({ currentOwnerName: '', previousOwners: [], loading: true });
    fetchPropertyOwnerInfo(form.address, coords?.lat, coords?.lng)
      .then((info) => {
        setOwnerInfo(info);
        setForm((f) => ({
          ...f,
          ownerName: info.currentOwnerName && info.currentOwnerName !== 'Unknown'
            ? info.currentOwnerName
            : f.ownerName,
          deedYear: info.currentDeedYear ?? f.deedYear,
          previousOwners: info.previousOwners.length ? info.previousOwners : f.previousOwners,
        }));
      })
      .catch(() => {
        setOwnerInfo({
          currentOwnerName: 'Unavailable',
          previousOwners: [],
          loading: false,
          error: 'Could not retrieve property data.',
        });
      });
  }, [addressConfirmed]);

  function handleGpsLocation(c: GpsCoordinates, address: string, neighborhood: string, city: string) {
    setCoords({ lat: c.lat, lng: c.lng });
    setForm((f) => ({
      ...f,
      address: address || f.address,
      neighborhood: neighborhood || f.neighborhood,
      city: city || f.city,
    }));
    if (address) setAddressConfirmed(true);
  }

  function handleAddressBlur() {
    if (form.address.trim().length > 5) setAddressConfirmed(true);
  }

  function handlePhotoCapture(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSave() {
    if (!form.address.trim()) return;
    if (!coords?.lat && !initial?.lat) return;

    setSaving(true);
    const now = Date.now();

    const leadData: Omit<Lead, 'id'> = {
      ...form,
      lat: coords?.lat ?? initial?.lat ?? 0,
      lng: coords?.lng ?? initial?.lng ?? 0,
      notes: notes || form.notes || '',
      photos: photo ? [photo, ...(form.photos ?? [])] : (form.photos ?? []),
      lastVisitDate: new Date().toISOString().split('T')[0],
      visitCount: (form.visitCount ?? 0) + (mode === 'create' ? 1 : 0),
      ownerName: form.ownerName || ownerInfo?.currentOwnerName || '',
      deedYear: form.deedYear || ownerInfo?.currentDeedYear,
      previousOwners: form.previousOwners?.length ? form.previousOwners : (ownerInfo?.previousOwners ?? []),
      createdAt: initial?.createdAt ?? now,
      updatedAt: now,
      synced: false,
    };

    const id = await saveLead(leadData);

    if (mode === 'create') {
      await recordVisit({
        leadId: id,
        timestamp: now,
        lat: coords?.lat ?? 0,
        lng: coords?.lng ?? 0,
        notes: notes,
        statusAfter: form.status,
      });
    }

    if (notes) {
      await addActivity({
        leadId: id,
        type: 'note',
        timestamp: now,
        data: { note: notes },
      });
    }

    const saved = { ...leadData, id } as Lead & { id: number };
    if (onSaved) {
      onSaved(saved);
    } else {
      router.push(`/door-knocking/lead/${id}`);
    }
    setSaving(false);
  }

  return (
    <div className="space-y-5">
      {/* GPS Button */}
      <GpsLocationButton onLocation={handleGpsLocation} variant="button" />

      {/* Address */}
      <div>
        <label className="block text-xs text-gray-400 mb-1.5 font-medium uppercase tracking-wider">Property Address *</label>
        <input
          type="text"
          value={form.address}
          onChange={(e) => {
            setForm((f) => ({ ...f, address: e.target.value }));
            setAddressConfirmed(false);
          }}
          onBlur={handleAddressBlur}
          placeholder="123 Main St, Los Angeles, CA"
          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
        />
        {coords && (
          <p className="text-xs text-green-400 mt-1">
            GPS: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
          </p>
        )}
      </div>

      {/* Property Owner Info — auto-loads after address */}
      {ownerInfo && <PropertyOwnerInfoCard info={ownerInfo} />}

      {/* Status */}
      <div>
        <label className="block text-xs text-gray-400 mb-1.5 font-medium uppercase tracking-wider">Status</label>
        <StatusBadge
          status={form.status}
          interactive
          onChange={(s) => setForm((f) => ({ ...f, status: s }))}
        />
      </div>

      {/* Quick Note */}
      <div>
        <label className="block text-xs text-gray-400 mb-1.5 font-medium uppercase tracking-wider">Notes</label>
        <textarea
          value={notes || form.notes || ''}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Quick notes about this visit…"
          rows={3}
          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
        />
      </div>

      {/* Contact */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">First Name</label>
          <input
            type="text"
            value={form.firstName || ''}
            onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">Last Name</label>
          <input
            type="text"
            value={form.lastName || ''}
            onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">Phone</label>
          <input
            type="tel"
            value={form.phone || ''}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">Email</label>
          <input
            type="email"
            value={form.email || ''}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Follow-up date */}
      <div>
        <label className="block text-xs text-gray-400 mb-1.5">Follow-Up Date</label>
        <input
          type="date"
          value={form.followUpDate || ''}
          onChange={(e) => setForm((f) => ({ ...f, followUpDate: e.target.value }))}
          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Photo */}
      <div>
        <label className="block text-xs text-gray-400 mb-1.5">Photo</label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoCapture}
            className="hidden"
          />
          <span className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-800 border border-gray-700 hover:bg-gray-750 text-sm text-gray-300 transition-colors">
            📷 {photo ? 'Photo captured' : 'Take / Upload Photo'}
          </span>
          {photo && <span className="text-xs text-green-400">✓</span>}
        </label>
        {photo && (
          <img src={photo} alt="Property" className="mt-2 rounded-xl max-h-32 object-cover" />
        )}
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={saving || !form.address.trim()}
        className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-base transition-colors"
      >
        {saving ? 'Saving…' : mode === 'create' ? 'Save Lead' : 'Update Lead'}
      </button>
    </div>
  );
}

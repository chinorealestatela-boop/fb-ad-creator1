'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { getLead, saveLead, recordVisit, addActivity, deleteLead } from '@/app/lib/door-knocking/db';
import type { Lead, LeadStatus, PropertyOwnerInfo } from '@/app/lib/door-knocking/types';
import { STATUS_LABELS } from '@/app/lib/door-knocking/types';
import { fetchPropertyOwnerInfo } from '@/app/lib/door-knocking/property';
import StatusBadge from '@/app/components/door-knocking/StatusBadge';
import PropertyOwnerInfoCard from '@/app/components/door-knocking/PropertyOwnerInfo';
import ActivityTimeline from '@/app/components/door-knocking/ActivityTimeline';
import NearbyLeads from '@/app/components/door-knocking/NearbyLeads';

const LeafletMap = dynamic(
  () => import('@/app/components/door-knocking/LeafletMap'),
  { ssr: false }
);

type Tab = 'details' | 'nearby' | 'timeline';

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const leadId = parseInt(id, 10);

  const [lead, setLead] = useState<Lead | null>(null);
  const [ownerInfo, setOwnerInfo] = useState<PropertyOwnerInfo | null>(null);
  const [tab, setTab] = useState<Tab>('details');
  const [editing, setEditing] = useState(false);
  const [editStatus, setEditStatus] = useState<LeadStatus>('no_answer');
  const [editNotes, setEditNotes] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editFollowUp, setEditFollowUp] = useState('');
  const [saving, setSaving] = useState(false);
  const [addingNote, setAddingNote] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!leadId) return;
    getLead(leadId).then((l) => {
      if (!l) { router.push('/door-knocking'); return; }
      setLead(l);
      setEditStatus(l.status);
      setEditNotes(l.notes || '');
      setEditPhone(l.phone || '');
      setEditEmail(l.email || '');
      setEditFollowUp(l.followUpDate || '');
      setLoading(false);

      // Load owner info
      if (l.address) {
        setOwnerInfo({ currentOwnerName: '', previousOwners: [], loading: true });
        fetchPropertyOwnerInfo(l.address, l.lat, l.lng)
          .then(setOwnerInfo)
          .catch(() => setOwnerInfo({ currentOwnerName: l.ownerName || 'Unknown', previousOwners: l.previousOwners || [], loading: false }));
      }
    });
  }, [leadId, router]);

  async function handleSave() {
    if (!lead) return;
    setSaving(true);
    const now = Date.now();
    const prevStatus = lead.status;

    const updated: Lead = {
      ...lead,
      status: editStatus,
      notes: editNotes,
      phone: editPhone,
      email: editEmail,
      followUpDate: editFollowUp,
      updatedAt: now,
      synced: false,
    };

    await saveLead(updated);

    if (prevStatus !== editStatus) {
      await addActivity({
        leadId: lead.id!,
        type: 'status_change',
        timestamp: now,
        data: { from: prevStatus, to: editStatus },
      });
    }

    setLead(updated);
    setEditing(false);
    setSaving(false);
  }

  async function handleRecordVisit() {
    if (!lead?.id) return;
    const now = Date.now();
    await recordVisit({
      leadId: lead.id,
      timestamp: now,
      lat: lead.lat,
      lng: lead.lng,
      notes: addingNote,
      statusBefore: lead.status,
      statusAfter: lead.status,
    });
    if (addingNote) {
      await addActivity({ leadId: lead.id, type: 'note', timestamp: now, data: { note: addingNote } });
    }
    const today = new Date().toISOString().split('T')[0];
    const updated = { ...lead, visitCount: lead.visitCount + 1, lastVisitDate: today, updatedAt: now };
    await saveLead(updated);
    setLead(updated);
    setAddingNote('');
  }

  async function handleDelete() {
    if (!lead?.id) return;
    await deleteLead(lead.id);
    router.push('/door-knocking');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="text-gray-400 animate-pulse">Loading…</div>
      </div>
    );
  }

  if (!lead) return null;

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--foreground)] pb-24 max-w-lg mx-auto">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-4 pt-4 pb-3">
        <div className="flex items-center gap-3 mb-3">
          <Link href="/door-knocking" className="text-gray-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-white text-sm leading-tight">{lead.address}</h1>
            {lead.city && <p className="text-xs text-gray-400">{lead.city}</p>}
          </div>
          <button
            onClick={() => setEditing(!editing)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${editing ? 'bg-gray-700 text-white' : 'bg-blue-600/20 border border-blue-700/50 text-blue-300'}`}
          >
            {editing ? 'Cancel' : 'Edit'}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status={lead.status} />
          <span className="text-xs text-gray-500">{lead.visitCount} knock{lead.visitCount !== 1 ? 's' : ''}</span>
          {lead.lastVisitDate && (
            <span className="text-xs text-gray-500">Last: {new Date(lead.lastVisitDate).toLocaleDateString()}</span>
          )}
        </div>
      </div>

      {/* Map snippet */}
      <div className="h-36">
        <LeafletMap
          leads={[lead]}
          userLat={lead.lat}
          userLng={lead.lng}
          selectedLeadId={lead.id}
          height="144px"
        />
      </div>

      {/* Owner info */}
      <div className="px-4 pt-4">
        {ownerInfo && <PropertyOwnerInfoCard info={ownerInfo} />}
      </div>

      {/* Quick visit log */}
      <div className="px-4 pt-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={addingNote}
            onChange={(e) => setAddingNote(e.target.value)}
            placeholder="Add a note & log visit…"
            className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500"
            onKeyDown={(e) => e.key === 'Enter' && handleRecordVisit()}
          />
          <button
            onClick={handleRecordVisit}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-colors whitespace-nowrap"
          >
            Log Visit
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-800 mt-4 px-4">
        {(['details', 'nearby', 'timeline'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 ${
              tab === t ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="px-4 pt-4">
        {/* Details Tab */}
        {tab === 'details' && (
          <div className="space-y-4">
            {editing ? (
              <>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Status</label>
                  <StatusBadge status={editStatus} interactive onChange={setEditStatus} />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Notes</label>
                  <textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    rows={3}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5">Phone</label>
                    <input type="tel" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5">Email</label>
                    <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Follow-Up Date</label>
                  <input type="date" value={editFollowUp} onChange={(e) => setEditFollowUp(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold transition-colors"
                >
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </>
            ) : (
              <>
                <div className="space-y-3">
                  {lead.notes && (
                    <div className="rounded-xl bg-gray-800/60 border border-gray-700 p-3">
                      <p className="text-xs text-gray-400 mb-1">Notes</p>
                      <p className="text-sm text-white">{lead.notes}</p>
                    </div>
                  )}
                  {(lead.phone || lead.email) && (
                    <div className="rounded-xl bg-gray-800/60 border border-gray-700 p-3 space-y-1">
                      <p className="text-xs text-gray-400 mb-1">Contact</p>
                      {lead.firstName && <p className="text-sm text-white">{lead.firstName} {lead.lastName}</p>}
                      {lead.phone && <a href={`tel:${lead.phone}`} className="text-sm text-blue-400 block">📞 {lead.phone}</a>}
                      {lead.email && <a href={`mailto:${lead.email}`} className="text-sm text-blue-400 block">✉️ {lead.email}</a>}
                    </div>
                  )}
                  {lead.followUpDate && (
                    <div className="rounded-xl bg-yellow-950/30 border border-yellow-800/40 p-3">
                      <p className="text-xs text-yellow-400 mb-1">Follow-Up Scheduled</p>
                      <p className="text-sm text-white">{new Date(lead.followUpDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                    </div>
                  )}
                  {lead.photos?.length ? (
                    <div>
                      <p className="text-xs text-gray-400 mb-2">Photos</p>
                      <div className="grid grid-cols-3 gap-2">
                        {lead.photos.map((p, i) => (
                          <img key={i} src={p} alt="" className="rounded-xl aspect-square object-cover" />
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>

                {/* Delete */}
                <div className="pt-4 border-t border-gray-800">
                  {confirmDelete ? (
                    <div className="flex gap-3">
                      <button onClick={() => setConfirmDelete(false)} className="flex-1 py-2.5 rounded-xl bg-gray-800 text-gray-300 text-sm font-medium">Cancel</button>
                      <button onClick={handleDelete} className="flex-1 py-2.5 rounded-xl bg-red-700 hover:bg-red-600 text-white text-sm font-medium transition-colors">Delete Lead</button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmDelete(true)} className="text-xs text-red-500 hover:text-red-400 transition-colors">Delete this lead</button>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Nearby Tab */}
        {tab === 'nearby' && (
          <NearbyLeads
            lat={lead.lat}
            lng={lead.lng}
            excludeLeadId={lead.id}
            showRadiusSelector
          />
        )}

        {/* Timeline Tab */}
        {tab === 'timeline' && lead.id && (
          <ActivityTimeline leadId={lead.id} />
        )}
      </div>
    </main>
  );
}

'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { getAllLeads, getAllPendingFollowUps } from '@/app/lib/door-knocking/db';
import type { Lead, LeadStatus, FollowUp } from '@/app/lib/door-knocking/types';
import { STATUS_LABELS, STATUS_COLORS } from '@/app/lib/door-knocking/types';
import dynamic from 'next/dynamic';
import StatusBadge from '@/app/components/door-knocking/StatusBadge';
import FollowUpList from '@/app/components/door-knocking/FollowUpList';

const DoorKnockingMode = dynamic(
  () => import('@/app/components/door-knocking/DoorKnockingMode'),
  { ssr: false }
);

function formatDateTime(dateStr?: string) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function formatDate(dateStr?: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

type DashTab = 'leads' | 'followups';

export default function DoorKnockingDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<LeadStatus | 'all'>('all');
  const [searchQ, setSearchQ] = useState('');
  const [dashTab, setDashTab] = useState<DashTab>('leads');

  const reload = useCallback(async () => {
    const [l, fu] = await Promise.all([getAllLeads(), getAllPendingFollowUps()]);
    setLeads(l.sort((a, b) => b.updatedAt - a.updatedAt));
    setFollowUps(fu);
    setLoading(false);
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const filtered = leads.filter((l) => {
    if (filter !== 'all' && l.status !== filter) return false;
    if (searchQ && !l.address.toLowerCase().includes(searchQ.toLowerCase())) return false;
    return true;
  });

  // Save the current filtered lead order to sessionStorage so the detail page
  // can navigate prev/next without going back to this list.
  function saveLeadList() {
    try {
      sessionStorage.setItem(
        'dk_lead_list',
        JSON.stringify(filtered.map((l) => l.id).filter(Boolean))
      );
    } catch {}
  }

  const stats: Record<LeadStatus, number> = {
    new: 0, no_answer: 0, follow_up: 0, interested: 0,
    appointment_set: 0, not_interested: 0, listing_signed: 0,
  };
  leads.forEach((l) => { stats[l.status]++; });

  const topStatuses: LeadStatus[] = ['appointment_set', 'listing_signed', 'interested', 'follow_up'];

  const leadsMap = new Map(leads.map((l) => [l.id!, l]));

  const now = new Date();
  const overdueCount = followUps.filter((f) => new Date(f.scheduledAt) < now).length;
  const todayCount = followUps.filter((f) => {
    const d = new Date(f.scheduledAt);
    return d >= now && d.toDateString() === now.toDateString();
  }).length;

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--foreground)] p-4 pb-24 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pt-2">
        <div>
          <h1 className="text-2xl font-bold text-white">🚪 Door Knocking</h1>
          <p className="text-sm text-gray-400">{leads.length} total leads</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/door-knocking/map"
            className="p-2.5 rounded-xl bg-gray-800 border border-gray-700 hover:bg-gray-700 transition-colors"
            title="Map View"
          >
            🗺️
          </Link>
          <Link
            href="/door-knocking/lead/new"
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors"
          >
            + New Lead
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 mb-5">
        {topStatuses.map((s) => (
          <div
            key={s}
            className="rounded-xl p-3 border"
            style={{ borderColor: STATUS_COLORS[s] + '33', background: STATUS_COLORS[s] + '11' }}
          >
            <p className="text-2xl font-bold" style={{ color: STATUS_COLORS[s] }}>{stats[s]}</p>
            <p className="text-xs text-gray-400">{STATUS_LABELS[s]}</p>
          </div>
        ))}
      </div>

      {/* Follow-up alerts */}
      {(overdueCount > 0 || todayCount > 0) && (
        <button
          onClick={() => setDashTab('followups')}
          className="w-full mb-5 rounded-xl border border-yellow-700/40 bg-yellow-950/20 px-4 py-3 flex items-center justify-between text-left"
        >
          <div>
            {overdueCount > 0 && (
              <p className="text-sm font-semibold text-red-400">⚠️ {overdueCount} overdue follow-up{overdueCount !== 1 ? 's' : ''}</p>
            )}
            {todayCount > 0 && (
              <p className="text-sm font-semibold text-yellow-400">📅 {todayCount} due today</p>
            )}
          </div>
          <span className="text-xs text-gray-400">View all →</span>
        </button>
      )}

      {/* Door Knocking Mode */}
      <div className="mb-5">
        <DoorKnockingMode />
      </div>

      {/* Dashboard tabs */}
      <div className="flex gap-1 mb-4 bg-gray-800/50 rounded-xl p-1">
        <button
          onClick={() => setDashTab('leads')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            dashTab === 'leads' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Leads
        </button>
        <button
          onClick={() => setDashTab('followups')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors relative ${
            dashTab === 'followups' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Follow-Ups
          {followUps.length > 0 && (
            <span className="absolute top-1 right-2 min-w-[18px] h-[18px] rounded-full bg-yellow-500 text-black text-[10px] font-bold flex items-center justify-center px-1">
              {followUps.length}
            </span>
          )}
        </button>
      </div>

      {/* Follow-Ups Tab */}
      {dashTab === 'followups' && (
        <FollowUpList
          followUps={followUps}
          leads={leadsMap}
          showAddress
          onUpdated={(updatedLead) => {
            setLeads((prev) => prev.map((l) => l.id === updatedLead.id ? updatedLead : l));
            getAllPendingFollowUps().then(setFollowUps);
          }}
        />
      )}

      {/* Leads Tab */}
      {dashTab === 'leads' && (
        <>
          {/* Search + Filter */}
          <div className="space-y-3 mb-4">
            <input
              type="search"
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              placeholder="Search addresses…"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm"
            />
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition-colors ${
                  filter === 'all' ? 'bg-white text-gray-900' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                All ({leads.length})
              </button>
              {(Object.keys(STATUS_LABELS) as LeadStatus[]).map((s) =>
                stats[s] > 0 ? (
                  <button
                    key={s}
                    onClick={() => setFilter(s)}
                    className="px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition-colors flex items-center gap-1"
                    style={{
                      background: filter === s ? STATUS_COLORS[s] + '33' : 'transparent',
                      color: filter === s ? STATUS_COLORS[s] : '#9ca3af',
                      border: `1px solid ${filter === s ? STATUS_COLORS[s] + '66' : '#374151'}`,
                    }}
                  >
                    {STATUS_LABELS[s]} ({stats[s]})
                  </button>
                ) : null
              )}
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 bg-gray-800 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-3">🏠</p>
              <p className="text-gray-400">
                {leads.length === 0 ? 'No leads yet. Start knocking!' : 'No leads match your filter.'}
              </p>
              {leads.length === 0 && (
                <Link
                  href="/door-knocking/lead/new"
                  className="inline-block mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-colors"
                >
                  Add First Lead
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((lead) => (
                <Link
                  key={lead.id}
                  href={`/door-knocking/lead/${lead.id}`}
                  onClick={saveLeadList}
                  className="block rounded-2xl p-4 border border-gray-700 bg-gray-800/40 hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-white font-medium text-sm leading-tight">{lead.address}</p>
                    <StatusBadge status={lead.status} size="sm" />
                  </div>
                  {lead.ownerName && (
                    <p className="text-xs text-gray-400 mb-1">Owner: {lead.ownerName}</p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>Last: {formatDate(lead.lastVisitDate)}</span>
                    <span>{lead.visitCount} knock{lead.visitCount !== 1 ? 's' : ''}</span>
                    {lead.followUpDate && (
                      <span className="text-yellow-500">
                        📅 {formatDateTime(lead.followUpDate)}
                      </span>
                    )}
                  </div>
                  {lead.notes && (
                    <p className="text-xs text-gray-400 mt-1.5 truncate">{lead.notes}</p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </>
      )}

      {/* Nav back */}
      <div className="mt-8 pt-4 border-t border-gray-800">
        <Link href="/" className="text-xs text-gray-500 hover:text-gray-400 transition-colors">
          ← Back to FB Ad Creator
        </Link>
      </div>
    </main>
  );
}

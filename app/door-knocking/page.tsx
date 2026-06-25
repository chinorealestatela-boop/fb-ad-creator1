'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAllLeads } from '@/app/lib/door-knocking/db';
import type { Lead, LeadStatus } from '@/app/lib/door-knocking/types';
import { STATUS_LABELS, STATUS_COLORS } from '@/app/lib/door-knocking/types';
import dynamic from 'next/dynamic';
import StatusBadge from '@/app/components/door-knocking/StatusBadge';

const DoorKnockingMode = dynamic(
  () => import('@/app/components/door-knocking/DoorKnockingMode'),
  { ssr: false }
);

function formatDate(dateStr?: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function DoorKnockingDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<LeadStatus | 'all'>('all');
  const [searchQ, setSearchQ] = useState('');

  useEffect(() => {
    getAllLeads().then((l) => {
      setLeads(l.sort((a, b) => b.updatedAt - a.updatedAt));
      setLoading(false);
    });
  }, []);

  const filtered = leads.filter((l) => {
    if (filter !== 'all' && l.status !== filter) return false;
    if (searchQ && !l.address.toLowerCase().includes(searchQ.toLowerCase())) return false;
    return true;
  });

  const stats: Record<LeadStatus, number> = {
    new: 0, no_answer: 0, follow_up: 0, interested: 0,
    appointment_set: 0, not_interested: 0, listing_signed: 0,
  };
  leads.forEach((l) => { stats[l.status]++; });

  const topStatuses: LeadStatus[] = ['appointment_set', 'listing_signed', 'interested', 'follow_up'];

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--foreground)] p-4 pb-24 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pt-2">
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
      <div className="grid grid-cols-2 gap-2 mb-6">
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

      {/* Door Knocking Mode */}
      <div className="mb-6">
        <DoorKnockingMode />
      </div>

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
          {(Object.keys(STATUS_LABELS) as LeadStatus[]).map((s) => (
            stats[s] > 0 && (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition-colors flex items-center gap-1`}
                style={{
                  background: filter === s ? STATUS_COLORS[s] + '33' : 'transparent',
                  color: filter === s ? STATUS_COLORS[s] : '#9ca3af',
                  border: `1px solid ${filter === s ? STATUS_COLORS[s] + '66' : '#374151'}`,
                }}
              >
                {STATUS_LABELS[s]} ({stats[s]})
              </button>
            )
          ))}
        </div>
      </div>

      {/* Lead List */}
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
                  <span className="text-yellow-500">Follow-up: {formatDate(lead.followUpDate)}</span>
                )}
              </div>
              {lead.notes && (
                <p className="text-xs text-gray-400 mt-1.5 truncate">{lead.notes}</p>
              )}
            </Link>
          ))}
        </div>
      )}

      {/* Nav back to FB Ads */}
      <div className="mt-8 pt-4 border-t border-gray-800">
        <Link href="/" className="text-xs text-gray-500 hover:text-gray-400 transition-colors">
          ← Back to FB Ad Creator
        </Link>
      </div>
    </main>
  );
}
